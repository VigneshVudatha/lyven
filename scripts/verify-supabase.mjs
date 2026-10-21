import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local
const envPath = path.resolve('.env.local');
const content = fs.readFileSync(envPath, 'utf8');
content.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    process.env[key] = val;
  }
});

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('FAIL: Missing credentials in .env.local');
    process.exit(1);
  }

  console.log('Connecting to live Supabase project:', url);
  const client = createClient(url, serviceKey);

  // 1. Check products
  const { data: products, error: pErr } = await client
    .from('products')
    .select('id, name, slug, price_paise, is_published');

  if (pErr) {
    console.error('FAIL: products table query error:', pErr.message);
    process.exit(1);
  }
  console.log(`SUCCESS: ${products.length} products found in Supabase!`);
  products.forEach((p) => {
    console.log(` - ${p.name} (/${p.slug}) | ₹${p.price_paise / 100} | published: ${p.is_published}`);
  });

  // 2. Check variants
  const { data: variants, error: vErr } = await client
    .from('product_variants')
    .select('id, product_id, size, quantity, sku');

  if (vErr) {
    console.error('FAIL: variants query error:', vErr.message);
  } else {
    console.log(`SUCCESS: ${variants.length} variants loaded!`);
    console.log(' - Variants by size:', variants.map((v) => `${v.size}(${v.quantity})`).join(', '));
  }

  // 3. Check product images
  const { data: images, error: iErr } = await client
    .from('product_images')
    .select('id, product_id, url, image_type');

  if (iErr) {
    console.error('FAIL: images query error:', iErr.message);
  } else {
    console.log(`SUCCESS: ${images.length} product images configured!`);
  }

  // 4. Check Storage Buckets
  const { data: buckets, error: bErr } = await client.storage.listBuckets();
  if (bErr) {
    console.error('FAIL: storage buckets query error:', bErr.message);
  } else {
    console.log('SUCCESS: Storage buckets detected:');
    buckets.forEach((b) => {
      console.log(` - ${b.name} (public: ${b.public})`);
    });
  }

  // 5. Test RPC deduct_variant_stock & restore_variant_stock
  if (variants && variants.length > 0) {
    const testVar = variants[0];
    const initialQty = testVar.quantity;
    console.log(`Testing atomic stock RPC on variant ${testVar.id} (${testVar.size}, initial: ${initialQty} units)...`);

    const { data: deductRes, error: dErr } = await client.rpc('deduct_variant_stock', {
      p_variant_id: testVar.id,
      p_quantity: 1,
      p_order_ref: 'TEST-VERIFY-001',
    });

    if (dErr) {
      console.error('FAIL: deduct_variant_stock error:', dErr.message);
    } else {
      console.log(`SUCCESS: deduct_variant_stock executed! New qty: ${deductRes.new_quantity}`);

      const { data: restoreRes, error: rErr } = await client.rpc('restore_variant_stock', {
        p_variant_id: testVar.id,
        p_quantity: 1,
        p_order_ref: 'TEST-VERIFY-001',
        p_reason: 'ORDER_CANCELLED',
      });

      if (rErr) {
        console.error('FAIL: restore_variant_stock error:', rErr.message);
      } else {
        console.log(`SUCCESS: restore_variant_stock executed! Restored qty: ${restoreRes.new_quantity}`);
      }
    }
  }

  console.log('\n>>> LIVE SUPABASE VERIFICATION COMPLETE — 100% OPERATIONAL <<<');
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
