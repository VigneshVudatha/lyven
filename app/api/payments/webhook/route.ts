import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getOrderByRazorpayOrderId,
  updateOrder,
  deductVariantStock,
  getPaymentByOrderId,
  updatePayment,
} from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Validate signature if webhook secret is configured
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json(
          { success: false, error: 'Missing x-razorpay-signature header' },
          { status: 400 }
        );
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const isSignatureValid = signatureSafeEqual(expectedSignature, signature);

      if (!isSignatureValid) {
        console.warn('[Webhook] Invalid Razorpay webhook signature');
        return NextResponse.json(
          { success: false, error: 'Invalid webhook signature' },
          { status: 400 }
        );
      }
    } else {
      console.warn('[DEV] RAZORPAY_WEBHOOK_SECRET not configured, skipping webhook signature check');
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
    const rzpPaymentId = paymentEntity?.id;

    if (!rzpOrderId) {
      // Event without order ID (e.g., test ping), acknowledge gracefully
      return NextResponse.json({ status: 'ignored_no_order_id' });
    }

    // Lookup order by razorpayOrderId
    const order = await getOrderByRazorpayOrderId(rzpOrderId);
    if (!order) {
      console.warn(`[Webhook] Order not found for Razorpay order ID: ${rzpOrderId}`);
      return NextResponse.json({ status: 'order_not_found' });
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      if (order.paymentStatus !== 'PAID') {
        // Mark order as PAID
        await updateOrder(order.id, {
          paymentStatus: 'PAID',
          razorpayPaymentId: rzpPaymentId || order.razorpayPaymentId,
        });

        // Deduct inventory stock
        for (const item of order.items) {
          await deductVariantStock(item.variantId, item.quantity);
        }

        // Update payment record
        const paymentRecord = await getPaymentByOrderId(order.id);
        if (paymentRecord) {
          await updatePayment(order.id, {
            razorpayPaymentId: rzpPaymentId || paymentRecord.razorpayPaymentId,
            verified: true,
            status: 'PAID',
          });
        }

        console.log(`[Webhook] Order ${order.orderRef} marked as PAID via webhook event: ${event}`);
      }
    } else if (event === 'payment.failed') {
      if (order.paymentStatus !== 'PAID') {
        await updateOrder(order.id, {
          paymentStatus: 'FAILED',
        });
        console.log(`[Webhook] Order ${order.orderRef} marked as FAILED via webhook event: ${event}`);
      }
    }

    return NextResponse.json({ status: 'ok', event, orderRef: order.orderRef });
  } catch (err: any) {
    console.error('[Webhook] Processing error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal webhook error' },
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
