import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret || keyId.includes('demoKey') || keySecret.includes('demoSecret')) {
      return NextResponse.json(
        { success: false, error: 'Razorpay API credentials not configured' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount);
    const currency = (body.currency || 'INR').toUpperCase();
    const receipt = body.receipt || `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Validate minimum amount (>= 100 paise / ₹1)
    if (isNaN(amount) || amount < 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order amount must be at least 100 paise (₹1)',
        },
        { status: 400 }
      );
    }

    const Razorpay = (await import('razorpay')).default;
    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    try {
      const order = await rzp.orders.create({
        amount: Math.round(amount),
        currency,
        receipt,
        notes: body.notes,
      });

      return NextResponse.json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId,
      });
    } catch (apiErr: any) {
      console.error('[Razorpay API Error] orders.create:', apiErr);
      const isAuthError = apiErr?.statusCode === 401;
      return NextResponse.json(
        {
          success: false,
          error:
            apiErr?.error?.description ||
            apiErr?.message ||
            'Razorpay order creation failed on payment gateway',
        },
        { status: isAuthError ? 401 : 500 }
      );
    }
  } catch (err: any) {
    console.error('[create-order] Server exception:', err);
    return NextResponse.json(
      { success: false, error: 'Internal order creation service failure' },
      { status: 500 }
    );
  }
}
