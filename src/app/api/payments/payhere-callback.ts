import { supabase } from '@/lib/supabase-admin'
import crypto from 'crypto'
import { NextResponse } from 'next/server'

export async function POST(request) {

  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig
    } = await request.json()

    console.log('PayHere callback received:', await request.json())

    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchant_secret) {
      return NextResponse.json({ error: 'PayHere merchant secret not configured' }, { status: 500 });
    }

    // Generate expected hash for verification (matching working implementation)
    const local_md5sig = crypto
      .createHash('md5')
      .update(
        merchant_id +
          order_id +
          payhere_amount +
          payhere_currency +
          status_code +
          crypto
            .createHash('md5')
            .update(merchant_secret)
            .digest('hex')
            .toUpperCase()
      )
      .digest('hex')
      .toUpperCase()

    if (local_md5sig === md5sig && status_code === '2') {
      // Update payment status in database
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          payhere_payment_id: payment_id
        })
        .eq('id', order_id)
        .select(`
          *,
          profiles (name, email),
          courses (title)
        `)
        .single()

      if (paymentError) {
        console.error('Payment update error:', paymentError);
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
      }

      if (payment) {
        console.log(`Payment successful for order: ${order_id}`)
        
        // Create purchase record to grant course access
        try {
          const { data: existingPurchase } = await supabase
            .from('purchases')
            .select('id')
            .eq('user_id', payment.user_id)
            .eq('course_id', payment.course_id)
            .single()

          if (!existingPurchase) {
            const { error: purchaseError } = await supabase
              .from('purchases')
              .insert({
                user_id: payment.user_id,
                course_id: payment.course_id,
                payment_id: payment.id,
                access_granted: true,
                purchase_date: new Date().toISOString()
              })

            if (purchaseError) {
              console.error('Error creating purchase record:', purchaseError)
            } else {
              console.log(`Purchase record created for user: ${payment.user_id}, course: ${payment.course_id}`)
            }
          } else {
            // Update existing purchase to grant access
            await supabase
              .from('purchases')
              .update({
                access_granted: true,
                payment_id: payment.id
              })
              .eq('id', existingPurchase.id)
            
            console.log(`Purchase access granted for existing record: ${existingPurchase.id}`)
          }
        } catch (purchaseError) {
          console.error('Error handling purchase record:', purchaseError)
        }
        
        // Send confirmation email if email service is available
        try {
          const { sendEmail } = await import('@/lib/email')
          await sendEmail({
            to: payment.profiles.email,
            template: 'payment-success',
            data: {
              studentName: payment.profiles.name,
              courseName: payment.courses.title,
              amount: payment.amount,
              paymentId: payment_id
            }
          })
          console.log('✅ Confirmation email sent successfully to:', payment.profiles.email)
        } catch (emailError) {
          console.error('❌ Error sending confirmation email:', emailError)
        }
      }

      return NextResponse.json({ status: 'success' })
    }

    console.log(`Payment failed for order: ${order_id}`)
    return NextResponse.json({ error: 'Invalid payment' }, { status: 400 })

  } catch (error) {
    console.error('PayHere callback error:', error)
    return NextResponse.json({ error: 'Failed to process payment callback' }, { status: 500 })
  }
}