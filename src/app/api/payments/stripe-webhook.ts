import Stripe from 'stripe'
import { supabase } from '@/lib/supabase-admin'
import { sendEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id)

  // Update payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'approved',
      payment_id: session.payment_intent,
      approved_at: new Date().toISOString()
    })
    .eq('payment_id', session.id)
    .select(`
      *,
      profiles (name, email),
      courses (title)
    `)
    .single()

  if (paymentError) throw paymentError

  if (!payment) {
    console.error('Payment not found for session:', session.id)
    return
  }

  // Add user to course
  const { error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      user_id: payment.user_id,
      course_id: payment.course_id,
      payment_id: payment.id,
      access_granted: true,
      purchase_date: new Date().toISOString()
    })

  if (purchaseError && purchaseError.code !== '23505') { // Ignore duplicate key error
    console.error('Error creating purchase:', purchaseError)
  }

  // Send confirmation email
  try {
    await sendEmail({
      to: payment.profiles.email,
      template: 'payment-success',
      data: {
        studentName: payment.profiles.name,
        courseName: payment.courses.title,
        amount: payment.amount * 100, // Convert to cents for email template
        paymentId: session.payment_intent
      }
    })
    console.log('Confirmation email sent to:', payment.profiles.email)
  } catch (emailError) {
    console.error('Error sending confirmation email:', emailError)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id)
  // Additional handling if needed
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id)

  // Update payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'failed'
    })
    .eq('payment_id', paymentIntent.id)
    .select(`
      *,
      profiles (name, email),
      courses (title)
    `)
    .single()

  if (paymentError) throw paymentError

  if (!payment) {
    console.error('Payment not found for payment intent:', paymentIntent.id)
    return
  }

  // Send failure email
  try {
    await sendEmail({
      to: payment.profiles.email,
      subject: 'Payment Failed',
      template: 'payment-failed',
      data: {
        studentName: payment.profiles.name,
        courseName: payment.courses.title,
        amount: payment.amount,
        paymentId: paymentIntent.id
      }
    })
  } catch (emailError) {
    console.error('Error sending failure email:', emailError)
  }
}