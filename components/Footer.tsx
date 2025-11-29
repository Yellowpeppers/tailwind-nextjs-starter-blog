import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import { Mail } from '@/components/social-icons/icons'

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Privacy Policy', href: '/privacy' },
]

const topics = [
  { label: 'Focus', href: '/tags/focus' },
  { label: 'Sleep', href: '/tags/sleep' },
  { label: 'Anxiety', href: '/tags/anxiety' },
  { label: 'Gear', href: '/tags/gear' },
]

export default function Footer() {
  const contactEmail = siteMetadata.email || 'contact@neurohackslab.com'

  return (
    <footer className="mt-16 border-t border-gray-200 pt-10 dark:border-gray-800">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              NeuroHacks Lab
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Quiet ADHD systems &amp; sensory-friendly tools.
            </p>
          </div>
          <a
            href={`mailto:${contactEmail}`}
            className="hover:text-primary-500 inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition dark:text-gray-200"
          >
            <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span>{contactEmail}</span>
          </a>
          <div className="flex flex-wrap gap-3">
            <SocialIcon kind="github" href={siteMetadata.github} size={5} />
            <SocialIcon kind="facebook" href={siteMetadata.facebook} size={5} />
            <SocialIcon kind="youtube" href={siteMetadata.youtube} size={5} />
            <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={5} />
            <SocialIcon kind="twitter" href={siteMetadata.twitter} size={5} />
            <SocialIcon kind="bluesky" href={siteMetadata.bluesky} size={5} />
            <SocialIcon kind="x" href={siteMetadata.x} size={5} />
            <SocialIcon kind="instagram" href={siteMetadata.instagram} size={5} />
            <SocialIcon kind="threads" href={siteMetadata.threads} size={5} />
            <SocialIcon kind="medium" href={siteMetadata.medium} size={5} />
            <SocialIcon kind="reddit" href="https://reddit.com/r/ADHD" size={5} />
            <SocialIcon kind="pinterest" href="https://pinterest.com/neurohackslab" size={5} />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400">
            Quick Links
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link className="hover:text-primary-500 transition" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400">
            Topics
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {topics.map((topic) => (
              <li key={topic.label}>
                <Link className="hover:text-primary-500 transition" href={topic.href}>
                  {topic.label}
                </Link>
              </li>
            ))}
          </ul>
        </div> */}
      </div>
      <div className="mt-10 border-t border-gray-100 pt-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <p>© 2025 NeuroHacks Lab</p>
      </div>
    </footer>
  )
}
