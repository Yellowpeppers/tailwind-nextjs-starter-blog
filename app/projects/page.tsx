import { genPageMetadata } from 'app/seo'
import { FocusLabGrid, FocusLabIntro } from './FocusLabDashboard'

export const metadata = genPageMetadata({ title: 'Focus Lab' })

export default function Projects() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <FocusLabIntro />
      </div>
      <div className="mt-10 px-4 sm:px-6 lg:px-8">
        <FocusLabGrid />
      </div>
    </div>
  )
}
