import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin';
import { SEED_PRODUCTS, SEED_VARIANTS } from '@/lib/products/data';
import type {
  Product,
  ProductVariant,
  Order,
  PaymentRecord,
  CustomDesignEnquiry,
  FulfilmentStatus,
  PaymentStatus,
} from '@/types';

// ====================================================================
// In-Memory Fallback Cache (for offline dev & build-time pre-rendering)
// ====================================================================
const inMemoryOrders = new Map<string, Order & { idempotencyKey?: string }>();
const inMemoryPayments = new Map<string, PaymentRecord>();
const inMemoryProcessedKeys = new Set<string>();
const inMemoryEnquiries = new Map<string, CustomDesignEnquiry>();
const memoryProducts = new Map<string, Product>(SEED_PRODUCTS.map((p) => [p.id, { ...p }]));
const memoryVariants = new Map<string, ProductVariant>(SEED_VARIANTS.map((v) => [v.id, { ...v }]));

let demoSeeded = false;
export function ensureDemoOrdersSeeded() {
  if (demoSeeded || inMemoryOrders.size > 0) return;
  demoSeeded = true;

  const demo1: Order & { idempotencyKey?: string } = {
    id: 'ord_demo_01',
    orderRef: 'LYV-20261012-VK891',
    customer: {
      fullName: 'Aarav Sharma',
      mobile: '9876543210',
      email: 'aarav@example.com',
      houseFlat: 'Flat 402, Prestige Tower',
      streetLocality: 'Indiranagar 12th Main',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560038',
    },
    items: [
      {
        productId: 'prod_virat_kohli',
        variantId: 'var_vk_l',
        sku: 'LYV-VK-L',
        name: 'LYVEN Virat Kohli Graphic Oversized T-Shirt',
        slug: 'virat-kohli',
        size: 'L',
        color: 'Jet Black',
        quantity: 1,
        unitPricePaise: 40000,
        totalPricePaise: 40000,
        image: '/images/products/virat-kohli-tee-front.jpg',
      },
    ],
    subtotalPaise: 40000,
    deliveryChargePaise: 0,
    taxPaise: 0,
    totalPaise: 40000,
    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    fulfilmentStatus: 'PROCESSING',
    razorpayOrderId: 'order_rzp_demo_101',
    razorpayPaymentId: 'pay_rzp_demo_901',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    idempotencyKey: 'idemp_demo_01',
  };

  const demo2: Order & { idempotencyKey?: string } = {
    id: 'ord_demo_02',
    orderRef: 'LYV-20261012-MV412',
    customer: {
      fullName: 'Priya Iyer',
      mobile: '9845123456',
      email: 'priya.iyer@example.com',
      houseFlat: 'Villa 14, Palm Meadows',
      streetLocality: 'Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560066',
    },
    items: [
      {
        productId: 'prod_dude',
        variantId: 'var_dude_m',
        sku: 'LYV-DUDE-BLK-M',
        name: 'LYVEN DUDE Graphic Oversized T-Shirt',
        slug: 'dude',
        size: 'M',
        color: 'Jet Black',
        quantity: 2,
        unitPricePaise: 40000,
        totalPricePaise: 80000,
        image: '/images/products/dude-tee-front.jpg',
      },
    ],
    subtotalPaise: 80000,
    deliveryChargePaise: 0,
    taxPaise: 0,
    totalPaise: 80000,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    fulfilmentStatus: 'SHIPPED',
    courierName: 'BlueDart Express',
    trackingId: 'BD89021948IN',
    trackingUrl: 'https://www.bluedart.com',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    idempotencyKey: 'idemp_demo_02',
  };

  inMemoryOrders.set(demo1.id, demo1);
  inMemoryOrders.set(demo2.id, demo2);
  inMemoryProcessedKeys.add('idemp_demo_01');
  inMemoryProcessedKeys.add('idemp_demo_02');
}

// Helper to convert database product row to Product domain interface
function mapRowToProduct(p: any, images: any[] = []): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    pricePaise: p.price_paise,
    fit: p.fit || 'Oversized Boxy Silhouette',
    category: p.category || 'Oversized Graphic T-Shirts',
    careInstructions: p.care_instructions || undefined,
    active: Boolean(p.is_published),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    images: images
      .sort((a, b) => a.display_order - b.display_order)
      .map((img) => ({
        url: img.url,
        alt: img.alt_text || p.name,
        type: img.image_type || 'front',
        order: img.display_order || 0,
      })),
  };
}

