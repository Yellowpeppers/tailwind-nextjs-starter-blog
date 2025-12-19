'use client'

import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/context/LanguageContext'
import Image from 'next/image'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  onGuestContinue?: () => void
}

export default function AuthModal({ isOpen, onClose, onGuestContinue }: AuthModalProps) {
  const { t } = useTranslation()
  const { signInWithGoogle, signInWithEmail, signUp, user, signOut, refreshUser } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
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
      <Dialog as="div" className="relative z-[200]" onClose={handleClose}>
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

        <div className="fixed inset-0 z-10 overflow-y-auto">
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6 dark:bg-gray-900">
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
                  <div className="text-center">
                    {!isEditingProfile ? (
                      <>
                        <div
                          className={`group relative mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full text-2xl font-bold text-white shadow-lg ${
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
                              className="h-6 w-6 text-white"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </button>
                        </div>
                        <Dialog.Title
                          as="h3"
                          className="mb-1 text-xl leading-6 font-bold text-gray-900 dark:text-gray-100"
                        >
                          {user.user_metadata?.full_name || 'User'}
                        </Dialog.Title>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>

                        <div className="space-y-3">
                          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                Platform Status
                              </span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                Focus Member
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setEditName(user.user_metadata?.full_name || '')
                              setIsEditingProfile(true)
                            }}
                            className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                          >
                            Edit Profile
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              await signOut()
                              onClose()
                            }}
                            className="w-full rounded-md px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      // Edit Mode
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Edit Profile
                        </h3>

                        {/* Avatar Mockup Selector + Upload */}
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Avatar
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
                                      setError('Image too large. Please use < 5MB.')
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
                                      setSuccess('Avatar updated successfully!')
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
                            {success || error || 'Select color or upload image'}
                          </span>
                        </div>

                        <div>
                          <label
                            htmlFor="displayName"
                            className="mb-1 block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Display Name
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
                            Cancel
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
                                alert('Error saving profile: ' + error.message)
                              } else {
                                await refreshUser()
                                setIsEditingProfile(false)
                              }
                            }}
                            className="bg-primary-600 hover:bg-primary-500 flex-1 rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm"
                          >
                            Save Changes
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
                            d="M12.0003 20.45c-4.6667 0-8.45-3.7833-8.45-8.45 0-4.6667 3.7833-8.45 8.45-8.45 2.15 0 4.1.7333 5.6333 1.95l-1.6333 2.1c-.8833-.8-2.3167-1.55-4-1.55-3.2833 0-5.95 2.6667-5.95 5.95s2.6667 5.95 5.95 5.95c3.0834 0 4.9667-2.0333 5.3-4.45h-5.3v-2.5h7.95c.1.5333.15 1.1333.15 1.7667 0 4.8666-3.3 8.6833-9.15 8.6833z"
                            fill="currentColor"
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
