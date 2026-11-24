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
    
    // Support both multiple files ('files') and legacy single file ('file')
    const incomingFiles = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    
    const filesToUpload: File[] = incomingFiles.length > 0 
      ? incomingFiles 
      : (singleFile ? [singleFile] : []);

    if (filesToUpload.length === 0) {
      return NextResponse.json({ success: false, error: 'No files uploaded' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Supabase Storage is not configured. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local to enable real image uploads.',
      }, { status: 503 });
    }

    const supabase = getSupabaseAdmin();
    const uploadedFiles: Array<{ url: string; path: string; name: string }> = [];
    const errors: Array<{ fileName: string; error: string }> = [];

    for (const file of filesToUpload) {
      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push({
          fileName: file.name,
          error: `Invalid file type (${file.type}). Allowed: JPG, PNG, WEBP, AVIF`,
        });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push({
          fileName: file.name,
          error: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
        });
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const safeName = `product_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { data, error } = await supabase.storage
          .from('lyven-products')
          .upload(safeName, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (error) {
          errors.push({ fileName: file.name, error: error.message });
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('lyven-products')
          .getPublicUrl(safeName);

        uploadedFiles.push({
          url: publicUrlData.publicUrl,
          path: data.path,
          name: safeName,
        });
      } catch (fileErr: any) {
        errors.push({ fileName: file.name, error: fileErr?.message || 'Upload exception' });
      }
    }

    // If all uploads failed
    if (uploadedFiles.length === 0) {
      return NextResponse.json({
        success: false,
        error: errors.map((e) => `${e.fileName}: ${e.error}`).join('; ') || 'Failed to upload files',
        errors,
      }, { status: 400 });
    }

    // Success (even if partial)
    return NextResponse.json({
      success: true,
      data: {
        // Backward-compatible single-file properties
        url: uploadedFiles[0]?.url,
        path: uploadedFiles[0]?.path,
        name: uploadedFiles[0]?.name,
        // Multi-file results
        files: uploadedFiles,
        totalUploaded: uploadedFiles.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (err: any) {
    console.error('Image upload error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