// ====================================================================
// 1. PRODUCT OPERATIONS
// ====================================================================

export async function getAllProducts(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: productsData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!prodErr && productsData && productsData.length > 0) {
        const productIds = productsData.map((p) => p.id);
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('*')
          .in('product_id', productIds);

        return productsData.map((p) => {
          const imgs = (imagesData || []).filter((img) => img.product_id === p.id);
          return mapRowToProduct(p, imgs);
        });
      }
    } catch (err) {
      console.warn('[Supabase] getAllProducts error, using fallback:', err);
    }
  }

  return Array.from(memoryProducts.values()).filter((p) => p.active);
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: productsData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!prodErr && productsData && productsData.length > 0) {
        const productIds = productsData.map((p) => p.id);
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('*')
          .in('product_id', productIds);

        return productsData.map((p) => {
          const imgs = (imagesData || []).filter((img) => img.product_id === p.id);
          return mapRowToProduct(p, imgs);
        });
      }
    } catch (err) {
      console.warn('[Supabase] getAllProductsAdmin error, using fallback:', err);
    }
  }

  return Array.from(memoryProducts.values());
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: p, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (!error && p) {
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', p.id);

        return mapRowToProduct(p, imagesData || []);
      }
    } catch (err) {
      console.warn('[Supabase] getProductBySlug error, using fallback:', err);
    }
  }

  return Array.from(memoryProducts.values()).find((p) => p.slug === slug && p.active);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: p, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && p) {
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', p.id);

        return mapRowToProduct(p, imagesData || []);
      }
    } catch (err) {
      console.warn('[Supabase] getProductById error, using fallback:', err);
    }
  }

  return memoryProducts.get(id);
}

