/* eslint-disable jsx-a11y/anchor-has-content */
import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { AnchorHTMLAttributes } from 'react'
import clsx from 'clsx'

const CustomLink = ({
  href,
  className,
  ...rest
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const isInternalLink = href && href.startsWith('/')
  const isAnchorLink = href && href.startsWith('#')
  const combinedClass = clsx('break-words', className)

  if (isInternalLink) {
    return <Link className={combinedClass} href={href} {...rest} />
  }

  if (isAnchorLink) {
    return <a className={combinedClass} href={href} {...rest} />
  }

  return (
    <a className={combinedClass} target="_blank" rel="noopener noreferrer" href={href} {...rest} />
  )
}

export default CustomLink
