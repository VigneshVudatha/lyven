import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/admin/auth';
import { getInventoryMatrix, updateVariantQuantity } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  const isAuthed = await isAuthenticatedAdmin(req);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const inventory = await getInventoryMatrix();

  return NextResponse.json({
    success: true,
    data: inventory,
  });
}

export async function PATCH(req: NextRequest) {
  const isAuthed = await isAuthenticatedAdmin(req);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { variantId, quantity, active } = body;

    if (!variantId) {
      return NextResponse.json({ success: false, error: 'Variant ID is required' }, { status: 400 });
    }

    let q: number | undefined;
    if (quantity !== undefined) {
      q = parseInt(quantity, 10);
      if (isNaN(q) || q < 0) {
        return NextResponse.json({ success: false, error: 'Invalid stock quantity' }, { status: 400 });
      }
    }

    const updated = await updateVariantQuantity(variantId, q ?? 0, active !== undefined ? Boolean(active) : undefined);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Variant not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Stock updated for ${updated.sku}`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to update inventory' }, { status: 500 });
  }
}
