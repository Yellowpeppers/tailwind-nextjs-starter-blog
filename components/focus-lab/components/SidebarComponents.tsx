import React, { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSidebar } from '@/components/ui/sidebar'
import Link from 'next/link' // Assuming this might be needed, but checking code it uses onClick or img src

export const SidebarLabel = ({
  show,
  children,
  delay = 0,
}: {
  show: boolean
  children: ReactNode
  delay?: number
}) => (
  <AnimatePresence initial={false}>
    {show ? (
      <motion.span
        key="sidebar-label"
        initial={{ opacity: 0, x: -6, width: 0 }}
        animate={{ opacity: 1, x: 0, width: 'auto' }}
        exit={{ opacity: 0, x: -6, width: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut', delay }}
        className="inline-flex min-w-0 flex-1 items-center overflow-hidden whitespace-nowrap"
      >
        {children}
      </motion.span>
    ) : null}
  </AnimatePresence>
)

export const FocusSidebarAction = ({
  icon,
  label,
  onClick,
  id,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  id?: string
}) => {
  const { open, animate } = useSidebar()
  return (
    <button
      id={id}
      onClick={onClick}
      className="group/sidebar flex w-full items-center justify-start gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-white/80 dark:hover:bg-white/10"
    >
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-gray-600 transition-colors group-hover:text-gray-900 dark:text-gray-300">
        {icon}
      </span>
      <motion.span
        animate={{
          display: animate ? (open ? 'inline-block' : 'none') : 'inline-block',
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="inline-block text-sm whitespace-pre text-gray-800 transition duration-150 group-hover/sidebar:translate-x-1 dark:text-gray-100"
      >
        {label}
      </motion.span>
    </button>
  )
}

export const FocusSidebarBrand = () => {
  const { open, animate } = useSidebar()
  return (
    <div className="group/sidebar flex h-12 items-center justify-start gap-3 rounded-xl px-3 py-1">
      <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/static/images/focuslab-logo.svg"
          alt="FocusLab Logo"
          className="h-full w-full dark:invert"
        />
      </div>
      <motion.div
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          display: animate ? (open ? 'flex' : 'none') : 'flex',
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="min-w-0 flex-col"
      >
        <span className="font-limelight truncate text-lg leading-tight font-bold text-gray-900 dark:text-gray-100">
          Focus Lab
        </span>
        <span className="text-xs font-medium text-gray-400">Dashboard</span>
      </motion.div>
    </div>
  )
}

export const FocusSidebarProfile = ({
  userName,
  planLabel,
  membershipNote,
  avatarUrl,
  avatarColor,
  isPro,
  onClick,
}: {
  userName: string
  planLabel: string
  membershipNote?: string | null
  avatarUrl?: string
  avatarColor?: string
  isPro?: boolean
  onClick?: () => void
}) => {
  const { open, animate } = useSidebar()
  const initial = (userName.trim().charAt(0) || 'G').toUpperCase()
  return (
    <div className="border-t border-white/70 pt-3 pb-6 dark:border-white/10">
      <button
        type="button"
        onClick={onClick}
        className="group/sidebar flex h-12 w-full items-center justify-start gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/80 dark:hover:bg-white/10"
      >
        <div className="relative">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white shadow-inner ring-1 ring-black/5 dark:ring-white/10 ${
              avatarUrl
                ? 'bg-transparent'
                : avatarColor === 'pink'
                  ? 'bg-gradient-to-tr from-pink-500 to-rose-500'
                  : avatarColor === 'emerald'
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-tr from-indigo-500 to-purple-500'
            }`}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="User"
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <span className="leading-none">{initial}</span>
            )}
          </div>
          {isPro ? (
            <span className="absolute -right-1 -bottom-1 flex h-4 items-center gap-1 rounded-full bg-amber-400 px-1 text-[10px] font-extrabold text-amber-950 uppercase shadow ring-1 ring-amber-500/60">
              <span className="icon-[solar--crown-bold] text-[11px]" aria-hidden="true" />
              PRO
            </span>
          ) : null}
        </div>
        <motion.div
          animate={{
            opacity: animate ? (open ? 1 : 0) : 1,
            display: animate ? (open ? 'flex' : 'none') : 'flex',
          }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="min-w-0 flex-col text-left"
        >
          <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
            {userName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{planLabel}</span>
          {membershipNote ? (
            <span className="text-[11px] text-gray-400 dark:text-gray-500">{membershipNote}</span>
          ) : null}
        </motion.div>
      </button>
    </div>
  )
}
