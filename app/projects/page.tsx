import { genPageMetadata } from 'app/seo'
import { FocusLabDashboard } from './FocusLabDashboard'

export const metadata = genPageMetadata({
  title: 'Focus Lab: Online ADHD Dashboard with Brown Noise & Pomodoro Timer',
  description:
    'A free browser-based productivity dashboard for ADHD. Features include White Noise, Nature Sounds, AI Task Breaker, Scratchpad, Pomodoro Timer, and Dopamine Menu to help you focus.',
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

          <h3>1. Sonic Shield: White Noise & Nature Sounds</h3>
          <p>
            For many ADHD brains, silence is actually distracting. Every small sound becomes a
            potential interruption.
            <strong>White Noise</strong> and immersive <strong>Nature Sounds</strong> (like Rain,
            Thunder, or Wind) provide a "sound blanket" that masks distracting background noises.
            This creates a consistent auditory environment, reducing the cognitive load required to
            filter out distractions.
          </p>

          <h3>2. AI Task Breaker: Overcome Paralysis</h3>
          <p>
            Large tasks can feel impossible, leading to "Executive Dysfunction" or paralysis. The{' '}
            <strong>AI Task Breaker</strong> helps you smash big projects into tiny, non-threatening
            steps. Seeing a concrete path forward reduces anxiety and makes it easier to just start.
          </p>

          <h3>3. Scratchpad: Clear Your Mind</h3>
          <p>
            ADHD brains often struggle with "Working Memory" — trying to hold too many tasks in your
            head at once leads to overload. The <strong>Scratchpad</strong> (or Squash Pad) gives
            you a dedicated space to instantly offload distracting thoughts and ideas. By
            "externalizing" these thoughts, you free up mental RAM to focus on the task at hand
            without worrying about forgetting something important.
          </p>

          <h3>4. Pomodoro Timer: Conquer Time Blindness</h3>
          <p>
            "Time Blindness" is a common struggle where the passage of time feels abstract. The{' '}
            <strong>Pomodoro Timer</strong> and visual countdowns externalize time, making it
            visible and concrete. Working in short bursts (like 25 minutes) with guaranteed breaks
            helps maintain dopamine levels and prevents burnout.
          </p>

          <h3>5. Dopamine Menu: Healthy Stimulation</h3>
          <p>
            Standard to-do lists can feel draining. The <strong>Dopamine Menu</strong> provides a
            curated list of stimulating activities for your breaks. Instead of doom-scrolling, you
            can choose a quick, rewarding activity that recharges your dopamine levels, making it
            easier to return to work.
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
