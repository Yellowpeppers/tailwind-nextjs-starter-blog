import { stripe } from '@/lib/stripe'
import { computeProfileMembership } from '@/lib/stripe-membership'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature')

  if (!signature) {
    return new NextResponse('Missing Stripe-Signature', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const supabase = await createAdminClient()

  const updateProfileByUserId = async (userId: string, payload: Record<string, unknown>) => {
    const { error, count } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
    if (error) console.error('[Webhook] Supabase update failed:', error)
    else console.log('[Webhook] Supabase update success. Rows:', count)
  }

  const updateProfileByCustomerId = async (
    customerId: string,
    payload: Record<string, unknown>
  ) => {
    const { error, count } = await supabase
      .from('profiles')
      .update(payload)
      .eq('stripe_customer_id', customerId)
      .select()
    if (error) console.error('[Webhook] Supabase update failed:', error)
    else console.log('[Webhook] Supabase update success. Rows:', count)
  }

  const syncCustomerMembershipToProfiles = async (params: {
    customerId: string
    userId?: string | null
  }) => {
    const { customerId, userId } = params

    const subs = await stripe.subscriptions.list({
      customer: customerId,
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

    const payload = {
      subscription_status: computed.subscriptionStatus,
      subscription_end_date: computed.isPro ? computed.subscriptionEndDate : null,
    }

    if (userId) {
      await updateProfileByUserId(userId, { stripe_customer_id: customerId, ...payload })
    } else {
      await updateProfileByCustomerId(customerId, payload)
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const subscriptionId = session.subscription as string
    const userId = session.metadata?.userId

    console.log(`[Webhook] Checkout completed. User: ${userId}, Sub: ${subscriptionId}`)

    if (!userId) {
      console.error('[Webhook] No userId in metadata')
      return new NextResponse(null, { status: 200 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription: any = await stripe.subscriptions.retrieve(subscriptionId)
    const status = subscription.status as string
    const isPro = status === 'active' || status === 'trialing'

    await updateProfileByUserId(userId, {
      stripe_customer_id: subscription.customer as string,
      subscription_status: isPro ? 'premium' : 'free',
      subscription_end_date:
        isPro && subscription.items?.data?.[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
          : null,
    })
  }

  if (event.type === 'customer.subscription.updated') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription: any = event.data.object

    const userId = subscription.metadata?.userId as string | undefined
    await syncCustomerMembershipToProfiles({
      customerId: subscription.customer as string,
      userId,
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.userId as string | undefined

    await syncCustomerMembershipToProfiles({
      customerId: subscription.customer as string,
      userId,
    })
  }

  return new NextResponse(null, { status: 200 })
}
