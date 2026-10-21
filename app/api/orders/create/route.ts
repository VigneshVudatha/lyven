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
      const rzpKeyId = process.env.RAZORPAY_KEY_ID;
      const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

      const isConfigured = Boolean(
        rzpKeyId &&
        rzpKeySecret &&
        !rzpKeyId.includes('demoKey') &&
        !rzpKeySecret.includes('demoSecret')
      );

      if (!isConfigured) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Online payment gateway is not yet configured. Please select Cash on Delivery (COD) to place your order, or contact us on WhatsApp.',
          },
          { status: 503 }
        );
      }

      try {
        const Razorpay = (await import('razorpay')).default;
        const rzp = new Razorpay({
          key_id: rzpKeyId,
          key_secret: rzpKeySecret,
        });

        const rzpOrder = await rzp.orders.create({
          amount: totalPaise,
          currency: 'INR',
          receipt: orderRef,
        });

        razorpayOrderId = rzpOrder.id;
      } catch (err: any) {
        console.error('Razorpay order creation failed:', err.message);
        return NextResponse.json(
          {
            success: false,
            error: 'Razorpay service unavailable. Please select Cash on Delivery (COD) or try again later.',
          },
          { status: 503 }
        );
      }
    }

    // Create order
    const order: Order & { idempotencyKey: string } = {
      id: orderId,
      orderRef,
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

    // Store order (Firestore with in-memory fallback)
    await saveOrder(order);

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
        razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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
