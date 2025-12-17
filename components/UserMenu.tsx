'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import Link from './Link'
import Image from 'next/image'

type UserMenuProps = {
  onLoginClick: () => void
}

export default function UserMenu({ onLoginClick }: UserMenuProps) {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="hover:text-primary-500 dark:hover:text-primary-400 rounded-full p-1 text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
        aria-label="Toggle user menu"
      >
        <UserCircleIcon className="h-6 w-6" />
      </button>
    )
  }

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="focus:ring-primary-500 relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none">
          <span className="absolute -inset-1.5" />
          <span className="sr-only">Open user menu</span>
          {user.user_metadata?.avatar_url ? (
            <Image
              className="h-8 w-8 rounded-full"
              src={user.user_metadata.avatar_url}
              alt=""
              width={32}
              height={32}
            />
          ) : (
            <div className="bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300 flex h-8 w-8 items-center justify-center rounded-full">
              <span className="leading-none font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800 dark:ring-white/5">
          <div className="px-4 py-3">
            <p className="text-sm text-gray-900 dark:text-white">Signed in as</p>
            <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/focuslab"
                className={` ${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
              >
                Focus Lab Profile
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                className={` ${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200`}
                onClick={() => {
                  /* TODO: Navigate to pricing */
                }}
              >
                Upgrade Plan
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => signOut()}
                className={` ${active ? 'bg-gray-100 dark:bg-gray-700' : ''} block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200`}
              >
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
