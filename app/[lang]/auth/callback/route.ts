import { createClient } from '../../../../lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  // Handle the case where the route is within a locale (e.g. /en/auth/callback)
  // We want to redirect to the origin + the path the user was on, or home.
  // For now, let's redirect to origin/en (or whatever locale)

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  // Remove the code query param
  requestUrl.searchParams.delete('code')

  // If we are at /en/auth/callback, we probably want to go to /en
  // The path segments are ['', 'en', 'auth', 'callback']
  const pathSegments = requestUrl.pathname.split('/')

  // Assuming structure is /[lang]/auth/callback or /auth/callback
  // If requestUrl.pathname is /en/auth/callback, we want /en
  // If requestUrl.pathname is /auth/callback, we want /

  // Simple heuristic: remove /auth/callback from the end
  const next = requestUrl.pathname.replace(/\/auth\/callback$/, '') || '/'

  // Use NEXT_PUBLIC_SITE_URL if available to ensure we redirect to the correct public domain
  // This fixes issues where the server sees 'localhost' or an internal IP
  // Use request origin to ensure we redirect to the same domain the user is on (localhost vs 127.0.0.1)
  // preventing cookie mismatch issues.
  const origin = requestUrl.origin
  const redirectUrl = new URL(next, origin)

  return NextResponse.redirect(redirectUrl)
}
