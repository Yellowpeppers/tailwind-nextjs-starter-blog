import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const subscriptionId = session.subscription as string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription: any = await stripe.subscriptions.retrieve(subscriptionId)
    const userId = session.metadata?.userId

    console.log(`[Webhook] Checkout completed. User: ${userId}, Sub: ${subscriptionId}`)

    if (userId) {
      const supabase = await createAdminClient()
      const { error, count } = await supabase
        .from('profiles')
        .update({
          stripe_customer_id: subscription.customer as string,
          subscription_status: 'premium',
          subscription_end_date: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : new Date().toISOString(),
        })
        .eq('id', userId)
        .select() // Add select to get data back for count

      if (error) {
        console.error('[Webhook] Supabase update failed:', error)
      } else {
        console.log('[Webhook] Supabase update success. Rows:', count)
      }
    } else {
      console.error('[Webhook] No userId in metadata')
    }
  }

  if (event.type === 'customer.subscription.updated') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription: any = event.data.object
    // Ideally we should find the user by strip_customer_id but metadata is safer if available.
    // However subscription object might not have metadata if not passed during creation.
    // For now we assume we can find user by customer_id if we stored it previously.

    // NOTE: This relies on stripe_customer_id being unique and present.
    const supabase = await createAdminClient()
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'premium', // or check subscription.status
        subscription_end_date: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : new Date().toISOString(),
      })
      .eq('stripe_customer_id', subscription.customer as string)
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const supabase = await createAdminClient()
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'free',
        subscription_end_date: null,
      })
      .eq('stripe_customer_id', subscription.customer as string)
  }

  return new NextResponse(null, { status: 200 })
}
