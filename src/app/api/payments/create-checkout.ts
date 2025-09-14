import Stripe from 'stripe'
import { supabase } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {

  try {
    const { courseId, userId } = await request.json()

    if (!courseId || !userId) {
      return NextResponse.json({ error: 'Course ID and User ID are required' }, { status: 400 })
    }

    // Fetch course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (courseError) throw courseError

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Fetch user details
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has access via payments table
    const { data: existingPayment, error: paymentCheckError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('status', 'approved')
      .single()

    if (paymentCheckError && paymentCheckError.code !== 'PGRST116') {
      throw paymentCheckError
    }

    if (existingPayment) {
      return NextResponse.json({ error: 'User already has access to this course' }, { status: 400 })
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        course_id: courseId,
        amount: course.price,
        status: 'pending',
        method: 'payhere'
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // Convert LKR to USD (approximate rate: 1 USD = 300 LKR)
    const lkrToUsdRate = 300
    const usdAmount = course.price / lkrToUsdRate

    // Derive a canonical site URL (prefer envs; fall back to request host for local/dev)
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description,
            },
            unit_amount: Math.round(usdAmount * 100), // Convert USD to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
      cancel_url: `${siteUrl}/courses/${courseId}?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: userId,
        courseId: courseId,
        paymentId: payment.id
      },
    })

    // Update payment record with session ID
    await supabase
      .from('payments')
      .update({
        payment_id: session.id
      })
      .eq('id', payment.id)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({
      error: 'Failed to create checkout session',
      details: error.message,
      type: error.type || 'unknown'
    }, { status: 500 })
  }
}