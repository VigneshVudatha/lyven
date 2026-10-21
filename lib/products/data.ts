import type { Product, ProductVariant } from '@/types';

/**
 * Seed product data for LYVEN products.
 * In production, these are loaded from Firestore.
 * This module serves as both the seed data and fallback for development.
 */

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod_dude',
    slug: 'dude',
    name: 'LYVEN DUDE Graphic Oversized T-Shirt',
    description:
      'A graphic-print oversized streetwear T-shirt featuring the signature yellow DUDE emblem on the chest and an expressive music artwork collage on the back. Crafted from heavyweight 240 GSM French Terry combed cotton with a relaxed drop-shoulder boxy fit. Bio-washed for a soft touch with fade-resistant screen printing.',
    pricePaise: 40000, // ₹400
    fit: 'Oversized Boxy Silhouette',
    category: 'Oversized Graphic T-Shirts',
    images: [
      {
        url: '/images/products/dude-tee-front.jpg',
        alt: 'LYVEN DUDE Graphic Oversized T-Shirt Front View with Yellow Graphic',
        type: 'front',
        order: 0,
      },
      {
        url: '/images/products/dude-tee-back.jpg',
        alt: 'LYVEN DUDE Graphic Oversized T-Shirt Back View with Music and Artwork Collage',
        type: 'back',
        order: 1,
      },
      {
        url: '/images/products/dude-tee-detail.jpg',
        alt: 'LYVEN DUDE Graphic Chest Print and LYVEN Brand Neck Label Close-Up Detail',
        type: 'detail',
        order: 2,
      },
      {
        url: '/images/products/dude-tee-fabric.jpg',
        alt: 'LYVEN 240 GSM Heavyweight French Terry Cotton Fabric Texture Close-Up Detail',
        type: 'detail',
        order: 3,
      },
    ],
    active: true,
    careInstructions:
      'Machine wash cold inside out with like colours (30°C max). Do not bleach. Line dry in shade. Iron on reverse side. Do not dry clean.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod_virat_kohli',
    slug: 'virat-kohli',
    name: 'LYVEN Virat Kohli Graphic Oversized T-Shirt',
    description:
      'A graphic-print oversized streetwear T-shirt dedicated to cricket legend Virat Kohli. Features the minimalist number 18 signature print on the front chest and the iconic "GOD\'S PLAN BABY" champion celebration graphic on the back. Crafted from premium 240 GSM French Terry cotton in a relaxed drop-shoulder boxy silhouette.',
    pricePaise: 40000, // ₹400
    fit: 'Oversized Boxy Silhouette',
    category: 'Oversized Graphic T-Shirts',
    images: [
      {
        url: '/images/products/virat-kohli-tee-front.jpg',
        alt: 'LYVEN Virat Kohli Graphic Oversized T-Shirt Number 18 Front View',
        type: 'front',
        order: 0,
      },
      {
        url: '/images/products/virat-kohli-tee-back.jpg',
        alt: 'LYVEN Virat Kohli Graphic Oversized T-Shirt Gods Plan Baby Back View',
        type: 'back',
        order: 1,
      },
    ],
    active: true,
    careInstructions:
      'Machine wash cold inside out with like colours (30°C max). Do not bleach. Line dry in shade. Iron on reverse side. Do not dry clean.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Launch variants with ready stock for instant checkout.
 * Administrator can modify these live from the Admin Inventory Dashboard.
 */
export const SEED_VARIANTS: ProductVariant[] = [
  // DUDE variants (Jet Black)
  { id: 'var_dude_s', productId: 'prod_dude', size: 'S', color: 'Jet Black', sku: 'LYV-DUDE-BLK-S', quantity: 20, active: true },
  { id: 'var_dude_m', productId: 'prod_dude', size: 'M', color: 'Jet Black', sku: 'LYV-DUDE-BLK-M', quantity: 25, active: true },
  { id: 'var_dude_l', productId: 'prod_dude', size: 'L', color: 'Jet Black', sku: 'LYV-DUDE-BLK-L', quantity: 30, active: true },
  { id: 'var_dude_xl', productId: 'prod_dude', size: 'XL', color: 'Jet Black', sku: 'LYV-DUDE-BLK-XL', quantity: 25, active: true },
  { id: 'var_dude_xxl', productId: 'prod_dude', size: 'XXL', color: 'Jet Black', sku: 'LYV-DUDE-BLK-XXL', quantity: 15, active: true },

  // Virat Kohli variants (Jet Black)
  { id: 'var_vk_s', productId: 'prod_virat_kohli', size: 'S', color: 'Jet Black', sku: 'LYV-VK-BLK-S', quantity: 20, active: true },
  { id: 'var_vk_m', productId: 'prod_virat_kohli', size: 'M', color: 'Jet Black', sku: 'LYV-VK-BLK-M', quantity: 25, active: true },
  { id: 'var_vk_l', productId: 'prod_virat_kohli', size: 'L', color: 'Jet Black', sku: 'LYV-VK-BLK-L', quantity: 30, active: true },
  { id: 'var_vk_xl', productId: 'prod_virat_kohli', size: 'XL', color: 'Jet Black', sku: 'LYV-VK-BLK-XL', quantity: 25, active: true },
  { id: 'var_vk_xxl', productId: 'prod_virat_kohli', size: 'XXL', color: 'Jet Black', sku: 'LYV-VK-BLK-XXL', quantity: 15, active: true },
];

/**
 * Get all active products
 */
export function getProducts(): Product[] {
  return SEED_PRODUCTS.filter((p) => p.active);
}

/**
 * Get product by slug
 */
export function getProductBySlug(slug: string): Product | undefined {
  return SEED_PRODUCTS.find((p) => p.slug === slug && p.active);
}

/**
 * Get variants for a product
 */
export function getVariantsForProduct(productId: string): ProductVariant[] {
  return SEED_VARIANTS.filter((v) => v.productId === productId && v.active);
}

/**
 * Get a specific variant
 */
export function getVariantById(variantId: string): ProductVariant | undefined {
  return SEED_VARIANTS.find((v) => v.id === variantId);
}
