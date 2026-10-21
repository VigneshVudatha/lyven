-- ====================================================================
-- LYVEN E-COMMERCE SEED DATA
-- Products: LYVEN DUDE & LYVEN Virat Kohli (₹400 / 40000 paise)
-- ====================================================================

-- 1. Insert DUDE T-Shirt
INSERT INTO public.products (
    id, slug, name, description, price_paise, compare_at_price_paise,
    fit, category, fabric, care_instructions, is_published, is_featured
) VALUES (
    'prod_dude',
    'dude',
    'LYVEN DUDE Graphic Oversized T-Shirt',
    'A graphic-print oversized streetwear T-shirt featuring the signature yellow DUDE emblem on the chest and an expressive music artwork collage on the back. Crafted from heavyweight 240 GSM French Terry combed cotton with a relaxed drop-shoulder boxy fit. Bio-washed for a soft touch with fade-resistant screen printing.',
    40000,
    99900,
    'Oversized Boxy Silhouette',
    'Oversized Graphic T-Shirts',
    '240 GSM French Terry Combed Cotton',
    'Machine wash cold inside out with like colours (30°C max). Do not bleach. Line dry in shade. Iron on reverse side. Do not dry clean.',
    true,
    true
) ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    price_paise = EXCLUDED.price_paise,
    is_published = EXCLUDED.is_published;

-- DUDE Images
INSERT INTO public.product_images (id, product_id, url, alt_text, image_type, display_order, is_primary) VALUES
('img_dude_01', 'prod_dude', '/images/products/dude-tee-front.jpg', 'LYVEN DUDE Graphic Oversized T-Shirt Front View with Yellow Graphic', 'front', 0, true),
('img_dude_02', 'prod_dude', '/images/products/dude-tee-back.jpg', 'LYVEN DUDE Graphic Oversized T-Shirt Back View with Music and Artwork Collage', 'back', 1, false),
('img_dude_03', 'prod_dude', '/images/products/dude-tee-detail.jpg', 'LYVEN DUDE Graphic Chest Print and LYVEN Brand Neck Label Close-Up Detail', 'detail', 2, false),
('img_dude_04', 'prod_dude', '/images/products/dude-tee-fabric.jpg', 'LYVEN 240 GSM Heavyweight French Terry Cotton Fabric Texture Close-Up Detail', 'detail', 3, false)
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url;

-- DUDE Variants (Jet Black, Sizes S to XXL)
INSERT INTO public.product_variants (id, product_id, size, color, sku, quantity, is_active) VALUES
('var_dude_s', 'prod_dude', 'S', 'Jet Black', 'LYV-DUDE-BLK-S', 20, true),
('var_dude_m', 'prod_dude', 'M', 'Jet Black', 'LYV-DUDE-BLK-M', 25, true),
('var_dude_l', 'prod_dude', 'L', 'Jet Black', 'LYV-DUDE-BLK-L', 30, true),
('var_dude_xl', 'prod_dude', 'XL', 'Jet Black', 'LYV-DUDE-BLK-XL', 25, true),
('var_dude_xxl', 'prod_dude', 'XXL', 'Jet Black', 'LYV-DUDE-BLK-XXL', 15, true)
ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity;

-- 2. Insert Virat Kohli T-Shirt
INSERT INTO public.products (
    id, slug, name, description, price_paise, compare_at_price_paise,
    fit, category, fabric, care_instructions, is_published, is_featured
) VALUES (
    'prod_virat_kohli',
    'virat-kohli',
    'LYVEN Virat Kohli Graphic Oversized T-Shirt',
    'A graphic-print oversized streetwear T-shirt dedicated to cricket legend Virat Kohli. Features the minimalist number 18 signature print on the front chest and the iconic "GOD''S PLAN BABY" champion celebration graphic on the back. Crafted from premium 240 GSM French Terry cotton in a relaxed drop-shoulder boxy silhouette.',
    40000,
    99900,
    'Oversized Boxy Silhouette',
    'Oversized Graphic T-Shirts',
    '240 GSM French Terry Combed Cotton',
    'Machine wash cold inside out with like colours (30°C max). Do not bleach. Line dry in shade. Iron on reverse side. Do not dry clean.',
    true,
    true
) ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    price_paise = EXCLUDED.price_paise,
    is_published = EXCLUDED.is_published;

-- Virat Kohli Images
INSERT INTO public.product_images (id, product_id, url, alt_text, image_type, display_order, is_primary) VALUES
('img_vk_01', 'prod_virat_kohli', '/images/products/virat-kohli-tee-front.jpg', 'LYVEN Virat Kohli Graphic Oversized T-Shirt Number 18 Front View', 'front', 0, true),
('img_vk_02', 'prod_virat_kohli', '/images/products/virat-kohli-tee-back.jpg', 'LYVEN Virat Kohli Graphic Oversized T-Shirt Gods Plan Baby Back View', 'back', 1, false)
ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url;

-- Virat Kohli Variants (Jet Black, Sizes S to XXL)
INSERT INTO public.product_variants (id, product_id, size, color, sku, quantity, is_active) VALUES
('var_vk_s', 'prod_virat_kohli', 'S', 'Jet Black', 'LYV-VK-BLK-S', 20, true),
('var_vk_m', 'prod_virat_kohli', 'M', 'Jet Black', 'LYV-VK-BLK-M', 25, true),
('var_vk_l', 'prod_virat_kohli', 'L', 'Jet Black', 'LYV-VK-BLK-L', 30, true),
('var_vk_xl', 'prod_virat_kohli', 'XL', 'Jet Black', 'LYV-VK-BLK-XL', 25, true),
('var_vk_xxl', 'prod_virat_kohli', 'XXL', 'Jet Black', 'LYV-VK-BLK-XXL', 15, true)
ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity;
