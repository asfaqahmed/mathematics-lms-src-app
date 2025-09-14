import { generateInvoicePDF } from '@/lib/invoice'
import { supabase } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET(request) {

  try {
    const { searchParams } = request.nextUrl
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    // Fetch payment details with related data
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        profiles (
          name,
          email
        ),
        courses (
          title,
          description
        )
      `)
      .eq('id', paymentId)
      .eq('status', 'approved')
      .single()

    if (paymentError) throw paymentError

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found or not approved' }, { status: 404 })
    }

    // Generate invoice data
    const invoiceData = {
      invoiceNumber: `INV-${payment.id.toString()}`,
      date: new Date(payment.created_at).toLocaleDateString(),
      dueDate: new Date(payment.created_at).toLocaleDateString(),
      
      // Company details
      company: {
        name: 'MathPro Academy',
        address: 'Colombo, Sri Lanka',
        email: 'support@mathslms.com',
        phone: '+94 11 234 5678'
      },
      
      // Customer details
      customer: {
        name: payment.profiles.name || 'N/A',
        email: payment.profiles.email,
        // phone: 'N/A'
      },
      
      // Items
      items: [
        {
          description: payment.courses.title,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount
        }
      ],
      
      // Totals
      // subtotal: payment.amount,
       total: payment.amount,
      
      // Payment info
      paymentMethod: payment.payment_method,
      paymentId: payment.payment_id || payment.order_id,
      paymentDate: new Date(payment.updated_at).toLocaleDateString()
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData)

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}