export async function createProduct(productData: {
  slug: string;
  name: string;
  description: string;
  pricePaise: number;
  compareAtPricePaise?: number;
  fit?: string;
  category?: string;
  fabric?: string;
  careInstructions?: string;
  isPublished?: boolean;
  images?: { url: string; altText?: string; imageType?: string; displayOrder?: number }[];
  variants?: { size: string; color?: string; sku: string; quantity: number }[];
}): Promise<Product> {
  const newId = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    // 1. Insert product
    const { data: insertedProd, error: prodErr } = await supabase
      .from('products')
      .insert({
        id: newId,
        slug: productData.slug,
        name: productData.name,
        description: productData.description,
        price_paise: productData.pricePaise,
        compare_at_price_paise: productData.compareAtPricePaise || null,
        fit: productData.fit || 'Oversized Boxy Silhouette',
        category: productData.category || 'Oversized Graphic T-Shirts',
        fabric: productData.fabric || '240 GSM French Terry Combed Cotton',
        care_instructions: productData.careInstructions || null,
        is_published: productData.isPublished !== undefined ? productData.isPublished : true,
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single();

    if (prodErr) {
      throw new Error(`Failed to create product in database: ${prodErr.message}`);
    }

    // 2. Insert Images
    if (productData.images && productData.images.length > 0) {
      const imageRows = productData.images.map((img, idx) => ({
        id: `img_${Date.now()}_${idx}`,
        product_id: newId,
        url: img.url,
        alt_text: img.altText || productData.name,
        image_type: img.imageType || 'front',
        display_order: img.displayOrder !== undefined ? img.displayOrder : idx,
        is_primary: idx === 0,
      }));
      await supabase.from('product_images').insert(imageRows);
    }

    // 3. Insert Variants
    if (productData.variants && productData.variants.length > 0) {
      const variantRows = productData.variants.map((v) => ({
        id: `var_${Date.now()}_${v.size.toLowerCase()}`,
        product_id: newId,
        size: v.size,
        color: v.color || 'Jet Black',
        sku: v.sku,
        quantity: v.quantity,
        is_active: true,
      }));
      await supabase.from('product_variants').insert(variantRows);
    }

    return (await getProductById(newId))!;
  }

  // Memory fallback
  const fallbackProduct: Product = {
    id: newId,
    slug: productData.slug,
    name: productData.name,
    description: productData.description,
    pricePaise: productData.pricePaise,
    fit: productData.fit || 'Oversized Boxy Silhouette',
    category: productData.category || 'Oversized Graphic T-Shirts',
    active: productData.isPublished !== undefined ? productData.isPublished : true,
    careInstructions: productData.careInstructions,
    createdAt: now,
    updatedAt: now,
    images: (productData.images || []).map((img, i) => ({
      url: img.url,
      alt: img.altText || productData.name,
      type: (img.imageType as any) || 'front',
      order: i,
    })),
  };
  memoryProducts.set(newId, fallbackProduct);

  (productData.variants || []).forEach((v) => {
    const varId = `var_${newId}_${v.size.toLowerCase()}`;
    memoryVariants.set(varId, {
      id: varId,
      productId: newId,
      size: v.size as any,
      color: v.color || 'Jet Black',
      sku: v.sku,
      quantity: v.quantity,
      active: true,
    });
  });

  return fallbackProduct;
}

export async function updateProduct(
  id: string,
  updates: {
    slug?: string;
    name?: string;
    description?: string;
    pricePaise?: number;
    fit?: string;
    category?: string;
    careInstructions?: string;
    isPublished?: boolean;
    images?: { url: string; altText?: string; imageType?: string; displayOrder?: number }[];
  }
): Promise<Product | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const updatePayload: any = { updated_at: now };
    if (updates.slug) updatePayload.slug = updates.slug;
    if (updates.name) updatePayload.name = updates.name;
    if (updates.description) updatePayload.description = updates.description;
    if (updates.pricePaise !== undefined) updatePayload.price_paise = updates.pricePaise;
    if (updates.fit) updatePayload.fit = updates.fit;
    if (updates.category) updatePayload.category = updates.category;
    if (updates.careInstructions !== undefined) updatePayload.care_instructions = updates.careInstructions;
    if (updates.isPublished !== undefined) updatePayload.is_published = updates.isPublished;

    const { error: updErr } = await supabase.from('products').update(updatePayload).eq('id', id);
    if (updErr) {
      throw new Error(`Failed to update product: ${updErr.message}`);
    }

    if (updates.images && updates.images.length > 0) {
      await supabase.from('product_images').delete().eq('product_id', id);
      const imageRows = updates.images.map((img, idx) => ({
        id: `img_${Date.now()}_${idx}`,
        product_id: id,
        url: img.url,
        alt_text: img.altText || updates.name || 'LYVEN Apparel',
        image_type: img.imageType || 'front',
        display_order: img.displayOrder !== undefined ? img.displayOrder : idx,
        is_primary: idx === 0,
      }));
      await supabase.from('product_images').insert(imageRows);
    }

    return (await getProductById(id)) || null;
  }

  // Memory fallback
  const existing = memoryProducts.get(id);
  if (!existing) return null;
  const updated: Product = {
    ...existing,
    slug: updates.slug || existing.slug,
    name: updates.name || existing.name,
    description: updates.description || existing.description,
    pricePaise: updates.pricePaise !== undefined ? updates.pricePaise : existing.pricePaise,
    fit: updates.fit || existing.fit,
    category: updates.category || existing.category,
    careInstructions: updates.careInstructions !== undefined ? updates.careInstructions : existing.careInstructions,
    active: updates.isPublished !== undefined ? updates.isPublished : existing.active,
    updatedAt: now,
    images: updates.images
      ? updates.images.map((img, i) => ({
          url: img.url,
          alt: img.altText || existing.name,
          type: (img.imageType as any) || 'front',
          order: i,
        }))
      : existing.images,
  };
  memoryProducts.set(id, updated);
  return updated;
}

export async function archiveProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('products').update({ is_published: false }).eq('id', id);
    return !error;
  }
  const prod = memoryProducts.get(id);
  if (prod) {
    prod.active = false;
    return true;
  }
  return false;
}

// ====================================================================
// 2. VARIANT & INVENTORY OPERATIONS
// ====================================================================

