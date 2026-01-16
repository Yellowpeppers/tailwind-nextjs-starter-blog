'use client'

import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Fragment, useRef, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/context/LanguageContext'
import Image from 'next/image'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  onGuestContinue?: () => void
  initialView?: 'login' | 'signup'
}

export default function AuthModal({
  isOpen,
  onClose,
  onGuestContinue,
  initialView = 'login',
}: AuthModalProps) {
  const { t } = useTranslation()
  const { signInWithGoogle, signInWithEmail, signUp, user, signOut, refreshUser, isPro } = useAuth()
  const [isLogin, setIsLogin] = useState(initialView === 'login')

  // Reset state when opening/closing or changing view intent if needed,
  // but for simplicity we rely on isOpen to trigger resets or just mounting.
  // Actually, we should watch `isOpen` to reset, or just reset on close.
  // Let's rely on the prop for initial state when mounting (or re-opening if key changes, but Dialog keeps state).
  // Better: Effect to sync state when isOpen becomes true?
  // Standard pattern: Reset on open.

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialView === 'login')
      setError(null)
      setSuccess(null)
      setLoading(false)
    }
  }, [isOpen, initialView])

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState('')

  const [editAvatarColor, setEditAvatarColor] = useState('indigo')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCheckEmail, setShowCheckEmail] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signInWithEmail(email, password)
        if (error) throw error
        onClose()
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setShowCheckEmail(true)
      }
    } catch (err: unknown) {
      setError((err as Error).message || t.auth.error)
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setIsLogin(true)
    setEmail('')
    setPassword('')
    setError(null)
    setShowCheckEmail(false)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[10001]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-hidden">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="no-scrollbar relative max-h-[85vh] transform overflow-y-auto rounded-2xl bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6 dark:bg-gray-900">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none dark:bg-gray-900 dark:text-gray-500 dark:hover:text-gray-400"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {showCheckEmail ? (
                  <div className="py-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <svg
                        className="h-8 w-8 text-green-600 dark:text-green-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="mb-2 text-xl leading-6 font-semibold text-gray-900 dark:text-gray-100"
                    >
                      {t.auth.checkEmailTitle}
                    </Dialog.Title>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                      {t.auth.checkEmailDesc.split('{email}').map((part, i) =>
                        i === 0 ? (
                          <span key={i}>
                            {part}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {email}
                            </span>
                          </span>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </p>
                    <button
                      type="button"
                      className="bg-primary-600 hover:bg-primary-500 focus-visible:outline-primary-600 w-full rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      onClick={handleClose}
                    >
                      {t.auth.gotIt}
                    </button>
                  </div>
                ) : user ? (
                  // Profile View for Logged-in Users
                  <div className="flex flex-col items-center">
                    {/* Avatar Section */}
                    {!isEditingProfile ? (
                      <>
                        <div className="group relative mb-4">
                          <div
                            className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-3xl font-bold text-white shadow-xl ring-4 ring-white dark:ring-gray-800 ${
                              user.user_metadata?.avatar_url
                                ? 'bg-transparent'
                                : user.user_metadata?.avatar_color === 'pink'
                                  ? 'bg-gradient-to-tr from-pink-500 to-rose-500'
                                  : user.user_metadata?.avatar_color === 'emerald'
                                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-500'
                                    : 'bg-gradient-to-tr from-indigo-500 to-purple-500'
                            }`}
                          >
                            {user.user_metadata?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.user_metadata.avatar_url}
                                alt="Avatar"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              user.user_metadata?.full_name?.charAt(0) ||
                              user.email?.charAt(0)?.toUpperCase()
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setEditName(user.user_metadata?.full_name || '')
                              setEditAvatarColor(user.user_metadata?.avatar_color || 'indigo')
                              setIsEditingProfile(true)
                            }}
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-8 w-8 text-white"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </div>

                        <div className="mb-8 text-center">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {user.user_metadata?.full_name || t.auth.profile.userFallback}
                          </h3>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>

                        {/* Status Card */}
                        <div className="mb-8 w-full">
                          <div
                            className={`relative overflow-hidden rounded-2xl p-4 transition-all ${
                              isPro
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30'
                                : 'bg-gray-50 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                    isPro
                                      ? 'bg-white/20 text-white backdrop-blur-sm'
                                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                  }`}
                                >
                                  {isPro ? (
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      className="h-6 w-6"
                                    >
                                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                    </svg>
                                  ) : (
                                    <svg
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={1.5}
                                      stroke="currentColor"
                                      className="h-6 w-6"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <div className="text-left">
                                  <p
                                    className={`text-xs font-semibold tracking-wider uppercase ${
                                      isPro ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                  >
                                    {t.auth.profile.platformStatus}
                                  </p>
                                  <h4
                                    className={`text-lg font-bold ${
                                      isPro ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                  >
                                    {isPro
                                      ? t.auth.profile.proWorkspace
                                      : t.auth.profile.freeMember}
                                  </h4>
                                </div>
                              </div>
                              {isPro && (
                                <div className="rounded-full bg-white/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                  {t.auth.profile.active}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex w-full flex-col gap-3">
                          {isPro && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/stripe/portal', {
                                    method: 'POST',
                                  })
                                  const { url } = await response.json()
                                  if (url) window.location.href = url
                                } catch (error) {
                                  console.error('Failed to open customer portal', error)
                                  alert('Failed to load subscription portal.')
                                }
                              }}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:ring-offset-gray-900"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                                />
                              </svg>
                              {t.auth.profile.manageSubscription}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setEditName(user.user_metadata?.full_name || '')
                              setIsEditingProfile(true)
                            }}
                            className="dark:hover:bg-gray-750 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                            {t.auth.profile.editProfile}
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              await signOut()
                              onClose()
                            }}
                            className="w-full px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            {t.auth.profile.signOut}
                          </button>
                        </div>
                      </>
                    ) : (
                      // Edit Mode
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {t.auth.profile.editProfile}
                        </h3>

                        {/* Avatar Mockup Selector + Upload */}
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t.auth.profile.avatar}
                          </span>
                          <div className="flex gap-3">
                            {['indigo', 'pink', 'emerald'].map((color) => (
                              <button
                                key={color}
                                onClick={() => setEditAvatarColor(color)}
                                className={`h-10 w-10 rounded-full bg-gradient-to-tr ${
                                  color === 'indigo'
                                    ? 'from-indigo-500 to-purple-500'
                                    : color === 'pink'
                                      ? 'from-pink-500 to-rose-500'
                                      : 'from-emerald-500 to-teal-500'
                                } ring-2 ring-offset-2 ${editAvatarColor === color ? 'ring-primary-500' : 'ring-transparent'}`}
                              />
                            ))}
                            {/* File Upload Button */}
                            <div className="relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 cursor-pointer opacity-0"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    setSuccess(null)
                                    setError(null)
                                    if (file.size > 5 * 1024 * 1024) {
                                      setError(t.auth.profile.uploadTooLarge)
                                      return
                                    }

                                    try {
                                      setLoading(true) // Reuse component loading state or add local? Local is safer but component state works for disabling buttons.
                                      // Actually, let's just use a simple alert/loading indication via text since we can't easily add state hooks.
                                      // Or assume 'loading' state affects the whole modal, which might be jarring.
                                      // I'll stick to async logic without extra state for now, relying on browser pending.

                                      const supabase = createClient()
                                      const fileExt = file.name.split('.').pop()
                                      const fileName = `${user.id}/${Date.now()}.${fileExt}`

                                      const { error: uploadError } = await supabase.storage
                                        .from('avatars')
                                        .upload(fileName, file, {
                                          upsert: true,
                                          contentType: file.type,
                                        })

                                      if (uploadError) throw uploadError

                                      const {
                                        data: { publicUrl },
                                      } = supabase.storage.from('avatars').getPublicUrl(fileName)

                                      const { error: updateError } = await supabase.auth.updateUser(
                                        {
                                          data: { avatar_url: publicUrl },
                                        }
                                      )

                                      if (updateError) throw updateError

                                      await refreshUser()
                                      setSuccess(t.auth.profile.uploadSuccess)
                                      setTimeout(() => setSuccess(null), 3000)
                                      // Trigger re-render by updating local state indirectly?
                                      // AuthContext should handle user update.
                                    } catch (error: unknown) {
                                      const msg =
                                        error instanceof Error ? error.message : String(error)
                                      setError(msg)
                                    } finally {
                                      setLoading(false)
                                    }
                                  }
                                }}
                              />
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                              </svg>
                            </div>
                          </div>
                          <span
                            className={`text-xs ${success ? 'font-medium text-green-600 dark:text-green-400' : error ? 'text-red-500' : 'text-gray-400'}`}
                          >
                            {success || error || t.auth.profile.uploadHint}
                          </span>
                        </div>

                        <div>
                          <label
                            htmlFor="displayName"
                            className="mb-1 block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            {t.auth.profile.displayName}
                          </label>
                          <input
                            id="displayName"
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800"
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => setIsEditingProfile(false)}
                            className="flex-1 rounded-md px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            {t.auth.profile.cancel}
                          </button>
                          <button
                            onClick={async () => {
                              const supabase = createClient()
                              const { error } = await supabase.auth.updateUser({
                                data: {
                                  full_name: editName,
                                  avatar_color: editAvatarColor,
                                  // avatar_url handling is in file input for now or we clear it if color selected?
                                  // If color selected, we might want to clear avatar_url.
                                  // But capturing that intent is hard.
                                  // For now, Name and Color update.
                                },
                              })
                              if (error) {
                                alert(`${t.auth.profile.saveErrorPrefix}${error.message}`)
                              } else {
                                await refreshUser()
                                setIsEditingProfile(false)
                              }
                            }}
                            className="bg-primary-600 hover:bg-primary-500 flex-1 rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm"
                          >
                            {t.auth.profile.saveChanges}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="mb-6 text-center">
                      <Dialog.Title
                        as="h3"
                        className="text-base leading-6 font-semibold text-gray-900 dark:text-gray-100"
                      >
                        {isLogin ? t.auth.loginTitle : t.auth.signupTitle}
                      </Dialog.Title>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {isLogin ? t.auth.loginDesc : t.auth.signupDesc}
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          {t.auth.email}
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          {t.auth.password}
                        </label>
                        <input
                          type="password"
                          id="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="focus:border-primary-500 focus:ring-primary-500 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          minLength={6}
                        />
                      </div>

                      {error && <p className="text-center text-sm text-red-500">{error}</p>}

                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary-600 hover:bg-primary-500 focus-visible:outline-primary-600 w-full rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
                      >
                        {loading ? t.auth.processing : isLogin ? t.auth.signIn : t.auth.signUp}
                      </button>
                    </form>

                    <div className="relative mt-6">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-2 text-sm text-gray-500 dark:bg-gray-900">
                          {t.auth.orContinueWith}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700"
                        onClick={signInWithGoogle}
                      >
                        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Google
                      </button>
                      {onGuestContinue && (
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          onClick={onGuestContinue}
                        >
                          {t.auth.guestContinue}
                        </button>
                      )}
                    </div>

                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin)
                          setError(null)
                        }}
                        className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium"
                      >
                        {isLogin ? t.auth.noAccount : t.auth.haveAccount}
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
