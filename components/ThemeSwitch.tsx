'use client'

import { Fragment, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useThemeColor, ThemeColor } from '@/context/ThemeColorContext'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Radio,
  RadioGroup,
  Transition,
} from '@headlessui/react'

const Sun = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="group:hover:text-gray-100 h-6 w-6"
  >
    <path
      fillRule="evenodd"
      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
      clipRule="evenodd"
    />
  </svg>
)
const Moon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="group:hover:text-gray-100 h-6 w-6"
  >
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
)
const Monitor = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="group:hover:text-gray-100 h-6 w-6"
  >
    <rect x="3" y="3" width="14" height="10" rx="2" ry="2"></rect>
    <line x1="7" y1="17" x2="13" y2="17"></line>
    <line x1="10" y1="13" x2="10" y2="17"></line>
  </svg>
)
const Blank = () => <svg className="h-6 w-6" />

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { themeColor, setThemeColor } = useThemeColor()

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), [])

  return (
    <div className="flex items-center">
      <Menu as="div" className="relative inline-block text-left">
        <div className="hover:text-primary-500 dark:hover:text-primary-400 flex items-center justify-center transition-all duration-300">
          <MenuButton aria-label="Theme switcher">
            {mounted ? resolvedTheme === 'dark' ? <Moon /> : <Sun /> : <Blank />}
          </MenuButton>
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
          <MenuItems className="ring-opacity-5 absolute right-0 z-50 mt-2 w-auto origin-top-right divide-y divide-gray-100 rounded-md bg-white p-2 shadow-lg ring-1 ring-black focus:outline-none dark:divide-gray-700 dark:bg-gray-800">
            <RadioGroup value={theme} onChange={setTheme}>
              <div className="p-1">
                <Radio value="light">
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        className={`${focus ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <div className="mr-2">
                          <Sun />
                        </div>
                        Light
                      </button>
                    )}
                  </MenuItem>
                </Radio>
                <Radio value="dark">
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        className={`${
                          focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <div className="mr-2">
                          <Moon />
                        </div>
                        Dark
                      </button>
                    )}
                  </MenuItem>
                </Radio>
                <Radio value="system">
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        className={`${
                          focus ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <div className="mr-2">
                          <Monitor />
                        </div>
                        System
                      </button>
                    )}
                  </MenuItem>
                </Radio>
              </div>
            </RadioGroup>
            <div className="p-3">
              <div className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Theme Color
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'pink', color: '#db2777', label: 'Pink' },
                  { name: 'blue', color: '#0B1F3B', label: 'Deep Navy Blue' },
                  { name: 'green', color: '#0F6B61', label: 'Cool Ink Green' },
                  { name: 'yellow', color: '#C6A15B', label: 'Champagne Gold' },
                  { name: 'violet', color: '#3B3A82', label: 'Misty Indigo' },
                  { name: 'orange', color: '#B85C4A', label: 'Terracotta Orange' },
                  { name: 'red', color: '#7A8F86', label: 'Sage Green' },
                  { name: 'slate', color: '#1F2933', label: 'Graphite Gray' },
                ].map(({ name, color, label }) => (
                  <button
                    key={name}
                    onClick={() => setThemeColor(name as ThemeColor)}
                    className={`h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-white transition-all hover:scale-110 dark:ring-offset-gray-800 ${
                      themeColor === name ? 'ring-gray-400 dark:ring-gray-400' : 'ring-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    title={label}
                    aria-label={`Set theme to ${label}`}
                  />
                ))}
              </div>
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  )
}

export default ThemeSwitch
