import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrdersByUserId } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to view your order history' },
        { status: 401 }
      );
    }

    const orders = await getOrdersByUserId(user.id);

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (err: any) {
    console.error('[My Orders API] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve order history' },
      { status: 500 }
    );
  }
}
