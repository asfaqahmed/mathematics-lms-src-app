import { sendEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(request) {
  
  try {
    const { to, type, data, attachments } = await request.json()
    
    if (!to || !type || !data) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    
    const result = await sendEmail({ to, template: type, data, attachments })
    
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    })
    
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({
      success: false, 
      message: 'Failed to send email',
      error: error.message
    }, { status: 500 })
  }
}