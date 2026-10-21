import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/admin/auth';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const isAuthed = await isAuthenticatedAdmin(req);
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP, AVIF` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = `product_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase.storage
        .from('lyven-products')
        .upload(safeName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        throw new Error(`Supabase Storage upload failed: ${error.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('lyven-products')
        .getPublicUrl(safeName);

      return NextResponse.json({
        success: true,
        data: {
          url: publicUrlData.publicUrl,
          path: data.path,
          name: safeName,
        },
      });
    }

    // Fallback if Supabase credentials are not yet entered in environment
    return NextResponse.json({
      success: false,
      error: 'Supabase Storage is not configured. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local to enable real image uploads.',
    }, { status: 503 });
  } catch (err: any) {
    console.error('Image upload error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
