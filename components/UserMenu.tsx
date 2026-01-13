'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/context/LanguageContext'
import Link from './Link'
import Image from 'next/image'

type UserMenuProps = {
  onLoginClick: () => void
  onSignUpClick: () => void
  onOpenProfile: () => void
  onOpenPlan: () => void
}

export default function UserMenu({
  onLoginClick,
  onSignUpClick,
  onOpenProfile,
  onOpenPlan,
}: UserMenuProps) {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <Menu as="div" className="relative ml-3">
        <Menu.Button
          className="hover:text-primary-500 dark:hover:text-primary-400 rounded-full p-1 text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle user menu"
        >
          <UserCircleIcon className="h-6 w-6" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-[150] mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none dark:divide-gray-800 dark:bg-gray-900 dark:ring-white/10">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onLoginClick}
                    className={`${
                      active
                        ? 'bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    } group flex w-full items-center px-4 py-2 text-sm`}
                  >
                    {t.auth.signIn}
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onSignUpClick}
                    className={`${
                      active
                        ? 'bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    } group flex w-full items-center px-4 py-2 text-sm`}
                  >
                    {t.auth.signUp}
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    )
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const initial = displayName[0].toUpperCase()

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="group relative flex items-center justify-center gap-2 rounded-full p-1 pl-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
          <div className="hidden text-sm font-medium text-gray-700 sm:block dark:text-gray-300">
            {displayName}
          </div>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md transition-transform group-hover:scale-105">
            {initial}
            {/* Pro Badge */}
            <div className="absolute -right-1 -bottom-1 flex h-4 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1 text-[8px] font-bold text-amber-900 ring-2 ring-white dark:ring-gray-900">
              {t.userMenu.proBadge}
            </div>
          </div>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-[150] mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none dark:divide-gray-800 dark:bg-gray-900 dark:ring-white/10">
          <div className="px-4 py-3">
            <p className="text-sm text-gray-900 dark:text-white">{t.userMenu.signedInAs}</p>
            <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onOpenProfile}
                  className={`${
                    active
                      ? 'bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  <svg
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t.userMenu.profile}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onOpenPlan}
                  className={`${
                    active
                      ? 'bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100'
                      : 'text-gray-700 dark:text-gray-300'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  <svg
                    className="mr-3 h-5 w-5 text-amber-400 group-hover:text-amber-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t.userMenu.upgrade}
                  <span className="ml-auto inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    {t.userMenu.proBadge}
                  </span>
                </button>
              )}
            </Menu.Item>
          </div>
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut()}
                  className={`${
                    active
                      ? 'bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  <svg
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t.userMenu.signOut}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
