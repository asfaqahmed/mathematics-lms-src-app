import { sendEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(request) {

  try {
    const { email = 'test@example.com' } = await request.json()

    console.log('Testing email send to:', email)

    await sendEmail({
      to: email,
      template: 'payment-success',
      data: {
        studentName: 'Test Student',
        courseName: 'Test Course',
        amount: 500000, // 5000 LKR in cents
        paymentId: 'test_payment_123'
      }
    })

    console.log('✅ Test email sent successfully')

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      sentTo: email
    })

  } catch (error) {
    console.error('❌ Test email failed:', error)
    return NextResponse.json({
      error: 'Email sending failed',
      details: error.message
    }, { status: 500 })
  }
}