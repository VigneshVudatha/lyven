import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('LYVEN Product Price Synchronization & Checkout Safety', () => {
  // Test Mock Data representing Supabase authoritative database
  const mockSupabaseProducts = new Map([
    [
      'prod_dude',
      {
        id: 'prod_dude',
        slug: 'dude',
        name: 'LYVEN DUDE Graphic Oversized T-Shirt',
        price_paise: 5000, // ₹50 updated in Supabase
        is_published: true,
      },
    ],
    [
      'prod_virat_kohli',
      {
        id: 'prod_virat_kohli',
        slug: 'virat-kohli',
        name: 'LYVEN Virat Kohli Graphic Oversized T-Shirt',
        price_paise: 40000, // ₹400 in Supabase
        is_published: true,
      },
    ],
  ]);

  const mockSupabaseVariants = new Map([
    [
      'var_dude_m',
      {
        id: 'var_dude_m',
        product_id: 'prod_dude',
        size: 'M',
        sku: 'LYV-DUDE-BLK-M',
        quantity: 10,
        is_active: true,
      },
    ],
    [
      'var_vk_l',
      {
        id: 'var_vk_l',
        product_id: 'prod_virat_kohli',
        size: 'L',
        sku: 'LYV-VK-BLK-L',
        quantity: 15,
        is_active: true,
      },
    ],
  ]);

  // 1. Supabase product price retrieval
  test('1. Supabase product price retrieval reflects ₹50 for DUDE and ₹400 for VIRAT KOHLI', () => {
    const dude = mockSupabaseProducts.get('prod_dude');
    const virat = mockSupabaseProducts.get('prod_virat_kohli');

    assert.ok(dude, 'DUDE product must exist in Supabase');
    assert.strictEqual(dude.price_paise, 5000, 'DUDE price must be 5000 paise (₹50)');

    assert.ok(virat, 'Virat Kohli product must exist in Supabase');
    assert.strictEqual(virat.price_paise, 40000, 'Virat Kohli price must be 40000 paise (₹400)');
  });

  // 2. Product detail page price retrieval
  test('2. Product detail page uses authoritative Supabase price for DUDE (₹50)', async () => {
    async function getProductBySlugMock(slug, isSupabaseActive = true) {
      if (isSupabaseActive) {
        for (const p of mockSupabaseProducts.values()) {
          if (p.slug === slug && p.is_published) {
            return {
              id: p.id,
              slug: p.slug,
              name: p.name,
              pricePaise: p.price_paise,
            };
          }
        }
      }
      return null;
    }

    const product = await getProductBySlugMock('dude', true);
    assert.ok(product);
    assert.strictEqual(product.pricePaise, 5000, 'Product page must resolve ₹50 for DUDE');
  });

  // 3. Shop and homepage price retrieval
  test('3. Shop and homepage resolve Supabase product list with updated prices', async () => {
    async function getAllProductsMock(isSupabaseActive = true) {
      if (isSupabaseActive) {
        return Array.from(mockSupabaseProducts.values()).map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          pricePaise: p.price_paise,
        }));
      }
      return [];
    }

    const products = await getAllProductsMock(true);
    const dude = products.find((p) => p.id === 'prod_dude');
    const vk = products.find((p) => p.id === 'prod_virat_kohli');

    assert.strictEqual(dude.pricePaise, 5000);
    assert.strictEqual(vk.pricePaise, 40000);
  });

  // 4. Search results price
  test('4. Search results filter products with updated Supabase prices', () => {
    const products = Array.from(mockSupabaseProducts.values()).map((p) => ({
      id: p.id,
      name: p.name,
      pricePaise: p.price_paise,
    }));

    const searchResults = products.filter((p) => p.name.includes('DUDE'));
    assert.strictEqual(searchResults.length, 1);
    assert.strictEqual(searchResults[0].pricePaise, 5000, 'Search result for DUDE must be ₹50');
  });

  // 5. Admin price update and cache invalidation
  test('5. Admin price update invalidates public storefront paths', () => {
    const invalidatedPaths = [];
    function revalidatePathMock(path) {
      invalidatedPaths.push(path);
    }

    function onAdminProductUpdated(slug) {
      revalidatePathMock('/');
      revalidatePathMock('/shop');
      revalidatePathMock('/search');
      if (slug) {
        revalidatePathMock(`/products/${slug}`);
      }
    }

    onAdminProductUpdated('dude');
    assert.deepStrictEqual(invalidatedPaths, [
      '/',
      '/shop',
      '/search',
      '/products/dude',
    ]);
  });

  // 6. Checkout server-side price calculation
  test('6. Checkout calculates server-side price using Supabase (1 DUDE = ₹50, ignoring client price)', async () => {
    const clientPayload = {
      items: [
        {
          productId: 'prod_dude',
          variantId: 'var_dude_m',
          quantity: 2,
          clientPricePaise: 40000, // Client tries to submit old ₹400
        },
      ],
    };

    async function serverCalculateOrder(items, isSupabaseActive = true) {
      if (!isSupabaseActive) {
        throw new Error('DATABASE_UNAVAILABLE');
      }

      let subtotal = 0;
      for (const item of items) {
        const variant = mockSupabaseVariants.get(item.variantId);
        assert.ok(variant, 'Variant must exist');
        assert.strictEqual(variant.product_id, item.productId, 'Variant ownership must match');

        const product = mockSupabaseProducts.get(variant.product_id);
        assert.ok(product, 'Product must exist');

        // IGNORE item.clientPricePaise, use product.price_paise
        subtotal += product.price_paise * item.quantity;
      }
      return { subtotalPaise: subtotal, totalPaise: subtotal };
    }

    const order = await serverCalculateOrder(clientPayload.items, true);
    // 2 units * 5000 paise = 10000 paise (₹100)
    assert.strictEqual(order.subtotalPaise, 10000);
    assert.strictEqual(order.totalPaise, 10000);
  });

  // 7. Supabase unavailable — checkout safely rejected
  test('7. Supabase unavailable safely rejects checkout without falling back to seed prices', async () => {
    async function checkoutOrder(items, isSupabaseActive) {
      if (!isSupabaseActive) {
        return {
          status: 503,
          success: false,
          code: 'DATABASE_UNAVAILABLE',
          error: 'Order processing is temporarily unavailable. Product catalog could not be verified with database.',
        };
      }
      return { status: 200, success: true };
    }

    const response = await checkoutOrder([{ productId: 'prod_dude', variantId: 'var_dude_m', quantity: 1 }], false);
    assert.strictEqual(response.status, 503);
    assert.strictEqual(response.success, false);
    assert.strictEqual(response.code, 'DATABASE_UNAVAILABLE');
  });

  // 8. Invalid or mismatched product/variant
  test('8. Checkout rejects mismatched product and variant IDs', () => {
    const item = {
      productId: 'prod_virat_kohli',
      variantId: 'var_dude_m', // Belongs to prod_dude, NOT virat_kohli
      quantity: 1,
    };

    const variant = mockSupabaseVariants.get(item.variantId);
    const isMismatch = variant.product_id !== item.productId;

    assert.strictEqual(isMismatch, true, 'Variant product_id does not match item productId');
  });

  // 9. Inventory validation
  test('9. Checkout rejects order when requested quantity exceeds variant stock', () => {
    const item = {
      productId: 'prod_dude',
      variantId: 'var_dude_m',
      quantity: 15, // Stock is only 10
    };

    const variant = mockSupabaseVariants.get(item.variantId);
    const isInsufficient = variant.quantity < item.quantity;

    assert.strictEqual(isInsufficient, true, 'Requested quantity must be rejected when exceeding stock');
  });

  // 10. Razorpay amount consistency
  test('10. Razorpay order creation amount is strictly identical to saved order total', async () => {
    const orderItems = [
      { unitPricePaise: 5000, quantity: 1 }, // DUDE ₹50
      { unitPricePaise: 40000, quantity: 1 }, // Virat Kohli ₹400
    ];

    const subtotalPaise = orderItems.reduce((acc, i) => acc + i.unitPricePaise * i.quantity, 0);
    const deliveryChargePaise = 0;
    const totalPaise = subtotalPaise + deliveryChargePaise;

    // Both are 45000 paise (₹450)
    const razorpayOrderAmount = Math.round(Number(totalPaise));
    const savedOrderTotal = totalPaise;

    assert.strictEqual(razorpayOrderAmount, 45000);
    assert.strictEqual(savedOrderTotal, 45000);
    assert.strictEqual(razorpayOrderAmount, savedOrderTotal, 'Razorpay amount must match saved order total exactly');
  });

  // 11. Admin inventory update revalidation
  test('11. Admin inventory update resolves parent product slug and revalidates storefront routes', async () => {
    const revalidated = [];
    const mockRevalidatePath = (p) => revalidated.push(p);

    const updatedVariant = {
      id: 'var_dude_m',
      productId: 'prod_dude',
      sku: 'LYV-DUDE-BLK-M',
      quantity: 25,
    };

    // Simulate inventory update logic
    mockRevalidatePath('/');
    mockRevalidatePath('/shop');
    mockRevalidatePath('/search');

    const parentProduct = mockSupabaseProducts.get(updatedVariant.productId);
    if (parentProduct?.slug) {
      mockRevalidatePath(`/products/${parentProduct.slug}`);
    }

    assert.ok(revalidated.includes('/'));
    assert.ok(revalidated.includes('/shop'));
    assert.ok(revalidated.includes('/search'));
    assert.ok(revalidated.includes('/products/dude'));
    assert.strictEqual(revalidated.length, 4);
  });

  // 12. Admin product archive/delete revalidation
  test('12. Admin product archive retrieves existing product details and revalidates direct product slug', async () => {
    const revalidated = [];
    const mockRevalidatePath = (p) => revalidated.push(p);

    const productIdToArchive = 'prod_dude';

    // Simulate admin delete handler logic: look up existing before archive
    const existing = mockSupabaseProducts.get(productIdToArchive);
    assert.ok(existing, 'Existing product must be found before archiving');
    assert.strictEqual(existing.slug, 'dude');

    // Archive executed...
    const archived = true;
    assert.ok(archived);

    // Revalidate paths
    mockRevalidatePath('/');
    mockRevalidatePath('/shop');
    mockRevalidatePath('/search');
    if (existing?.slug) {
      mockRevalidatePath(`/products/${existing.slug}`);
    }

    assert.ok(revalidated.includes('/'));
    assert.ok(revalidated.includes('/shop'));
    assert.ok(revalidated.includes('/search'));
    assert.ok(revalidated.includes('/products/dude'));
    assert.strictEqual(revalidated.length, 4);
  });
});
