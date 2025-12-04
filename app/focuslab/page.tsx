import { FocusLabDashboard } from './FocusLabDashboard'

export const metadata = {
  title: {
    absolute: 'Focus Lab: Free ADHD Dashboard, Brown Noise & AI Timer',
  },
  description:
    'Overwhelmed? This free ADHD dashboard helps you hack executive dysfunction. Features AI task breakdown, Brown Noise, and Body Doubling tools. No login needed.',
  keywords: [
    'adhd dashboard',
    'brown noise generator',
    'ai task breaker',
    'visual timer',
    'body doubling app',
    'dopamine menu',
    'executive dysfunction',
    'goblin tools alternative',
    'focus timer',
  ],
  openGraph: {
    title: 'Focus Lab: Free ADHD Dashboard',
    description: 'Overwhelmed? This free ADHD dashboard helps you hack executive dysfunction.',
  },
}

import FocusLabInfo from '@/components/FocusLabInfo'

export default function Projects() {
  return (
    <div className="min-h-screen">
      <FocusLabDashboard />
      <FocusLabInfo />
    </div>
  )
}
