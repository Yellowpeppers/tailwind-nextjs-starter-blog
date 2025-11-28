import { genPageMetadata } from 'app/seo'
import { FocusLabGrid, FocusLabIntro } from './FocusLabDashboard'

export const metadata = genPageMetadata({ title: 'Focus Lab' })

export default function Projects() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <FocusLabIntro />
        <div className="min-h-screen">
          <FocusLabGrid />
        </div>
      </div>
    </div>
  )
}
