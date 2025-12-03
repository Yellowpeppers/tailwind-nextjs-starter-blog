import { genPageMetadata } from 'app/seo'
import { FocusLabDashboard } from './FocusLabDashboard'

export const metadata = {
  ...genPageMetadata({
    title: 'Focus Lab: ADHD Dashboard with AI Task Breaker & Brown Noise',
    description:
      'Free ADHD productivity dashboard featuring an **AI task breaker**, **Brown Noise generator**, and **visual timer**. Designed to help neurodivergent brains enter flow state.',
    keywords: [
      'ADHD tools',
      'white noise',
      'nature sounds',
      'body doubling',
      'pomodoro timer',
      'task breaker',
      'dopamine menu',
      'executive function',
      'focus dashboard',
      'online adhd planner',
      'visual timer',
    ],
  }),
  title: {
    absolute: 'Focus Lab: ADHD Dashboard with AI Task Breaker & Brown Noise',
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
