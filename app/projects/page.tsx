import { genPageMetadata } from 'app/seo'
import { FocusLabDashboard } from './FocusLabDashboard'

export const metadata = genPageMetadata({
  title: 'Focus Lab - ADHD Focus Tools & Dashboard',
  description:
    'Your external executive function system. A free ADHD dashboard featuring Brown Noise, Pomodoro Timer, AI Task Breaker, and Dopamine Menu to help you focus.',
  keywords: [
    'ADHD tools',
    'brown noise',
    'body doubling',
    'pomodoro timer',
    'task breaker',
    'dopamine menu',
    'executive function',
    'focus dashboard',
  ],
})

export default function Projects() {
  return (
    <div className="min-h-screen">
      <FocusLabDashboard />
    </div>
  )
}
