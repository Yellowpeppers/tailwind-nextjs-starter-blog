import { genPageMetadata } from 'app/seo'
import { FocusLabDashboard } from './FocusLabDashboard'

export const metadata = genPageMetadata({
  title: 'Focus Lab: Online ADHD Dashboard with Brown Noise & Pomodoro Timer',
  description:
    'A free browser-based productivity dashboard for ADHD. Features include a Brown Noise generator, Pomodoro timer, and AI task breaker to help you enter hyperfocus.',
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
})

import FocusLabInfo from '@/components/FocusLabInfo'

export default function Projects() {
  return (
    <div className="min-h-screen">
      <FocusLabDashboard />
      <FocusLabInfo />
    </div>
  )
}
