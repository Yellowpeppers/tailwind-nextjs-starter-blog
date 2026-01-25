import { createClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 })
    }

    // 回跳优先使用 referer，避免 locale 路径丢失导致 404
    // 注意：不信任 referer 的 origin，避免 open redirect；仅在同源时使用其 pathname。
    const referer = req.headers.get('referer')
    const requestUrl = new URL(req.url)
    const baseOrigin =
      req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin
    let returnUrl = new URL('/en/focuslab/app', baseOrigin)
    if (referer) {
      try {
        const r = new URL(referer)
        if (r.origin === baseOrigin) {
          returnUrl = new URL(r.pathname, baseOrigin)
        }
      } catch {
        // ignore invalid referer
      }
    }

    // Portal 返回后触发一次自愈同步（避免 webhook 延迟导致前端仍显示 Free）
    returnUrl.searchParams.set('syncMembership', 'true')

    // Create Stripe Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: returnUrl.toString(),
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[STRIPE_PORTAL_ERROR]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
