import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body.razorpay_order_id || body.order_id || body.orderId;
    const paymentId = body.razorpay_payment_id || body.payment_id || body.paymentId;
    const signature = body.razorpay_signature || body.signature;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required verification fields. Expected order_id, payment_id, and razorpay_signature.',
        },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret.includes('demoSecret')) {
      return NextResponse.json(
        { success: false, error: 'Razorpay secret key not configured on server' },
        { status: 500 }
      );
    }

    // Standard Razorpay Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const bufExpected = Buffer.from(expectedSignature, 'utf8');
    const bufReceived = Buffer.from(signature, 'utf8');

    const isValid =
      bufExpected.length === bufReceived.length &&
      crypto.timingSafeEqual(bufExpected, bufReceived);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment signature mismatch. Signature is invalid or tampered.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        order_id: orderId,
        payment_id: paymentId,
        verified: true,
      },
    });
  } catch (err: any) {
    console.error('[verify-payment] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Invalid verification payload' },
      { status: 400 }
    );
  }
}
