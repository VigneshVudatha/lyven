import { NextRequest, NextResponse } from 'next/server';
import { saveCustomDesignEnquiry } from '@/lib/db/repository';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    let apparelId = 'oversized_tee';
    let apparelName = 'Oversized Tee';
    let fabric = '240 GSM French Terry Cotton';
    let description = '';
    let customerName = '';
    let customerPhone = '';
    let referenceFileName: string | undefined;
    let referenceFileUrl: string | undefined;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      apparelId = (formData.get('apparelId') as string) || apparelId;
      apparelName = (formData.get('apparelName') as string) || apparelName;
      fabric = (formData.get('fabric') as string) || fabric;
      description = (formData.get('description') as string) || '';
      customerName = (formData.get('customerName') as string) || '';
      customerPhone = (formData.get('customerPhone') as string) || '';

      const file = formData.get('file') as File | null;
      if (file && file.size > 0) {
        referenceFileName = file.name;

        if (isSupabaseConfigured()) {
          try {
            const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            const safeName = `enquiry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
            const buffer = Buffer.from(await file.arrayBuffer());

            const supabase = getSupabaseAdmin();
            const { error: uploadErr } = await supabase.storage
              .from('custom-designs')
              .upload(safeName, buffer, {
                contentType: file.type || 'image/jpeg',
                upsert: true,
              });

            if (!uploadErr) {
              const { data: urlData } = supabase.storage
                .from('custom-designs')
                .getPublicUrl(safeName);
              referenceFileUrl = urlData.publicUrl;
            } else {
              console.warn('[Supabase Storage] Custom design upload warning:', uploadErr.message);
            }
          } catch (storageErr) {
            console.warn('[Supabase Storage] Error storing custom reference image:', storageErr);
          }
        }
      }
    } else {
      const body = await req.json();
      apparelId = body.apparelId || apparelId;
      apparelName = body.apparelName || apparelName;
      fabric = body.fabric || fabric;
      description = body.description || '';
      customerName = body.customerName || '';
      customerPhone = body.customerPhone || '';
      referenceFileName = body.referenceFileName;
      referenceFileUrl = body.referenceFileUrl;
    }

    // Build the WhatsApp message and link
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6300107759';
    const lines = [
      'Hello LYVEN! I would like to enquire about a custom apparel design.',
      '',
      `Product: ${apparelName} (${fabric})`,
    ];

    if (description.trim()) {
      lines.push('', `My idea: ${description.trim()}`);
    }

    if (referenceFileUrl) {
      lines.push('', `Reference Artwork: ${referenceFileUrl}`);
    } else if (referenceFileName) {
      lines.push('', `Reference file: Attached "${referenceFileName}"`);
    }

    lines.push('', 'Please help me discuss the design, preview, and pricing.');

    const whatsappMessage = lines.join('\n');
    const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    // Persist enquiry record to Supabase
    const saved = await saveCustomDesignEnquiry({
      apparelId,
      apparelName,
      fabric,
      description,
      customerName,
      customerPhone,
      referenceFileName,
      referenceFileUrl,
      whatsappUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Custom design enquiry persisted successfully',
      data: saved,
      whatsappUrl,
    });
  } catch (err: any) {
    console.error('Custom design enquiry error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}
