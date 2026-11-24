import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/admin/auth';
import {
  getAllOrders,
  updateOrder,
  getOrderById,
  deleteTestOrder,
  markOrderAsTest,
  archiveOrder,
  deleteOrder,
  checkOrderDeletionEligibility,
} from '@/lib/db/repository';
import {
  sendOrderStatusUpdateNotification,
  sendOrderCancellationNotification,
} from '@/lib/email/notifications';
import type { DashboardStats, FulfilmentStatus, PaymentStatus } from '@/types';

export async function GET(req: NextRequest) {
  const isAuthed = await isAuthenticatedAdmin(req);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const allOrders = await getAllOrders();

  // Compute dashboard metrics
  const stats: DashboardStats = {
    totalOrders: allOrders.length,
    pendingOrders: allOrders.filter((o) => o.fulfilmentStatus === 'CONFIRMED').length,
    confirmedOrders: allOrders.filter((o) => o.fulfilmentStatus === 'CONFIRMED').length,
    processingOrders: allOrders.filter((o) => o.fulfilmentStatus === 'PROCESSING').length,
    shippedOrders: allOrders.filter((o) => o.fulfilmentStatus === 'SHIPPED').length,
    deliveredOrders: allOrders.filter((o) => o.fulfilmentStatus === 'DELIVERED').length,
    cancelledOrders: allOrders.filter((o) => o.fulfilmentStatus === 'CANCELLED').length,
    paidCount: allOrders.filter((o) => o.paymentStatus === 'PAID').length,
    unpaidCount: allOrders.filter((o) => o.paymentStatus === 'PENDING').length,
    onlineRevenuePaise: allOrders
      .filter((o) => o.paymentMethod === 'ONLINE' && o.paymentStatus === 'PAID')
      .reduce((acc, o) => acc + o.totalPaise, 0),
    codRevenuePaise: allOrders
      .filter((o) => o.paymentMethod === 'COD' && o.paymentStatus === 'PAID')
      .reduce((acc, o) => acc + o.totalPaise, 0),
    codPendingPaise: allOrders
      .filter((o) => o.paymentMethod === 'COD' && o.paymentStatus === 'PENDING')
      .reduce((acc, o) => acc + o.totalPaise, 0),
  };

  return NextResponse.json({
    success: true,
    data: {
      orders: allOrders,
      stats,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const isAuthed = await isAuthenticatedAdmin(req);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      orderId,
      fulfilmentStatus,
      paymentStatus,
      courierName,
      trackingId,
      trackingUrl,
      notes,
      cancellationReason,
      isTest,
      isArchived,
    } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Explicit archive / restore
    if (isArchived !== undefined) {
      const archived = await archiveOrder(orderId, Boolean(isArchived));
      return NextResponse.json({
        success: true,
        message: isArchived ? 'Order archived successfully' : 'Order restored successfully',
        data: archived,
      });
    }

    // Explicit test tagging
    if (isTest !== undefined) {
      await markOrderAsTest(orderId, Boolean(isTest));
    }

    const updates: any = {};
    if (fulfilmentStatus) updates.fulfilmentStatus = fulfilmentStatus as FulfilmentStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus as PaymentStatus;
    if (courierName !== undefined) updates.courierName = courierName;
    if (trackingId !== undefined) updates.trackingId = trackingId;
    if (trackingUrl !== undefined) updates.trackingUrl = trackingUrl;
    if (notes !== undefined) updates.notes = notes;
    if (cancellationReason !== undefined) updates.cancellationReason = cancellationReason;

    const updated = await updateOrder(orderId, updates);

    // Dispatch status update or cancellation notifications
    try {
      if (updated) {
        if (fulfilmentStatus === 'CANCELLED' && order.fulfilmentStatus !== 'CANCELLED') {
          await sendOrderCancellationNotification(updated, cancellationReason);
        } else if (fulfilmentStatus && fulfilmentStatus !== order.fulfilmentStatus) {
          await sendOrderStatusUpdateNotification(updated, order.fulfilmentStatus, fulfilmentStatus);
        }
      }
    } catch (notifErr: any) {
      console.warn('[Notifications] Admin order update notification warning:', notifErr?.message || notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuthed = await isAuthenticatedAdmin(req);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    let orderId = searchParams.get('orderId');
    let hardDelete = searchParams.get('hardDelete') === 'true';

    // Also support JSON body if sent via fetch DELETE with body
    if (!orderId) {
      const body = await req.json().catch(() => ({}));
      orderId = body.orderId;
      if (body.hardDelete !== undefined) hardDelete = Boolean(body.hardDelete);
    }

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const result = await deleteOrder(orderId, hardDelete);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          suggestArchive: result.suggestArchive,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      archived: result.archived,
      permanentlyDeleted: result.permanentlyDeleted,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Delete operation failed' }, { status: 500 });
  }
}
