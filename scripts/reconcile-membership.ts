import Stripe from 'stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import fs from 'node:fs'

type ProfileRow = {
  id: string
  email: string | null
  stripe_customer_id: string | null
  subscription_status: string | null
  subscription_end_date: string | null
}

function loadEnvFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue
      const idx = line.indexOf('=')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      let val = line.slice(idx + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // ignore
  }
}

function mask(value: unknown) {
  if (!value) return null
  const s = String(value)
  if (s.length <= 10) return s
  return `${s.slice(0, 3)}…${s.slice(-4)}`
}

function pickPrimaryProSubscription(subs: Stripe.Subscription[]): Stripe.Subscription | null {
  const pro = subs.filter((s) => s.status === 'active' || s.status === 'trialing')
  if (pro.length === 0) return null
  return [...pro].sort((a, b) => (b.created ?? 0) - (a.created ?? 0))[0]
}

function toIsoFromUnixSeconds(value: number | null | undefined) {
  if (!value || value <= 0) return null
  return new Date(value * 1000).toISOString()
}

async function main() {
  loadEnvFile('.env')
  loadEnvFile('.env.local')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const stripeKey = process.env.STRIPE_SECRET_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  if (!stripeKey) throw new Error('Missing STRIPE_SECRET_KEY')

  const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })
  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-01-27.acacia' as unknown as Stripe.StripeConfig['apiVersion'],
  })

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, stripe_customer_id, subscription_status, subscription_end_date')
    .not('stripe_customer_id', 'is', null)
    .returns<ProfileRow[]>()

  if (error) throw error

  const rows = profiles ?? []

  let updatedProfiles = 0
  let clearedPremium = 0
  let grantedPremium = 0
  let duplicateCustomers = 0
  let canceledDuplicates = 0

  for (const p of rows) {
    const customerId = p.stripe_customer_id
    if (!customerId) continue

    let subs: Stripe.Subscription[] = []
    try {
      const list = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 100,
      })
      subs = list.data
    } catch (e) {
      console.warn('[reconcile] failed to list subscriptions for customer', mask(customerId), e)
      continue
    }

    const primary = pickPrimaryProSubscription(subs)
    const isPro = !!primary
    const nextStatus = isPro ? 'premium' : 'free'
    const nextEndDate = isPro
      ? toIsoFromUnixSeconds(primary!.items.data[0]?.current_period_end)
      : null

    const needsUpdate =
      (p.subscription_status || 'free') !== nextStatus ||
      (p.subscription_end_date || null) !== (nextEndDate || null)

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: nextStatus,
          subscription_end_date: nextEndDate,
        })
        .eq('id', p.id)

      if (updateError) {
        console.warn('[reconcile] failed to update profile', mask(p.id), updateError)
      } else {
        updatedProfiles++
        if (nextStatus === 'premium' && p.subscription_status !== 'premium') grantedPremium++
        if (nextStatus === 'free' && p.subscription_status === 'premium') clearedPremium++
      }
    }

    // Cancel duplicate pro subscriptions (keep the newest one)
    const proSubs = subs
      .filter((s) => s.status === 'active' || s.status === 'trialing')
      .sort((a, b) => (b.created ?? 0) - (a.created ?? 0))

    if (proSubs.length > 1) {
      duplicateCustomers++
      const keep = proSubs[0]
      const toCancel = proSubs.slice(1)

      for (const sub of toCancel) {
        try {
          if (sub.cancel_at_period_end) continue
          await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true })
          canceledDuplicates++
          console.log(
            '[reconcile] set cancel_at_period_end for duplicate sub',
            mask(sub.id),
            'keep',
            mask(keep.id),
            'customer',
            mask(customerId)
          )
        } catch (e) {
          console.warn('[reconcile] failed to cancel duplicate sub', mask(sub.id), e)
        }
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        scannedProfilesWithCustomerId: rows.length,
        updatedProfiles,
        grantedPremium,
        clearedPremium,
        duplicateCustomers,
        canceledDuplicates,
      },
      null,
      2
    )
  )
}

main().catch((e) => {
  console.error('[reconcile] failed:', e?.message || e)
  process.exit(1)
})
