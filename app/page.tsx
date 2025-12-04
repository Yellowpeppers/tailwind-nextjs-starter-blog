import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
// Force rebuild
import { allBlogs } from 'contentlayer/generated'
import HomeContent from '@/components/HomeContent'

export const metadata = {
  title: {
    absolute: 'NeuroHacks Lab | ADHD Tools & Test',
  },
  description:
    'Take our free, private ADHD test online. Based on the WHO ASRS v1.1 checklist for adults. No email required, instant scoring, and the Focus Lab productivity dashboard.',
  keywords: [
    'adhd test online',
    'adhd tools',
    'adhd resources for adults',
    'adhd focus lab',
    'neurohacks lab',
  ],
}

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  return <HomeContent posts={posts} />
}
