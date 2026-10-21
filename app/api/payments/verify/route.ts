import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getOrderById,
  updateOrder,
  deductVariantStock,
  getPaymentByOrderId,
  updatePayment,
} from '@/lib/db/repository';

interface VerifyPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: VerifyPayload = await req.json();

    if (!body.orderId || !body.razorpayOrderId || !body.razorpayPaymentId || !body.razorpaySignature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await getOrderById(body.orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if already verified (idempotent)
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        data: { orderRef: order.orderRef, status: 'already_paid' },
      });
    }

    // Verify the Razorpay signature
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (secret) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${body.razorpayOrderId}|${body.razorpayPaymentId}`)
        .digest('hex');

      const isSignatureValid =
        signatureSafeEqual(expectedSignature, body.razorpaySignature);

      if (!isSignatureValid) {
        // Mark payment as failed
        await updateOrder(order.id, { paymentStatus: 'FAILED' });

        return NextResponse.json(
          { success: false, error: 'Payment verification failed — invalid signature' },
          { status: 400 }
        );
      }
    } else {
      console.warn('[DEV] Razorpay secret not configured, skipping signature verification');
    }

    // Update order payment status
    await updateOrder(order.id, {
      paymentStatus: 'PAID',
      razorpayPaymentId: body.razorpayPaymentId,
    });

    // Deduct stock for online payments
    for (const item of order.items) {
      await deductVariantStock(item.variantId, item.quantity);
    }

    // Update payment record
    const paymentRecord = await getPaymentByOrderId(body.orderId);
    if (paymentRecord) {
      await updatePayment(body.orderId, {
        razorpayPaymentId: body.razorpayPaymentId,
        razorpaySignature: body.razorpaySignature,
        verified: true,
        status: 'PAID',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderRef: order.orderRef,
        status: 'paid',
      },
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function signatureSafeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