export async function getVariantsForProduct(productId: string): Promise<ProductVariant[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true);

      if (!error && data && data.length > 0) {
        return data.map((v) => ({
          id: v.id,
          productId: v.product_id,
          size: v.size,
          color: v.color,
          sku: v.sku,
          quantity: v.quantity,
          active: v.is_active,
        }));
      }
    } catch (err) {
      console.warn('[Supabase] getVariantsForProduct fallback:', err);
    }
  }

  return Array.from(memoryVariants.values()).filter(
    (v) => v.productId === productId && v.active
  );
}

export async function getVariantById(variantId: string): Promise<ProductVariant | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('id', variantId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          productId: data.product_id,
          size: data.size,
          color: data.color,
          sku: data.sku,
          quantity: data.quantity,
          active: data.is_active,
        };
      }
    } catch (err) {
      console.warn('[Supabase] getVariantById fallback:', err);
    }
  }

  return memoryVariants.get(variantId);
}

export async function updateVariantQuantity(
  variantId: string,
  quantity: number,
  active?: boolean,
  reason: string = 'MANUAL_ADJUSTMENT'
): Promise<ProductVariant | null> {
  const current = await getVariantById(variantId);
  if (!current) return null;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const prevQty = current.quantity;
    const upd: any = { quantity, updated_at: new Date().toISOString() };
    if (active !== undefined) upd.is_active = active;

    const { error: updErr } = await supabase.from('product_variants').update(upd).eq('id', variantId);
    if (!updErr) {
      // Log inventory movement audit
      await supabase.from('inventory_movements').insert({
        id: `inv_${Date.now()}`,
        variant_id: variantId,
        product_id: current.productId,
        change_quantity: quantity - prevQty,
        previous_quantity: prevQty,
        new_quantity: quantity,
        reason,
        reference_id: 'ADMIN_MANUAL_ADJUSTMENT',
      });

      return (await getVariantById(variantId)) || null;
    }
  }

  // Memory fallback
  const variant = memoryVariants.get(variantId);
  if (!variant) return null;
  variant.quantity = quantity;
  if (active !== undefined) variant.active = active;
  return variant;
}

export async function deductVariantStock(
  variantId: string,
  quantity: number,
  orderRef?: string
): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    // Use atomic RPC stored procedure
    const { error } = await supabase.rpc('deduct_variant_stock', {
      p_variant_id: variantId,
      p_quantity: quantity,
      p_order_ref: orderRef || 'STOREFRONT_CHECKOUT',
    });

    if (error) {
      console.warn('[Supabase] RPC deduct_variant_stock failed, falling back to atomic update:', error.message);
      // Fallback update
      const { data: v } = await supabase
        .from('product_variants')
        .select('quantity, product_id')
        .eq('id', variantId)
        .single();

      if (v) {
        const nextQty = Math.max(0, v.quantity - quantity);
        await supabase.from('product_variants').update({ quantity: nextQty }).eq('id', variantId);
        await supabase.from('inventory_movements').insert({
          variant_id: variantId,
          product_id: v.product_id,
          change_quantity: -quantity,
          previous_quantity: v.quantity,
          new_quantity: nextQty,
          reason: 'ORDER_PLACED',
          reference_id: orderRef,
        });
      }
    }
    return;
  }

  // Memory fallback
  const variant = memoryVariants.get(variantId);
  if (variant) {
    variant.quantity = Math.max(0, variant.quantity - quantity);
  }
}

export async function getInventoryMatrix() {
  const products = await getAllProductsAdmin();
  const matrix = [];

  for (const prod of products) {
    const variants = await getVariantsForProduct(prod.id);
    const totalStock = variants.reduce((acc, v) => acc + v.quantity, 0);
    matrix.push({
      product: prod,
      variants,
      totalStock,
      lowStockVariants: variants.filter((v) => v.quantity <= 5),
    });
  }

  return matrix;
}

// ====================================================================
// 3. ORDER OPERATIONS
// ====================================================================

export async function hasIdempotencyKey(key: string): Promise<boolean> {
  if (inMemoryProcessedKeys.has(key)) return true;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('orders')
        .select('id')
        .eq('idempotency_key', key)
        .maybeSingle();
      return Boolean(data);
    } catch (err) {
      console.warn('[Supabase] hasIdempotencyKey fallback:', err);
    }
  }

  return false;
}

