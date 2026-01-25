import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { computeProfileMembership } from '@/lib/stripe-membership'

type ProfileRow = {
  id: string
  email: string | null
  stripe_customer_id: string | null
  subscription_status: string | null
  subscription_end_date: string | null
}

export type SyncedMembership = {
  userId: string
  stripeCustomerId: string | null
  isPro: boolean
  subscriptionStatus: 'premium' | 'free'
  subscriptionEndDate: string | null
  activeOrTrialingCount: number
  primarySubscriptionId: string | null
}

function getServiceRoleSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

function buildStripeCustomerSearchQuery(userId: string, email?: string | null) {
  const clauses: string[] = [`metadata['supabase_user_id']:'${userId}'`]
  if (email) clauses.push(`email:'${email}'`)
  return clauses.join(' OR ')
}

async function resolveStripeCustomerId(params: {
  userId: string
  email?: string | null
  currentCustomerId?: string | null
}): Promise<string | null> {
  const { userId, email, currentCustomerId } = params

  // 1) Prefer existing customer id if it is still valid in current Stripe mode.
  if (currentCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(currentCustomerId)
      if (!customer.deleted) return customer.id
    } catch {
      // Most commonly: test/live mode mismatch.
    }
  }

  // 2) Search by metadata (preferred) and email (fallback).
  try {
    const search = await stripe.customers.search({
      query: buildStripeCustomerSearchQuery(userId, email),
      limit: 1,
    })
    const hit = search.data[0]
    if (hit) return hit.id
  } catch {
    // Search is not strictly required; we can still operate without a customer id.
  }

  return null
}

export async function syncMembershipForUser(params: {
  userId: string
  email?: string | null
}): Promise<SyncedMembership> {
  const supabase = getServiceRoleSupabase()
  const { userId, email } = params

  // 确保 profiles 行存在（避免 webhook/对账写入时找不到行）
  await supabase
    .from('profiles')
    .upsert(
      { id: userId, email, subscription_status: 'free' },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, stripe_customer_id, subscription_status, subscription_end_date')
    .eq('id', userId)
    .single<ProfileRow>()

  if (profileError || !profile) {
    throw new Error(profileError?.message || 'Failed to load profile')
  }

  const stripeCustomerId = await resolveStripeCustomerId({
    userId,
    email: email ?? profile.email,
    currentCustomerId: profile.stripe_customer_id,
  })

  // No Stripe customer => definitely free
  if (!stripeCustomerId) {
    if (profile.subscription_status !== 'free' || profile.subscription_end_date) {
      await supabase
        .from('profiles')
        .update({ subscription_status: 'free', subscription_end_date: null })
        .eq('id', userId)
    }

    return {
      userId,
      stripeCustomerId: null,
      isPro: false,
      subscriptionStatus: 'free',
      subscriptionEndDate: null,
      activeOrTrialingCount: 0,
      primarySubscriptionId: null,
    }
  }

  const subs = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'all',
    limit: 100,
  })

  const computed = computeProfileMembership(
    subs.data.map((s) => ({
      id: s.id,
      status: s.status,
      created: s.created,
      current_period_end: s.items.data[0]?.current_period_end ?? null,
    }))
  )

  const nextStatus = computed.subscriptionStatus
  const nextEndDate = nextStatus === 'premium' ? computed.subscriptionEndDate : null

  const needsUpdate =
    profile.stripe_customer_id !== stripeCustomerId ||
    profile.subscription_status !== nextStatus ||
    (profile.subscription_end_date || null) !== (nextEndDate || null)

  if (needsUpdate) {
    await supabase
      .from('profiles')
      .update({
        stripe_customer_id: stripeCustomerId,
        subscription_status: nextStatus,
        subscription_end_date: nextEndDate,
      })
      .eq('id', userId)
  }

  return {
    userId,
    stripeCustomerId,
    isPro: computed.isPro,
    subscriptionStatus: computed.subscriptionStatus,
    subscriptionEndDate: nextEndDate,
    activeOrTrialingCount: computed.activeOrTrialingCount,
    primarySubscriptionId: computed.primarySubscriptionId,
  }
}
