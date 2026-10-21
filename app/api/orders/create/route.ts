import { NextRequest, NextResponse } from 'next/server';
import { validateCheckoutPayload } from '@/lib/validation';
import { getProductBySlug, getVariantById, SEED_PRODUCTS, SEED_VARIANTS } from '@/lib/products/data';
import { generateOrderRef, calculateTotals, sanitize } from '@/lib/utils';
import type { CheckoutPayload, Order, OrderItem, PaymentRecord } from '@/types';

import {
  hasIdempotencyKey,
  getOrderByKey,
  saveOrder,
  savePayment,
  deductVariantStock,
  inMemoryOrders as orders,
  inMemoryPayments as payments,
} from '@/lib/db/repository';
import { sendAdminOrderNotification, sendCustomerOrderConfirmation } from '@/lib/email/notifications';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutPayload = await req.json();

    // Idempotency check
    if (await hasIdempotencyKey(body.idempotencyKey)) {
      const existingOrder = await getOrderByKey(body.idempotencyKey);
      if (existingOrder) {
        return NextResponse.json({
          success: true,
          data: {
            orderId: existingOrder.id,
            orderRef: existingOrder.orderRef,
            totalPaise: existingOrder.totalPaise,
            paymentMethod: existingOrder.paymentMethod,
            razorpayOrderId: existingOrder.razorpayOrderId,
            razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          },
        });
      }
    }

    // Validate payload
    const errors = validateCheckoutPayload(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors[0].message, errors },
        { status: 400 }
      );
    }

    // Validate items against server-side product data
    const orderItems: OrderItem[] = [];

    for (const item of body.items) {
      const variant = SEED_VARIANTS.find((v) => v.id === item.variantId);
      if (!variant || !variant.active) {
        return NextResponse.json(
          { success: false, error: `Invalid variant: ${item.variantId}` },
          { status: 400 }
        );
      }

      const product = SEED_PRODUCTS.find((p) => p.id === variant.productId);
      if (!product || !product.active) {
        return NextResponse.json(
          { success: false, error: `Product not available` },
          { status: 400 }
        );
      }

      if (item.quantity < 1 || item.quantity > 5) {
        return NextResponse.json(
          { success: false, error: `Invalid quantity for ${product.name}` },
          { status: 400 }
        );
      }

      // Check stock (in production, use Firestore transaction)
      if (variant.quantity < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${product.name} (${variant.size})` },
          { status: 400 }
        );
      }

      // Use SERVER-SIDE price, never trust client
      orderItems.push({
        productId: product.id,
        variantId: variant.id,
        sku: variant.sku,
        name: product.name,
        slug: product.slug,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        unitPricePaise: product.pricePaise,
        totalPricePaise: product.pricePaise * item.quantity,
        image: product.images[0]?.url || '',
      });
    }

    // Calculate totals from server-side data
    const { subtotalPaise, deliveryChargePaise, taxPaise, totalPaise } = calculateTotals(
      orderItems.map((i) => ({ unitPricePaise: i.unitPricePaise, quantity: i.quantity })),
      0, // delivery charge
      0  // tax rate
    );

    const orderRef = generateOrderRef();
    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    let razorpayOrderId: string | undefined;

    // Create Razorpay order for online payment
    if (body.paymentMethod === 'ONLINE') {
      const rzpKeyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)?.trim();
      const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

      if (
        !rzpKeyId ||
        !rzpKeySecret ||
        rzpKeyId.includes('demoKey') ||
        rzpKeySecret.includes('demoSecret')
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Online payment gateway is not yet configured. Please select Cash on Delivery (COD) to place your order, or contact us on WhatsApp.',
          },
          { status: 503 }
        );
      }

      // Check mode format: must start with rzp_test_ or rzp_live_
      const isTestKey = rzpKeyId.startsWith('rzp_test_');
      const isLiveKey = rzpKeyId.startsWith('rzp_live_');
      if (!isTestKey && !isLiveKey) {
        console.error('[Razorpay Config Error] Invalid key_id format. Must start with rzp_test_ or rzp_live_');
        return NextResponse.json(
          { success: false, error: 'Payment gateway configuration error. Please choose Cash on Delivery (COD).' },
          { status: 503 }
        );
      }

      // Ensure amount is integer in paise and at least 100 paise (₹1)
      const orderAmountPaise = Math.round(Number(totalPaise));
      if (isNaN(orderAmountPaise) || orderAmountPaise < 100) {
        return NextResponse.json(
          { success: false, error: 'Order total must be at least ₹1 (100 paise)' },
          { status: 400 }
        );
      }

      try {
        const Razorpay = (await import('razorpay')).default;
        const rzp = new Razorpay({
          key_id: rzpKeyId,
          key_secret: rzpKeySecret,
        });

        const rzpOrder = await rzp.orders.create({
          amount: orderAmountPaise,
          currency: 'INR',
          receipt: orderRef.slice(0, 40),
          notes: {
            orderRef,
          },
        });

        razorpayOrderId = rzpOrder.id;
      } catch (err: any) {
        const upstreamStatus = err?.statusCode || (err?.error?.code ? 400 : 500);
        const errorCode = err?.error?.code || 'RAZORPAY_ERROR';
        const errorDesc = err?.error?.description || err?.message || 'Upstream provider rejected order creation';

        console.error('[Razorpay Order Creation Failed]', {
          upstreamStatus,
          errorCode,
          errorDesc,
          keyMode: isLiveKey ? 'live' : 'test',
          orderRef,
          amountPaise: orderAmountPaise,
        });

        const isAuthError = upstreamStatus === 401 || String(errorDesc).toLowerCase().includes('auth');
        const userFacingMessage = isAuthError
          ? 'Payment gateway authorization failed. Please contact support or select Cash on Delivery (COD).'
          : 'Razorpay service temporarily unavailable. Please select Cash on Delivery (COD) or try again later.';

        return NextResponse.json(
          {
            success: false,
            error: userFacingMessage,
            code: errorCode,
          },
          { status: 503 }
        );
      }
    }

    // Securely extract authenticated customer user_id from server session cookies
    // (Never trusting or relying on client browser payload for ownership)
    let authenticatedUserId: string | undefined;
    try {
      const supabaseUserClient = await createClient();
      const {
        data: { user: authUser },
      } = await supabaseUserClient.auth.getUser();
      if (authUser?.id) {
        authenticatedUserId = authUser.id;
      }
    } catch {
      // Unauthenticated checkout proceeds safely as guest
    }

    // Create order
    const order: Order & { idempotencyKey: string } = {
      id: orderId,
      orderRef,
      userId: authenticatedUserId,
      customer: {
        fullName: sanitize(body.customer.fullName),
        mobile: body.customer.mobile,
        email: body.customer.email || undefined,
        houseFlat: sanitize(body.customer.houseFlat),
        streetLocality: sanitize(body.customer.streetLocality),
        city: sanitize(body.customer.city),
        state: body.customer.state,
        pinCode: body.customer.pinCode,
        deliveryInstructions: body.customer.deliveryInstructions
          ? sanitize(body.customer.deliveryInstructions)
          : undefined,
      },
      items: orderItems,
      subtotalPaise,
      deliveryChargePaise,
      taxPaise,
      totalPaise,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      fulfilmentStatus: 'CONFIRMED',
      razorpayOrderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      idempotencyKey: body.idempotencyKey,
    };

    // Store order in Supabase
    await saveOrder(order);

    // Asynchronously dispatch transactional notifications (non-blocking)
    sendAdminOrderNotification(order).catch((err) =>
      console.warn('[Notifications] Failed to send admin alert:', err?.message || err)
    );
    if (order.customer.email) {
      sendCustomerOrderConfirmation(order).catch((err) =>
        console.warn('[Notifications] Failed to send customer confirmation:', err?.message || err)
      );
    }

    // Deduct stock for COD
    if (body.paymentMethod === 'COD') {
      for (const item of body.items) {
        await deductVariantStock(item.variantId, item.quantity);
      }
    }

    // Create payment record for online orders
    if (body.paymentMethod === 'ONLINE' && razorpayOrderId) {
      const paymentRecord: PaymentRecord = {
        id: `pay_${Date.now()}`,
        orderId,
        orderRef,
        razorpayOrderId,
        verified: false,
        amountPaise: totalPaise,
        currency: 'INR',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await savePayment(paymentRecord);
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        orderRef,
        totalPaise,
        paymentMethod: body.paymentMethod,
        razorpayOrderId,
        razorpayKeyId: (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID)?.trim(),
      },
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export orders map for other routes
export { orders, payments };
