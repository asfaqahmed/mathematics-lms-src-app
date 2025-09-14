import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'
import { isValidEmail, isValidName, validatePassword } from '@/utils/validators'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({
        error: 'Name, email, and password are required'
      }, { status: 400 })
    }

    if (!isValidName(name)) {
      return NextResponse.json({
        error: 'Name must be between 2 and 50 characters'
      }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({
        error: 'Invalid email address'
      }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({
        error: passwordValidation.errors.join('. ')
      }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({
        error: 'An account with this email already exists'
      }, { status: 400 })
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify`
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json({
          error: 'An account with this email already exists'
        }, { status: 400 })
      }
      throw error
    }

    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          name,
          phone,
          role: 'student',
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }

    // Send welcome email
    try {
      await sendEmail(email, 'welcome', {
        name,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${data.user?.confirmation_token}`
      })
    } catch (emailError) {
      console.error('Welcome email error:', emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({
      error: 'An error occurred during registration. Please try again.'
    }, { status: 500 })
  }
}