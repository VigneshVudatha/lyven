import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getOrderById,
  getOrderByRazorpayOrderId,
  updateOrder,
  deductVariantStock,
  getPaymentByOrderId,
  updatePayment,
  transitionOrderToPaid,
} from '@/lib/db/repository';
import { sendPaymentSuccessNotification } from '@/lib/email/notifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body.orderId || body.order_id;
    const razorpayOrderId = body.razorpayOrderId || body.razorpay_order_id;
    const razorpayPaymentId = body.razorpayPaymentId || body.razorpay_payment_id;
    const razorpaySignature = body.razorpaySignature || body.razorpay_signature;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required payment verification data (razorpayOrderId, razorpayPaymentId, razorpaySignature)',
        },
        { status: 400 }
      );
    }

    // Locate the order by ID or Razorpay Order ID
    let order = null;
    if (orderId) {
      order = await getOrderById(orderId);
    }
    if (!order && razorpayOrderId) {
      order = await getOrderByRazorpayOrderId(razorpayOrderId);
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order matching payment details not found' },
        { status: 404 }
      );
    }

    // Idempotency: if already paid, return early to prevent duplicate stock deduction
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        message: 'Order was already verified and marked as paid',
        data: { orderRef: order.orderRef, status: 'already_paid' },
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!secret || secret.includes('demoSecret')) {
      return NextResponse.json(
        { success: false, error: 'Server payment gateway secret not configured' },
        { status: 500 }
      );
    }

    // Cryptographic HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isSignatureValid = signatureSafeEqual(expectedSignature, razorpaySignature);

    if (!isSignatureValid) {
      // Mark payment as failed to prevent unpaid dispatch
      await updateOrder(order.id, { paymentStatus: 'FAILED' });

      return NextResponse.json(
        { success: false, error: 'Payment verification failed — invalid cryptographic signature' },
        { status: 400 }
      );
    }

    // Concurrency-safe atomic claim of the transition to PAID
    const claim = await transitionOrderToPaid(order.id, razorpayPaymentId);

    if (!claim.success) {
      if (claim.alreadyPaid) {
        return NextResponse.json({
          success: true,
          message: 'Order was already verified and marked as paid',
          data: { orderRef: order.orderRef, status: 'already_paid' },
        });
      }
      return NextResponse.json(
        { success: false, error: 'Failed to record payment confirmation' },
        { status: 500 }
      );
    }

    const paidOrder = claim.order!;

    // Concurrency-safe atomic stock deduction: ONLY executed by the winning claim
    for (const item of paidOrder.items) {
      await deductVariantStock(item.variantId, item.quantity);
    }

    // Update internal payment audit record
    const paymentRecord = await getPaymentByOrderId(paidOrder.id);
    if (paymentRecord) {
      await updatePayment(paidOrder.id, {
        razorpayPaymentId,
        razorpaySignature,
        verified: true,
        status: 'PAID',
      });
    }

    // Safely dispatch payment success notifications: ONLY executed by the winning claim
    try {
      await sendPaymentSuccessNotification(paidOrder, razorpayPaymentId);
    } catch (notifErr: any) {
      console.warn('[Notifications] Payment verification notification warning:', notifErr?.message || notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed',
      data: {
        orderRef: order.orderRef,
        status: 'paid',
      },
    });
  } catch (err: any) {
    console.error('[Payment Verification Exception]:', err);
    return NextResponse.json(
      { success: false, error: 'Internal payment verification error' },
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
