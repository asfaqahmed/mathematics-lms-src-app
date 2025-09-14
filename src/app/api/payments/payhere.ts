import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase-admin';

export async function POST(request) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');
  const body = await request.json();

  const merchant_id = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID;
  const merchant_secret = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_SECRET;

  if (!merchant_id || !merchant_secret) {
    return NextResponse.json({ error: 'PayHere credentials not configured' }, { status: 500 });
  }

  // Generate hash for payment start
  if (action === 'start') {
    const { courseId, userId, amount, title } = body;

    if (!courseId || !userId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique order ID
    const order_id = crypto.randomUUID();

    // Create payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        id: order_id,
        user_id: userId,
        course_id: courseId,
        amount: amount,
        status: 'pending',
        method: 'payhere'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    // Generate PayHere hash
    const hash = crypto
      .createHash('md5')
      .update(
        merchant_id +
          order_id +
          parseFloat(amount).toFixed(2) +
          'LKR' +
          crypto
            .createHash('md5')
            .update(merchant_secret)
            .digest('hex')
            .toUpperCase()
      )
      .digest('hex')
      .toUpperCase();

    return NextResponse.json({
      hash,
      merchant_id,
      order_id,
      amount: parseFloat(amount).toFixed(2)
    });
  }

  // Verify payment notification
  if (action === 'notify') {
    const { order_id, payhere_amount, payhere_currency, status_code, md5sig, payment_id } = body;

    console.log('PayHere callback received:', body);

    // Generate local hash for verification
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
      .toUpperCase();

    if (local_md5sig === md5sig && status_code === '2') {
      // Update payment status in database
      const { data: payment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          payhere_payment_id: payment_id
        })
        .eq('id', order_id)
        .select()
        .single();

      if (updateError) {
        console.error('Payment update error:', updateError);
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
      }

      if (payment) {
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
      }

      console.log(`Payment successful for order: ${order_id}`);
      return NextResponse.json({ status: 'success' });
    }

    console.log(`Payment verification failed for order: ${order_id}`);
    return NextResponse.json({ error: 'Invalid payment' }, { status: 400 });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}