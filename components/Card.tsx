import clsx from 'clsx'

import Image from './Image'
import Link from './Link'

type CardProps = {
  title: string
  description: string
  imgSrc?: string
  href?: string
  className?: string
}

const Card = ({ title, description, imgSrc, href, className }: CardProps) => {
  const imageHeightClass = 'h-48 w-full object-cover object-center sm:h-52 md:h-56 lg:h-60'

  return (
    <div
      className={clsx(
        'flex h-full flex-col overflow-hidden rounded-md border-2 border-gray-200/60 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-900',
        className
      )}
    >
      {imgSrc &&
        (href ? (
          <Link href={href} aria-label={`Link to ${title}`}>
            <Image alt={title} src={imgSrc} className={imageHeightClass} width={544} height={306} />
          </Link>
        ) : (
          <Image alt={title} src={imgSrc} className={imageHeightClass} width={544} height={306} />
        ))}
      <div className="flex flex-1 flex-col p-6">
        <h2 className="mb-3 text-2xl leading-8 font-bold tracking-tight">
          {href ? (
            <Link href={href} aria-label={`Link to ${title}`}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <p className="prose mb-3 max-w-none text-gray-500 dark:text-gray-400">{description}</p>
        {href && (
          <Link
            href={href}
            className="text-base leading-6 font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label={`Link to ${title}`}
          >
            Learn more &rarr;
          </Link>
        )}
      </div>
    </div>
  )
}

export default Card
