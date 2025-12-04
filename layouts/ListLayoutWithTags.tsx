'use client'

import { KeyboardEvent, MouseEvent, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Image from '@/components/Image'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const lastSegment = segments[segments.length - 1]
  const basePath = pathname
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/page\/\d+\/?$/, '') // Remove any trailing /page
    .replace(/\/$/, '') // Remove trailing slash
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            Previous
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            Next
          </Link>
        )}
      </nav>
    </div>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  const tagScrollRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef(0)
  const dragScrollLeft = useRef(0)
  const isDraggingRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!tagScrollRef.current) return
    isDraggingRef.current = true
    setIsDragging(true)
    dragStartX.current = event.clientX
    dragScrollLeft.current = tagScrollRef.current.scrollLeft
  }

  const endDrag = () => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)
  }

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !tagScrollRef.current) return
    event.preventDefault()
    const dx = event.clientX - dragStartX.current
    tagScrollRef.current.scrollLeft = dragScrollLeft.current - dx
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!tagScrollRef.current) return
    if (event.key === 'ArrowRight') {
      tagScrollRef.current.scrollBy({ left: 80, behavior: 'smooth' })
    }
    if (event.key === 'ArrowLeft') {
      tagScrollRef.current.scrollBy({ left: -80, behavior: 'smooth' })
    }
  }

  return (
    <>
      <div className="mx-auto w-full">
        <div className="pt-6 pb-6">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:hidden sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
        </div>
        <div className="pb-8">
          <div
            ref={tagScrollRef}
            className={`no-scrollbar flex items-center gap-3 overflow-x-auto pb-4 select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onMouseDown={handleMouseDown}
            onMouseLeave={endDrag}
            onMouseUp={endDrag}
            onMouseMove={handleMouseMove}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="listbox"
            aria-label="Filter posts by tag"
          >
            {pathname.startsWith('/blog') ? (
              <span className="border-primary-200 bg-primary-50 text-primary-600 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap">
                All Posts
              </span>
            ) : (
              <Link
                href="/blog"
                className="hover:border-primary-200 hover:text-primary-600 dark:hover:border-primary-400 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-gray-600 transition dark:border-gray-700 dark:bg-transparent dark:text-gray-300"
              >
                All Posts
              </Link>
            )}
            {sortedTags.map((t) => {
              const isActive = decodeURI(pathname.split('/tags/')[1] || '') === slug(t)
              return (
                <Link
                  key={t}
                  href={`/tags/${slug(t)}`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'border-primary-200 bg-primary-50 text-primary-600 dark:border-primary-400/60 dark:bg-primary-400/10 dark:text-primary-100 border shadow-sm'
                      : 'hover:border-primary-200 hover:text-primary-600 dark:hover:border-primary-400 border border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-transparent dark:text-gray-300'
                  }`}
                  aria-label={`View posts tagged ${t}`}
                >
                  {`${t} (${tagCounts[t]})`}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="w-full">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayPosts.map((post) => {
              const { path, date, title, summary, tags, images } = post
              const coverImage = images?.[0]
              return (
                <li key={path} className="py-10">
                  <article>
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm tracking-[0.2em] text-gray-400 uppercase">
                            <time dateTime={date} suppressHydrationWarning>
                              {formatDate(date, siteMetadata.locale)}
                            </time>
                          </p>
                          <h2 className="mt-1 text-2xl leading-8 font-bold tracking-tight">
                            <Link href={`/${path}`} className="text-gray-900 dark:text-gray-100">
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags?.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                        <div className="text-base leading-6 font-medium">
                          <Link
                            href={`/${path}`}
                            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                            aria-label={`Read more: ${title}`}
                          >
                            Read more &rarr;
                          </Link>
                        </div>
                      </div>
                      {coverImage && (
                        <div
                          className="w-40 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 shadow-sm sm:w-52 lg:w-60 dark:border-gray-800"
                          style={{ aspectRatio: '16 / 9' }}
                        >
                          <Image
                            src={coverImage}
                            alt={`Cover image for ${title}`}
                            width={320}
                            height={180}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
          {pagination && pagination.totalPages > 1 && (
            <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
          )}
        </div>
      </div>
    </>
  )
}
