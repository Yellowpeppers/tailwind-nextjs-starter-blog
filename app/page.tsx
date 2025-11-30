import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
// Force rebuild
import { allBlogs } from 'contentlayer/generated'
import HomeContent from '@/components/HomeContent'

export const metadata = {
  title: 'Free Adult ADHD Test Online (ASRS v1.1) - NeuroHacks Lab',
  description:
    'Take our free, private ADHD test online. Based on the WHO ASRS v1.1 checklist for adults. No email required, instant scoring, and the Focus Lab productivity dashboard.',
}

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  return <HomeContent posts={posts} />
}
