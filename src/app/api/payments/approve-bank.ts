import { createClient } from '@supabase/supabase-js'
import { generateInvoice } from '@/lib/invoice'
import { sendEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  
  try {
    const { paymentId, adminId } = await request.json()
    
    if (!paymentId || !adminId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    
    // Verify admin status
    const { data: admin } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', adminId)
      .single()
    
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }
    
    // Get payment details
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        profiles (name, email),
        courses (title, price)
      `)
      .eq('id', paymentId)
      .single()
    
    if (paymentError || !payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
    }
    
    if (payment.status !== 'pending') {
      return NextResponse.json({ message: 'Payment already processed' }, { status: 400 })
    }
    
    // Update payment status
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', paymentId)
    
    if (updateError) throw updateError
    
    // Grant course access
    const { error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .upsert({
        user_id: payment.user_id,
        course_id: payment.course_id,
        payment_id: paymentId,
        access_granted: true,
        purchase_date: new Date().toISOString()
      })
    
    if (purchaseError) throw purchaseError
    
    // Generate invoice
    const invoice = await generateInvoice({
      customerName: payment.profiles.name,
      customerEmail: payment.profiles.email,
      userId: payment.user_id,
      courseName: payment.courses.title,
      amount: payment.amount,
      paymentMethod: 'Bank Transfer',
      transactionId: payment.id
    })
    
    // Update payment with invoice details
    await supabaseAdmin
      .from('payments')
      .update({
        invoice_url: invoice.publicPath,
        invoice_number: invoice.invoiceNumber
      })
      .eq('id', paymentId)
    
    // Send approval email with invoice
    await sendEmail(
      payment.profiles.email,
      'bankApproval',
      {
        name: payment.profiles.name,
        courseName: payment.courses.title,
        amount: payment.amount,
        invoiceNumber: invoice.invoiceNumber
      },
      [{
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        path: invoice.filePath
      }]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Payment approved successfully',
      invoice: invoice.publicPath
    })
    
  } catch (error) {
    console.error('Bank approval error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to approve payment',
      error: error.message
    }, { status: 500 })
  }
}