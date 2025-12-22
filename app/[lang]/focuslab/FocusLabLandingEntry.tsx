'use client'

import { useRouter } from 'next/navigation'
import { FocusLabLanding } from '@/components/focus-lab/FocusLabLanding'

export function FocusLabLandingEntry({ appHref }: { appHref: string }) {
  const router = useRouter()

  return <FocusLabLanding onEnter={() => router.push(appHref)} />
}
