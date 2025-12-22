'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { FocusSettingsProvider } from '@/components/focus-lab/FocusSettingsContext'

// Lazy load the heavy dashboard application
const FocusLabAppLazy = dynamic(
  () => import('@/components/focus-lab/FocusLabApp').then((mod) => mod.FocusLabApp),
  {
    loading: () => null,
    ssr: false, // Dashboard relies heavily on browser APIs
  }
)

export const FocusLabDashboard = ({ onExitHref }: { onExitHref?: string }) => {
  const router = useRouter()
  const handleExit = onExitHref ? () => router.push(onExitHref) : undefined

  return (
    <div className="focuslab-typography focuslab-dark relative min-h-screen font-sans">
      <FocusSettingsProvider>
        <FocusLabAppLazy onExit={handleExit} />
      </FocusSettingsProvider>
    </div>
  )
}
