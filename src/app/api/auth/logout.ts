import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Get the access token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value

    if (accessToken) {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Supabase signout error:', error)
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear session cookies
    response.cookies.set('sb-access-token', '', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0
    })

    response.cookies.set('sb-refresh-token', '', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0
    })

    response.cookies.set('sb-auth-token', '', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)

    // Even if there's an error, clear cookies and return success
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear session cookies
    response.cookies.set('sb-access-token', '', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0
    })

    response.cookies.set('sb-refresh-token', '', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0
    })

    response.cookies.set('sb-auth-token', '', {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0
    })

    return response
  }
}