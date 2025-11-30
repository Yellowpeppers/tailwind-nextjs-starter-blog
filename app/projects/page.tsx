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

export default function Projects() {
  return (
    <div className="min-h-screen">
      <FocusLabDashboard />

      {/* SEO Content Section */}
      <section className="mx-auto max-w-4xl px-4 py-24">
        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-3xl font-bold">How this ADHD Dashboard helps you focus</h2>

          <h3>1. Sonic Shield: Brown Noise & Pink Noise</h3>
          <p>
            For many ADHD brains, silence is actually distracting. Every small sound becomes a
            potential interruption. <strong>Brown Noise</strong> (deeper, rumbly) and{' '}
            <strong>Pink Noise</strong> (balanced, like rain) provide "auditory masking". They
            create a consistent sound blanket that covers up distracting background noises, reducing
            the cognitive load required to filter them out.
          </p>

          <h3>2. Pomodoro Timer: Conquer Time Blindness</h3>
          <p>
            "Time Blindness" is a common struggle where the passage of time feels abstract. The{' '}
            <strong>Pomodoro Timer</strong> externalizes time, making it visible and concrete.
            Working in short bursts (like 25 minutes) with guaranteed breaks helps maintain dopamine
            levels and prevents burnout.
          </p>

          <h3>3. AI Task Breaker: Reduce Executive Dysfunction</h3>
          <p>
            Large tasks can feel impossible, leading to "Executive Dysfunction" or paralysis. The{' '}
            <strong>AI Task Breaker</strong> helps you smash big projects into tiny, non-threatening
            steps. Seeing a concrete path forward reduces anxiety and makes it easier to just start.
          </p>

          <hr className="my-12 border-gray-200 dark:border-gray-800" />

          <h3>Frequently Asked Questions</h3>

          <h4>Is this focus dashboard free?</h4>
          <p>Yes, Focus Lab is completely free to use. It runs entirely in your browser.</p>

          <h4>Do I need to download anything?</h4>
          <p>
            No downloads required. It works on any modern web browser (Chrome, Safari, Firefox,
            Edge) on both desktop and mobile.
          </p>
        </div>
      </section>
    </div>
  )
}
