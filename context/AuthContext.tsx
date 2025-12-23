'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (data: {
    full_name?: string
    avatar_url?: string
  }) => Promise<{ error: Error | null }>
  refreshUser: () => Promise<void>
  subscriptionStatus: string | null
  isPro: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const supabase = createClient()

  // Derived state for ease of use
  const isPro = subscriptionStatus === 'premium'

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Handle "Invalid Refresh Token" or explicit sign out
      if (event === 'SIGNED_OUT' || !session) {
        setSession(null)
        setUser(null)
        setLoading(false)
        setSubscriptionStatus(null)
        // Clear any lingering local storage if needed, though supabase client handles it
        return
      }

      setSession(session)
      setUser(session.user)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Self-healing: Ensure profile exists if user is logged in
  useEffect(() => {
    const ensureProfile = async () => {
      if (!user) return

      // Check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, subscription_status')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        console.warn('Profile missing for authenticated user, attempting to heal...')
        // Create profile manually (Self-healing)
        // Note: we don't set 'tier' anymore, just basic fields
        const { error: insertError } = await supabase
          .from('profiles')
          .upsert(
            { id: user.id, email: user.email, subscription_status: 'free' },
            { onConflict: 'id' }
          )

        if (insertError) {
          console.error('Failed to auto-create profile:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code,
            fullError: JSON.stringify(insertError, null, 2),
          })
        } else {
          console.log('Profile successfully restored.')
          setSubscriptionStatus('free')
        }
      } else {
        // Profile exists, sync email if missing
        if (!data.email && user.email) {
          await supabase.from('profiles').update({ email: user.email }).eq('id', user.id)
        }

        setSubscriptionStatus(data.subscription_status || 'free')
      }
    }

    if (user) {
      ensureProfile()
    } else {
      setSubscriptionStatus(null)
    }
  }, [user, supabase])

  const refreshUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (user) {
      setUser(user)

      // Also refresh profile data (subscription_status)
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single()

      if (profile) {
        setSubscriptionStatus(profile.subscription_status || 'free')
      }
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) setSession(session)
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const locale = window.location.pathname.split('/')[1] || 'en'
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`,
      },
    })
    return { error }
  }

  const signOut = async () => {
    // Clear local user data to prevent leakage to next session
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith('focus-lab-')) {
        window.localStorage.removeItem(key)
      }
    })
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    window.location.reload()
  }

  const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
    const { error } = await supabase.auth.updateUser({
      data,
    })
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUp,
        signOut,
        updateProfile,
        refreshUser,
        subscriptionStatus,
        isPro,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
