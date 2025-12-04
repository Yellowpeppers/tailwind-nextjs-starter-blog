import TestExperience from './TestExperience'
import { genPageMetadata } from 'app/seo'
import siteMetadata from '@/data/siteMetadata'

const pageDescription =
  'Answer the 18 WHO ASRS v1.1 questions and instantly see whether your patterns align with adult ADHD. No email required and results stay on your device.'

export const metadata = genPageMetadata({
  title: 'Free Adult ADHD Test Online (ASRS v1.1)',
  description: pageDescription,
  path: '/test',
  keywords: [
    'adhd test',
    'adult adhd quiz',
    'asrs checklist',
    'adhd self assessment',
    'executive dysfunction test',
  ],
})

const quizSchema = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'Adult ADHD Test (ASRS v1.1)',
  description: pageDescription,
  inLanguage: ['en', 'zh'],
  audience: {
    '@type': 'Audience',
    audienceType: 'Adults with ADHD symptoms',
  },
  creator: {
    '@type': 'Organization',
    name: siteMetadata.title,
    url: siteMetadata.siteUrl,
  },
  educationalLevel: 'Adult',
  interactivityType: 'mixed',
  potentialAction: {
    '@type': 'Action',
    name: 'Start ADHD Self-Assessment',
    target: `${siteMetadata.siteUrl}/test`,
  },
}

const faqItems = [
  {
    question: 'Is this ADHD test clinically backed?',
    answer:
      'Yes. It follows the World Health Organization ASRS v1.1 checklist that clinicians use as the first-line adult ADHD screener.',
  },
  {
    question: 'Do I need to enter my email to see the score?',
    answer: 'No. All scoring runs locally in your browser and we never upload answers to a server.',
  },
  {
    question: 'What should I do after I finish the quiz?',
    answer:
      'Use the score as a conversation starter with a licensed clinician and explore our Focus Lab tools for immediate regulation support.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

const TestPageSchema = () => (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  </>
)

export default function TestPage() {
  return (
    <>
      <TestPageSchema />
      <TestExperience />
    </>
  )
}
