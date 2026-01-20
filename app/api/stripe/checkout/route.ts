import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase-server'
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
    const { interval = 'month' } = body // 'month' | 'year'

    // Select Price ID based on interval
    let priceId = process.env.STRIPE_PRICE_ID_MONTHLY || process.env.STRIPE_PRICE_ID
    if (interval === 'year') {
      priceId = process.env.STRIPE_PRICE_ID_YEARLY || process.env.STRIPE_PRICE_ID
    }

    console.log('[CHECKOUT_DEBUG] Interval:', interval)
    console.log('[CHECKOUT_DEBUG] PriceID:', priceId)
    console.log('[CHECKOUT_DEBUG] Env M:', process.env.STRIPE_PRICE_ID_MONTHLY)
    console.log('[CHECKOUT_DEBUG] Env Y:', process.env.STRIPE_PRICE_ID_YEARLY)

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

    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://neurohackslab.com'}/focuslab?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://neurohackslab.com'}/focuslab?canceled=true`,
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
