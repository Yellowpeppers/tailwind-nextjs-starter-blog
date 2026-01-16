import { createClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stripe_customer_id from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ interval: null })
    }

    // Get Active Stripe subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 1,
      expand: ['data.items.data.price'],
    })

    const sub = subscriptions.data[0]
    if (!sub) {
      return NextResponse.json({ interval: null })
    }

    // items.data[0].price.recurring.interval
    // e.g. 'month' or 'year'
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const subAny = sub as any
    const interval = subAny.items.data[0].price.recurring?.interval

    return NextResponse.json({
      interval,
      current_period_end: subAny.current_period_end,
      cancel_at_period_end: subAny.cancel_at_period_end, // if user cancelled but still active
      status: subAny.status,
    })
  } catch (error) {
    console.error('[API] Subscription check failed:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
