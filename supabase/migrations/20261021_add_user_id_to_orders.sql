-- ====================================================================
-- LYVEN DATABASE MIGRATION: CUSTOMER AUTHENTICATION & ORDER OWNERSHIP
-- Migration Date: 2026-10-21
-- Description: Adds user_id foreign key to public.orders linking to
-- auth.users for secure customer order association and RLS enforcement.
-- ====================================================================

-- 1. Add nullable user_id column referencing Supabase auth.users
-- Nullable ensures existing guest orders and future guest checkouts remain completely functional.
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create index on user_id for optimized order-history queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);

-- 3. RLS Policy: Authenticated customers can view ONLY their own orders
DROP POLICY IF EXISTS "Authenticated customers view own orders" ON public.orders;
CREATE POLICY "Authenticated customers view own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- 4. RLS Policy: Authenticated customers can view order items for their own orders
DROP POLICY IF EXISTS "Authenticated customers view own order items" ON public.order_items;
CREATE POLICY "Authenticated customers view own order items"
    ON public.order_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE public.orders.id = public.order_items.order_id
              AND public.orders.user_id = auth.uid()
        )
    );

-- 5. Preserve service_role full access for backend APIs and admin portal
DROP POLICY IF EXISTS "Service role full access orders" ON public.orders;
CREATE POLICY "Service role full access orders" 
    ON public.orders FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access order_items" ON public.order_items;
CREATE POLICY "Service role full access order_items" 
    ON public.order_items FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);
