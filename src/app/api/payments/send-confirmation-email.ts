import { sendEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(request) {

  try {
    const { 
      paymentId, 
      studentName, 
      studentEmail, 
      courseName, 
      amount, 
      paymentMethod = 'PayHere' 
    } = await request.json()

    if (!studentEmail || !studentName || !courseName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Sending confirmation email to:', studentEmail)
    
    // Send confirmation email
    const emailResult = await sendEmail({
      to: studentEmail,
      template: 'payment-success',
      data: {
        studentName,
        courseName,
        amount: amount || 0,
        paymentId: paymentId || 'N/A',
        paymentMethod
      }
    })

    if (emailResult.error) {
      console.error('Email sending failed:', emailResult.error)
      return NextResponse.json({
        error: 'Email sending failed',
        details: emailResult.error
      }, { status: 500 })
    }

    console.log('✅ Confirmation email sent successfully to:', studentEmail)
    return NextResponse.json({
      success: true,
      messageId: emailResult.messageId
    })

  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return NextResponse.json({
      error: 'Failed to send confirmation email',
      details: error.message
    }, { status: 500 })
  }
}