export async function getOrderByKey(key: string): Promise<Order | null> {
  const memOrder = Array.from(inMemoryOrders.values()).find((o) => o.idempotencyKey === key);
  if (memOrder) return memOrder;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('idempotency_key', key)
        .maybeSingle();

      if (data) {
        return mapRowToOrder(data);
      }
    } catch (err) {
      console.warn('[Supabase] getOrderByKey fallback:', err);
    }
  }

  return null;
}

function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    orderRef: row.order_ref,
    customer: {
      fullName: row.customer_full_name,
      mobile: row.customer_mobile,
      email: row.customer_email || undefined,
      houseFlat: row.house_flat,
      streetLocality: row.street_locality,
      city: row.city,
      state: row.state,
      pinCode: row.pin_code,
      deliveryInstructions: row.delivery_instructions || undefined,
    },
    items: (row.order_items || []).map((it: any) => ({
      productId: it.product_id,
      variantId: it.variant_id,
      sku: it.sku || '',
      name: it.name,
      slug: '',
      size: it.size,
      color: it.color || 'Jet Black',
      quantity: it.quantity,
      unitPricePaise: it.unit_price_paise,
      totalPricePaise: it.total_price_paise,
      image: it.image_url || '',
    })),
    subtotalPaise: row.subtotal_paise,
    deliveryChargePaise: row.delivery_charge_paise || 0,
    taxPaise: row.tax_paise || 0,
    totalPaise: row.total_paise,
    paymentMethod: row.payment_method as any,
    paymentStatus: row.payment_status as any,
    fulfilmentStatus: row.fulfilment_status as any,
    courierName: row.courier_name || undefined,
    trackingId: row.tracking_id || undefined,
    trackingUrl: row.tracking_url || undefined,
    razorpayOrderId: row.razorpay_order_id || undefined,
    razorpayPaymentId: row.razorpay_payment_id || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function saveOrder(order: Order & { idempotencyKey: string }): Promise<void> {
  inMemoryOrders.set(order.id, order);
  inMemoryProcessedKeys.add(order.idempotencyKey);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      // 1. Insert order
      const { error: orderErr } = await supabase.from('orders').insert({
        id: order.id,
        order_ref: order.orderRef,
        customer_full_name: order.customer.fullName,
        customer_mobile: order.customer.mobile,
        customer_email: order.customer.email || null,
        house_flat: order.customer.houseFlat,
        street_locality: order.customer.streetLocality,
        city: order.customer.city,
        state: order.customer.state,
        pin_code: order.customer.pinCode,
        delivery_instructions: order.customer.deliveryInstructions || null,
        subtotal_paise: order.subtotalPaise,
        delivery_charge_paise: order.deliveryChargePaise,
        tax_paise: order.taxPaise,
        total_paise: order.totalPaise,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        fulfilment_status: order.fulfilmentStatus,
        razorpay_order_id: order.razorpayOrderId || null,
        idempotency_key: order.idempotencyKey,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
      });

      if (orderErr) {
        console.error('[Supabase] Failed to save order:', orderErr.message);
        return;
      }

      // 2. Insert order items
      if (order.items && order.items.length > 0) {
        const itemRows = order.items.map((item, idx) => ({
          id: `item_${order.id}_${idx}`,
          order_id: order.id,
          product_id: item.productId,
          variant_id: item.variantId,
          sku: item.sku,
          name: item.name,
          size: item.size,
          color: item.color,
          unit_price_paise: item.unitPricePaise,
          quantity: item.quantity,
          total_price_paise: item.totalPricePaise,
          image_url: item.image,
        }));
        await supabase.from('order_items').insert(itemRows);
      }

      // 3. Log initial status history
      await supabase.from('order_status_history').insert({
        order_id: order.id,
        previous_status: null,
        new_status: order.fulfilmentStatus,
        change_type: 'FULFILMENT',
        notes: `Order created via ${order.paymentMethod}`,
        changed_by: 'system',
      });
    } catch (err) {
      console.error('[Supabase] saveOrder unexpected error:', err);
    }
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const mem = inMemoryOrders.get(orderId);
  if (mem) return mem;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .maybeSingle();

      if (data) {
        const order = mapRowToOrder(data);
        inMemoryOrders.set(orderId, order);
        return order;
      }
    } catch (err) {
      console.warn('[Supabase] getOrderById fallback:', err);
    }
  }

  return null;
}

