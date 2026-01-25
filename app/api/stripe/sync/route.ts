import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { syncMembershipForUser } from '@/lib/server-membership'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const synced = await syncMembershipForUser({ userId: user.id, email: user.email })

    return NextResponse.json({
      subscriptionStatus: synced.subscriptionStatus,
      isPro: synced.isPro,
      subscriptionEndDate: synced.subscriptionEndDate,
      activeOrTrialingCount: synced.activeOrTrialingCount,
    })
  } catch (error) {
    console.error('[STRIPE_SYNC_ERROR]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
