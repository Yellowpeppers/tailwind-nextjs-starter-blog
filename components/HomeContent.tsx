import { CoreContent } from 'pliny/utils/contentlayer'
import { Blog } from 'contentlayer/generated'
import { Dictionary } from '@/data/locale/dictionary'
import Hero from '@/components/home/Hero'
import TrustFeatures from '@/components/home/TrustFeatures'
import ResourceHub from '@/components/home/ResourceHub'
import FAQ from '@/components/home/FAQ'
import BlogList from '@/components/home/BlogList'

export default function HomeContent({
  posts,
  dictionary,
  locale,
}: {
  posts: CoreContent<Blog>[]
  dictionary: Dictionary
  locale: string
}) {
  return (
    <div className="space-y-0">
      <Hero dictionary={dictionary} />
      <TrustFeatures dictionary={dictionary} />
      <ResourceHub dictionary={dictionary} />
      <FAQ dictionary={dictionary} />
      <BlogList posts={posts} dictionary={dictionary} locale={locale} />
    </div>
  )
}