export async function getOrderByRef(orderRef: string): Promise<Order | null> {
  ensureDemoOrdersSeeded();
  const mem = Array.from(inMemoryOrders.values()).find(
    (o) => o.orderRef.toUpperCase() === orderRef.toUpperCase()
  );
  if (mem) return mem;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_ref', orderRef.toUpperCase())
        .maybeSingle();

      if (data) {
        const order = mapRowToOrder(data);
        inMemoryOrders.set(order.id, order);
        return order;
      }
    } catch (err) {
      console.warn('[Supabase] getOrderByRef fallback:', err);
    }
  }

  return null;
}

export async function getOrderByRazorpayOrderId(rzpOrderId: string): Promise<Order | null> {
  const mem = Array.from(inMemoryOrders.values()).find((o) => o.razorpayOrderId === rzpOrderId);
  if (mem) return mem;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('razorpay_order_id', rzpOrderId)
        .maybeSingle();

      if (data) {
        const order = mapRowToOrder(data);
        inMemoryOrders.set(order.id, order);
        return order;
      }
    } catch (err) {
      console.warn('[Supabase] getOrderByRazorpayOrderId fallback:', err);
    }
  }

  return null;
}

export async function updateOrder(
  orderId: string,
  updates: Partial<Order>,
  changedBy: string = 'admin'
): Promise<Order | null> {
  const existing = await getOrderById(orderId);
  if (!existing) return null;

  const updated: Order = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  inMemoryOrders.set(orderId, updated);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const dbUpdates: any = { updated_at: updated.updatedAt };

      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.fulfilmentStatus) dbUpdates.fulfilment_status = updates.fulfilmentStatus;
      if (updates.courierName !== undefined) dbUpdates.courier_name = updates.courierName;
      if (updates.trackingId !== undefined) dbUpdates.tracking_id = updates.trackingId;
      if (updates.trackingUrl !== undefined) dbUpdates.tracking_url = updates.trackingUrl;
      if (updates.razorpayPaymentId) dbUpdates.razorpay_payment_id = updates.razorpayPaymentId;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      await supabase.from('orders').update(dbUpdates).eq('id', orderId);

      // Audit status transition in history
      if (updates.fulfilmentStatus && updates.fulfilmentStatus !== existing.fulfilmentStatus) {
        await supabase.from('order_status_history').insert({
          order_id: orderId,
          previous_status: existing.fulfilmentStatus,
          new_status: updates.fulfilmentStatus,
          change_type: 'FULFILMENT',
          notes: updates.notes || `Status changed to ${updates.fulfilmentStatus}`,
          changed_by: changedBy,
        });
      }

      if (updates.paymentStatus && updates.paymentStatus !== existing.paymentStatus) {
        await supabase.from('order_status_history').insert({
          order_id: orderId,
          previous_status: existing.paymentStatus,
          new_status: updates.paymentStatus,
          change_type: 'PAYMENT',
          notes: `Payment status updated to ${updates.paymentStatus}`,
          changed_by: changedBy,
        });
      }
    } catch (err) {
      console.error('[Supabase] updateOrder failed:', err);
    }
  }

  return updated;
}

export async function getAllOrders(): Promise<Order[]> {
  ensureDemoOrdersSeeded();

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const orders = data.map(mapRowToOrder);
        orders.forEach((o) => inMemoryOrders.set(o.id, o));
        return orders;
      }
    } catch (err) {
      console.warn('[Supabase] getAllOrders error, using memory:', err);
    }
  }

  return Array.from(inMemoryOrders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ====================================================================
// 4. PAYMENT OPERATIONS
// ====================================================================

export async function savePayment(payment: PaymentRecord): Promise<void> {
  inMemoryPayments.set(payment.orderId, payment);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from('payments').upsert({
        id: payment.id,
        order_id: payment.orderId,
        order_ref: payment.orderRef,
        razorpay_order_id: payment.razorpayOrderId,
        razorpay_payment_id: payment.razorpayPaymentId || null,
        razorpay_signature: payment.razorpaySignature || null,
        amount_paise: payment.amountPaise,
        currency: payment.currency || 'INR',
        status: payment.status,
        verified: payment.verified,
        verified_at: payment.verified ? new Date().toISOString() : null,
        created_at: payment.createdAt,
        updated_at: payment.updatedAt,
      });
    } catch (err) {
      console.error('[Supabase] savePayment failed:', err);
    }
  }
}

