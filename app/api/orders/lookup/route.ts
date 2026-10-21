import { NextRequest, NextResponse } from 'next/server';
import { getOrderByRef } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');

  if (!ref) {
    return NextResponse.json(
      { success: false, error: 'Order reference required' },
      { status: 400 }
    );
  }

  const order = await getOrderByRef(ref.trim());

  if (!order) {
    return NextResponse.json(
      { success: false, error: 'Order not found' },
      { status: 404 }
    );
  }

  // Return order data
  return NextResponse.json({
    success: true,
    data: {
      orderId: order.id,
      orderRef: order.orderRef,
      items: order.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPricePaise: item.unitPricePaise,
        totalPricePaise: item.totalPricePaise,
        image: item.image,
      })),
      subtotalPaise: order.subtotalPaise,
      deliveryChargePaise: order.deliveryChargePaise,
      taxPaise: order.taxPaise,
      totalPaise: order.totalPaise,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      fulfilmentStatus: order.fulfilmentStatus,
      createdAt: order.createdAt,
      customer: {
        fullName: order.customer.fullName,
        houseFlat: order.customer.houseFlat,
        streetLocality: order.customer.streetLocality,
        city: order.customer.city,
        state: order.customer.state,
        pinCode: order.customer.pinCode,
      },
      deliveryCity: order.customer.city,
      deliveryState: order.customer.state,
      deliveryPinCode: order.customer.pinCode,
      courierName: order.courierName,
      trackingId: order.trackingId,
      trackingUrl: order.trackingUrl,
    },
  });
}
