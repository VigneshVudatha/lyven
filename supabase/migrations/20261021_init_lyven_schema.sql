-- ====================================================================
-- LYVEN E-COMMERCE POSTGRESQL SCHEMA MIGRATION
-- Project: LYVEN (Wear Your Story)
-- Database: Supabase PostgreSQL
-- ====================================================================

-- Enable pgcrypto for UUIDs & hashing if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod_' || substr(gen_random_uuid()::text, 1, 12)),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_paise INTEGER NOT NULL CHECK (price_paise >= 0),
    compare_at_price_paise INTEGER CHECK (compare_at_price_paise IS NULL OR compare_at_price_paise >= 0),
    fit TEXT NOT NULL DEFAULT 'Oversized Boxy Silhouette',
    category TEXT NOT NULL DEFAULT 'Oversized Graphic T-Shirts',
    fabric TEXT NOT NULL DEFAULT '240 GSM French Terry Combed Cotton',
    care_instructions TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on slug & publication status
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products (is_published);

-- 2. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id TEXT PRIMARY KEY DEFAULT ('img_' || substr(gen_random_uuid()::text, 1, 12)),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    image_type TEXT NOT NULL DEFAULT 'front' CHECK (image_type IN ('front', 'back', 'detail', 'model', 'gallery')),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images (product_id);