export async function getPaymentByOrderId(orderId: string): Promise<PaymentRecord | null> {
  const mem = inMemoryPayments.get(orderId);
  if (mem) return mem;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (data) {
        return {
          id: data.id,
          orderId: data.order_id,
          orderRef: data.order_ref,
          razorpayOrderId: data.razorpay_order_id,
          razorpayPaymentId: data.razorpay_payment_id || undefined,
          razorpaySignature: data.razorpay_signature || undefined,
          verified: data.verified,
          amountPaise: data.amount_paise,
          currency: data.currency,
          status: data.status as any,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn('[Supabase] getPaymentByOrderId fallback:', err);
    }
  }

  return null;
}

export async function updatePayment(
  orderId: string,
  updates: Partial<PaymentRecord>
): Promise<void> {
  const existing = await getPaymentByOrderId(orderId);
  if (existing) {
    const updated: PaymentRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    inMemoryPayments.set(orderId, updated);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.razorpayPaymentId) dbUpdates.razorpay_payment_id = updates.razorpayPaymentId;
      if (updates.razorpaySignature) dbUpdates.razorpay_signature = updates.razorpaySignature;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.verified !== undefined) {
        dbUpdates.verified = updates.verified;
        if (updates.verified) dbUpdates.verified_at = new Date().toISOString();
      }

      await supabase.from('payments').update(dbUpdates).eq('order_id', orderId);
    } catch (err) {
      console.error('[Supabase] updatePayment failed:', err);
    }
  }
}

// ====================================================================
// 5. CUSTOM DESIGN ENQUIRIES
// ====================================================================

export async function saveCustomDesignEnquiry(
  enquiry: Omit<CustomDesignEnquiry, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'enquiryRef'> & { enquiryRef?: string }
): Promise<CustomDesignEnquiry> {
  const id = `cde_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const ref = enquiry.enquiryRef || `LYV-CUST-${Date.now().toString(36).toUpperCase()}`;

  const record: CustomDesignEnquiry = {
    id,
    ...enquiry,
    enquiryRef: ref,
    status: 'NEW',
    createdAt: now,
    updatedAt: now,
  };

  inMemoryEnquiries.set(id, record);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from('custom_design_enquiries').insert({
        id,
        enquiry_ref: record.enquiryRef,
        apparel_id: record.apparelId,
        apparel_name: record.apparelName,
        fabric: record.fabric,
        description: record.description || null,
        reference_file_name: record.referenceFileName || null,
        reference_file_url: record.referenceFileUrl || null,
        customer_name: record.customerName || null,
        customer_phone: record.customerPhone || null,
        whatsapp_url: record.whatsappUrl || null,
        status: record.status,
        created_at: now,
        updated_at: now,
      });
    } catch (err) {
      console.error('[Supabase] saveCustomDesignEnquiry error:', err);
    }
  }

  return record;
}

export async function getAllCustomEnquiries(): Promise<CustomDesignEnquiry[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('custom_design_enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          enquiryRef: d.enquiry_ref,
          apparelId: d.apparel_id,
          apparelName: d.apparel_name,
          fabric: d.fabric,
          description: d.description || undefined,
          referenceFileName: d.reference_file_name || undefined,
          referenceFileUrl: d.reference_file_url || undefined,
          customerName: d.customer_name || undefined,
          customerPhone: d.customer_phone || undefined,
          whatsappUrl: d.whatsapp_url || undefined,
          status: d.status,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch (err) {
      console.warn('[Supabase] getAllCustomEnquiries fallback:', err);
    }
  }

  return Array.from(inMemoryEnquiries.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Backward compatibility export
export { inMemoryOrders, inMemoryPayments };
