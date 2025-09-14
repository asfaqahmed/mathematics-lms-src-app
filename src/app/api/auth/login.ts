import { supabase } from '@/lib/supabase'
import { validateEmail, validatePassword } from '@/utils/validators'
import { NextResponse } from 'next/server'

export async function POST(request) {

  try {
    const { email, password, rememberMe } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      // Check for specific error types
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json({ error: 'Please verify your email before logging in' }, { status: 401 })
      }
      throw error
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    // Get request headers for logging
    const forwarded = request.headers.get('x-forwarded-for')
    const userAgent = request.headers.get('user-agent')

    // Log login activity
    await supabase
      .from('login_logs')
      .insert({
        user_id: data.user.id,
        ip_address: forwarded || 'unknown',
        user_agent: userAgent || 'unknown',
        success: true
      })

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      user: {
        ...data.user,
        ...profile
      },
      session: data.session
    })

    // Set session cookies
    response.cookies.set('sb-access-token', data.session.access_token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: rememberMe ? 2592000 : 86400
    })

    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: rememberMe ? 2592000 : 86400
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      error: 'An error occurred during login. Please try again.'
    }, { status: 500 })
  }
}