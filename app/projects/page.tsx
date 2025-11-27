import { genPageMetadata } from 'app/seo'
import {
  BrainDumpCard,
  FocusLabIntro,
  SonicShieldCard,
  TaskBreakerCard,
  TimerCard,
} from './FocusLabDashboard'

export const metadata = genPageMetadata({ title: 'Focus Lab' })

export default function Projects() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <FocusLabIntro />
        <div className="grid auto-rows-min grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SonicShieldCard />
          </div>
          <div className="lg:col-span-1">
            <TimerCard />
          </div>
          <div className="lg:col-span-2">
            <BrainDumpCard />
          </div>
          <div className="lg:col-span-1 lg:row-span-2">
            <TaskBreakerCard />
          </div>
        </div>
      </div>
    </div>
  )
}
