import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase-server'
import { computeProfileMembership } from '@/lib/stripe-membership'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { interval = 'month' } = body as { interval?: 'month' | 'year' } // 'month' | 'year'

    if (interval !== 'month' && interval !== 'year') {
      return new NextResponse('Invalid interval', { status: 400 })
    }

    // Select Price ID based on interval
    let priceId = process.env.STRIPE_PRICE_ID_MONTHLY || process.env.STRIPE_PRICE_ID
    if (interval === 'year') {
      priceId = process.env.STRIPE_PRICE_ID_YEARLY || process.env.STRIPE_PRICE_ID
    }

    if (!priceId) {
      console.error('[CHECKOUT_ERROR] Missing Price ID')
      return new NextResponse(
        'Missing Stripe Price ID. Please configure STRIPE_PRICE_ID_MONTHLY in .env.',
        { status: 500 }
      )
    }

    // Fetch customer ID from Supabase profile if available
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Validate if the customer exists in the current Stripe environment (Test vs Live)
    if (customerId) {
      try {
        const customer = await stripe.customers.retrieve(customerId)
        // If the customer is deleted, treat as invalid
        if (customer.deleted) {
          customerId = null
        }
      } catch (error) {
        // If retrieval fails (e.g., ID is from Test Mode but we are now in Live Mode), reset ID
        console.warn(
          '[CHECKOUT] Invalid Stripe Customer ID (likely mode mismatch), creating new one.',
          error
        )
        customerId = null
      }
    }

    // If no customer ID (or it was invalid/reset), create one in Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save the new customer ID to the user's profile in Supabase
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    // 统一回跳：优先用发起请求页面的 referer（包含 locale 路径），避免 /focuslab 404
    // 注意：不信任 referer 的 origin，避免 open redirect；仅在同源时使用其 pathname。
    const referer = req.headers.get('referer')
    const requestUrl = new URL(req.url)
    const baseOrigin =
      req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin
    let returnBase = new URL('/en/focuslab/app', baseOrigin)
    if (referer) {
      try {
        const r = new URL(referer)
        if (r.origin === baseOrigin) {
          returnBase = new URL(r.pathname, baseOrigin)
        }
      } catch {
        // ignore invalid referer
      }
    }

    // 防重复订阅：若同一 customer 已存在 active/trialing，则直接引导去 Portal 管理
    const existingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
    })
    const existing = computeProfileMembership(
      existingSubs.data.map((s) => ({
        id: s.id,
        status: s.status,
        created: s.created,
        current_period_end: s.items.data[0]?.current_period_end ?? null,
      }))
    )
    if (existing.isPro) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnBase.toString(),
      })
      return NextResponse.json({ url: portal.url })
    }

    const session = await stripe.checkout.sessions.create({
      success_url: new URL('?success=true', returnBase).toString(),
      cancel_url: new URL('?canceled=true', returnBase).toString(),
      customer: customerId,
      allow_promotion_codes: true,
      payment_method_collection: 'always',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId: user.id,
        },
      },
      metadata: {
        userId: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[STRIPE_CHECKOUT]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
