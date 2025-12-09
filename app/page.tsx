import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { defaultLocale } from '@/lib/i18n'

export const metadata: Metadata = {
  title: {
    absolute: 'Free ADHD Test Online & Focus Tools | NeuroHacks Lab',
  },
  description:
    'Take the free Adult ADHD Test (WHO ASRS v1.1). Private, instant results, no email required. Plus, access our Focus Lab dashboard to boost productivity.',
  keywords: [
    'adhd test online',
    'free adhd assessment',
    'adult adhd symptoms',
    'neurodivergent tools',
    'focus dashboard',
    'asrs v1.1',
    'neurohacks lab',
  ],
  openGraph: {
    title: 'Free ADHD Test Online & Focus Tools',
    description: 'Take the free, private WHO ASRS v1.1 assessment. No email required.',
    type: 'website',
  },
}

export default function RootPage() {
  redirect(`/${defaultLocale}`)
}