-- 3. PRODUCT VARIANTS (Sizes & Stock)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id TEXT PRIMARY KEY DEFAULT ('var_' || substr(gen_random_uuid()::text, 1, 12)),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', 'CUSTOM')),
    color TEXT NOT NULL DEFAULT 'Jet Black',
    sku TEXT UNIQUE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_product_size_color UNIQUE (product_id, size, color)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants (product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants (sku);

-- 4. INVENTORY MOVEMENTS (Stock Audit Trail)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id TEXT PRIMARY KEY DEFAULT ('inv_' || substr(gen_random_uuid()::text, 1, 12)),
    variant_id TEXT NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    change_quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('ORDER_PLACED', 'ORDER_CANCELLED', 'MANUAL_RESTOCK', 'MANUAL_ADJUSTMENT', 'DAMAGE_WRITE_OFF', 'INITIAL_IMPORT')),
    reference_id TEXT, -- e.g. orderRef or admin note
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inv_movements_variant ON public.inventory_movements (variant_id);
CREATE INDEX IF NOT EXISTS idx_inv_movements_created ON public.inventory_movements (created_at DESC);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ord_' || substr(gen_random_uuid()::text, 1, 12)),
    order_ref TEXT UNIQUE NOT NULL,
    customer_full_name TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    customer_email TEXT,
    house_flat TEXT NOT NULL,
    street_locality TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    delivery_instructions TEXT,
    subtotal_paise INTEGER NOT NULL CHECK (subtotal_paise >= 0),
    delivery_charge_paise INTEGER NOT NULL DEFAULT 0 CHECK (delivery_charge_paise >= 0),
    tax_paise INTEGER NOT NULL DEFAULT 0 CHECK (tax_paise >= 0),
    total_paise INTEGER NOT NULL CHECK (total_paise >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'ONLINE')),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    fulfilment_status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (fulfilment_status IN ('CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    courier_name TEXT,
    tracking_id TEXT,
    tracking_url TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    idempotency_key TEXT UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_ref ON public.orders (order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON public.orders (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfilment_status ON public.orders (fulfilment_status);

-- 6. ORDER ITEMS (Historical Snapshot)
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT ('item_' || substr(gen_random_uuid()::text, 1, 12)),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT,
    variant_id TEXT,
    sku TEXT,
    name TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'Jet Black',
    unit_price_paise INTEGER NOT NULL CHECK (unit_price_paise >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price_paise INTEGER NOT NULL CHECK (total_price_paise >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);

-- 7. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT ('pay_' || substr(gen_random_uuid()::text, 1, 12)),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    order_ref TEXT NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount_paise INTEGER NOT NULL CHECK (amount_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON public.payments (razorpay_order_id);

-- 8. ORDER STATUS HISTORY (Audit Log)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id TEXT PRIMARY KEY DEFAULT ('osh_' || substr(gen_random_uuid()::text, 1, 12)),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('FULFILMENT', 'PAYMENT', 'COURIER', 'CANCELLATION')),
    notes TEXT,
    changed_by TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON public.order_status_history (order_id);

-- 9. CUSTOM DESIGN ENQUIRIES
CREATE TABLE IF NOT EXISTS public.custom_design_enquiries (
    id TEXT PRIMARY KEY DEFAULT ('cde_' || substr(gen_random_uuid()::text, 1, 12)),
    enquiry_ref TEXT UNIQUE NOT NULL,
    apparel_id TEXT NOT NULL,
    apparel_name TEXT NOT NULL,
    fabric TEXT NOT NULL,
    description TEXT,
    reference_file_name TEXT,
    reference_file_url TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    whatsapp_url TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_DISCUSSION', 'DESIGN_APPROVED', 'COMPLETED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_design_enquiries_ref ON public.custom_design_enquiries (enquiry_ref);

-- ====================================================================
-- ATOMIC STORED PROCEDURES / FUNCTIONS
-- ====================================================================

-- Atomic stock deduction with movement logging & concurrency safety
CREATE OR REPLACE FUNCTION public.deduct_variant_stock(
    p_variant_id TEXT,
    p_quantity INTEGER,
    p_order_ref TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product_id TEXT;
    v_curr_qty INTEGER;
    v_new_qty INTEGER;
BEGIN
    -- Validate quantity is strictly positive
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Deduction quantity must be greater than zero (received: %)', p_quantity;
    END IF;

    -- Lock row for update to prevent concurrent overselling
    SELECT product_id, quantity INTO v_product_id, v_curr_qty
    FROM public.product_variants
    WHERE id = p_variant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Variant with ID % not found', p_variant_id;
    END IF;

    IF v_curr_qty < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock for variant % (available: %, requested: %)', p_variant_id, v_curr_qty, p_quantity;
    END IF;

    v_new_qty := v_curr_qty - p_quantity;

    -- Update variant quantity
    UPDATE public.product_variants
    SET quantity = v_new_qty, updated_at = now()
    WHERE id = p_variant_id;

    -- Log inventory movement
    INSERT INTO public.inventory_movements (
        variant_id,
        product_id,
        change_quantity,
        previous_quantity,
        new_quantity,
        reason,
        reference_id
    ) VALUES (
        p_variant_id,
        v_product_id,
        -p_quantity,
        v_curr_qty,
        v_new_qty,
        'ORDER_PLACED',
        p_order_ref
    );

    RETURN jsonb_build_object(
        'success', true,
        'variant_id', p_variant_id,
        'previous_quantity', v_curr_qty,
        'new_quantity', v_new_qty
    );
END;
$$;

-- Restrict execution to trusted server-side service_role only
REVOKE EXECUTE ON FUNCTION public.deduct_variant_stock(TEXT, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_variant_stock(TEXT, INTEGER, TEXT) TO service_role;

-- Atomic stock restoration on order cancellation
CREATE OR REPLACE FUNCTION public.restore_variant_stock(
    p_variant_id TEXT,
    p_quantity INTEGER,
    p_order_ref TEXT,
    p_reason TEXT DEFAULT 'ORDER_CANCELLED'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product_id TEXT;
    v_curr_qty INTEGER;
    v_new_qty INTEGER;
BEGIN
    -- Validate quantity is strictly positive
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Restoration quantity must be greater than zero (received: %)', p_quantity;
    END IF;

    -- Validate reason is an authorized audit value
    IF p_reason NOT IN ('ORDER_CANCELLED', 'MANUAL_RESTOCK', 'MANUAL_ADJUSTMENT', 'INITIAL_IMPORT') THEN
        RAISE EXCEPTION 'Invalid restoration reason: %', p_reason;
    END IF;

    SELECT product_id, quantity INTO v_product_id, v_curr_qty
    FROM public.product_variants
    WHERE id = p_variant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Variant with ID % not found', p_variant_id;
    END IF;

    v_new_qty := v_curr_qty + p_quantity;

    UPDATE public.product_variants
    SET quantity = v_new_qty, updated_at = now()
    WHERE id = p_variant_id;

    INSERT INTO public.inventory_movements (
        variant_id,
        product_id,
        change_quantity,
        previous_quantity,
        new_quantity,
        reason,
        reference_id
    ) VALUES (
        p_variant_id,
        v_product_id,
        p_quantity,
        v_curr_qty,
        v_new_qty,
        p_reason,
        p_order_ref
    );

    RETURN jsonb_build_object(
        'success', true,
        'variant_id', p_variant_id,
        'previous_quantity', v_curr_qty,
        'new_quantity', v_new_qty
    );
END;
$$;

-- Restrict execution to trusted server-side service_role only
REVOKE EXECUTE ON FUNCTION public.restore_variant_stock(TEXT, INTEGER, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_variant_stock(TEXT, INTEGER, TEXT, TEXT) TO service_role;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_design_enquiries ENABLE ROW LEVEL SECURITY;

-- Schema & Table Access Permissions for Supabase Roles (RLS policies govern row-level access)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- Public can READ published products, images, and active variants
DROP POLICY IF EXISTS "Public read published products" ON public.products;
CREATE POLICY "Public read published products"
    ON public.products FOR SELECT
    USING (is_published = true);

DROP POLICY IF EXISTS "Public read product images" ON public.product_images;
CREATE POLICY "Public read product images"
    ON public.product_images FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public read active variants" ON public.product_variants;
CREATE POLICY "Public read active variants"
    ON public.product_variants FOR SELECT
    USING (is_active = true);

-- Service role has full access to all tables (for secure server-side route handlers)
DROP POLICY IF EXISTS "Service role full access products" ON public.products;
CREATE POLICY "Service role full access products" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access product_images" ON public.product_images;
CREATE POLICY "Service role full access product_images" ON public.product_images FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access product_variants" ON public.product_variants;
CREATE POLICY "Service role full access product_variants" ON public.product_variants FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access inventory_movements" ON public.inventory_movements;
CREATE POLICY "Service role full access inventory_movements" ON public.inventory_movements FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access orders" ON public.orders;
CREATE POLICY "Service role full access orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access order_items" ON public.order_items;
CREATE POLICY "Service role full access order_items" ON public.order_items FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access payments" ON public.payments;
CREATE POLICY "Service role full access payments" ON public.payments FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access order_status_history" ON public.order_status_history;
CREATE POLICY "Service role full access order_status_history" ON public.order_status_history FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access custom_design_enquiries" ON public.custom_design_enquiries;
CREATE POLICY "Service role full access custom_design_enquiries" ON public.custom_design_enquiries FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ====================================================================
-- STORAGE BUCKETS CONFIGURATION
-- ====================================================================

-- 1. Public bucket for storefront product catalog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('lyven-products', 'lyven-products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. PRIVATE bucket for customer custom design artwork and reference files
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-designs', 'custom-designs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage policies: Public can ONLY read product catalog assets
DROP POLICY IF EXISTS "Public read product assets" ON storage.objects;
CREATE POLICY "Public read product assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'lyven-products');

-- Service role has full access to manage all storage buckets (uploads, signed URL generation, management)
DROP POLICY IF EXISTS "Service role manage storage" ON storage.objects;
CREATE POLICY "Service role manage storage"
    ON storage.objects FOR ALL TO service_role
    USING (true) WITH CHECK (true);
