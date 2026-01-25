import { createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const adminKey = process.env.ADMIN_API_KEY
    if (!adminKey) {
      console.error('[ADMIN_DELETE_USER] Missing ADMIN_API_KEY')
      return NextResponse.json({ error: 'Admin endpoint not configured' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null
    if (!token || token !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Check if the current user has permission (optional, but recommended)
    // For now, we assume this endpoint is protected by middleware or similar.

    const { data, error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
