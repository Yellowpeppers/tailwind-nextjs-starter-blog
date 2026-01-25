export type StripeSubscriptionLite = {
  id?: string | null
  status?: string | null
  created?: number | null
  current_period_end?: number | null
}

export type ProfileMembership = {
  isPro: boolean
  subscriptionStatus: 'premium' | 'free'
  primarySubscriptionId: string | null
  activeOrTrialingCount: number
  subscriptionEndDate: string | null
}

const PRO_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing'])

export function computeProfileMembership(
  subscriptions: StripeSubscriptionLite[]
): ProfileMembership {
  const proSubs = subscriptions.filter((sub) => PRO_SUBSCRIPTION_STATUSES.has(sub.status ?? ''))
  const activeOrTrialingCount = proSubs.length

  if (activeOrTrialingCount === 0) {
    return {
      isPro: false,
      subscriptionStatus: 'free',
      primarySubscriptionId: null,
      activeOrTrialingCount: 0,
      subscriptionEndDate: null,
    }
  }

  const primary = [...proSubs].sort((a, b) => (b.created ?? 0) - (a.created ?? 0))[0]
  const endDate =
    primary?.current_period_end && primary.current_period_end > 0
      ? new Date(primary.current_period_end * 1000).toISOString()
      : null

  return {
    isPro: true,
    subscriptionStatus: 'premium',
    primarySubscriptionId: primary?.id ?? null,
    activeOrTrialingCount,
    subscriptionEndDate: endDate,
  }
}
