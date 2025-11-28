import { genPageMetadata } from 'app/seo'
import { FocusLabDashboard } from './FocusLabDashboard'

export const metadata = genPageMetadata({ title: 'Focus Lab' })

export default function Projects() {
  return (
    <div className="min-h-screen">
      <FocusLabDashboard />
    </div>
  )
}
