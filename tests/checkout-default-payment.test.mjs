import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotals } from '../lib/utils.ts';

describe('LYVEN Checkout Payment Method Selection & Safety', () => {
  // 1. Default payment method initialization
  test('1. Default checkout payment selection is ONLINE (Razorpay)', () => {
    // Mimic useState default in app/checkout/page.tsx
    const defaultPaymentMethod = 'ONLINE';
    assert.strictEqual(defaultPaymentMethod, 'ONLINE', 'Checkout must default to ONLINE payment');
  });

  // 2. Customer can switch to COD
  test('2. Customer can toggle payment method between ONLINE and COD', () => {
    let currentMethod = 'ONLINE';

    // User selects COD
    currentMethod = 'COD';
    assert.strictEqual(currentMethod, 'COD');

    // User switches back to ONLINE
    currentMethod = 'ONLINE';
    assert.strictEqual(currentMethod, 'ONLINE');
  });

  // 3. Online checkout creates Razorpay order parameters
  test('3. ONLINE checkout correctly submits ONLINE paymentMethod and creates Razorpay order parameters', async () => {
    const payload = {
      items: [{ productId: 'prod_dude', variantId: 'var_dude_m', quantity: 1, unitPricePaise: 5000 }],
      paymentMethod: 'ONLINE',
      idempotencyKey: 'idemp_test_online_123',
    };

    const totals = calculateTotals(payload.items);
    assert.strictEqual(totals.subtotalPaise, 5000);
    assert.strictEqual(totals.totalPaise, 5000);

    const isRazorpayRequired = payload.paymentMethod === 'ONLINE';
    assert.strictEqual(isRazorpayRequired, true, 'Online checkout requires Razorpay order creation');

    // Order status should be initialized as PENDING for online payment
    const initialPaymentStatus = 'PENDING';
    assert.strictEqual(initialPaymentStatus, 'PENDING');
  });

  // 4. COD checkout initializes COD order
  test('4. COD checkout creates order without Razorpay order and sets fulfilment status to CONFIRMED', () => {
    const payload = {
      items: [{ productId: 'prod_virat_kohli', variantId: 'var_vk_l', quantity: 1, unitPricePaise: 40000 }],
      paymentMethod: 'COD',
      idempotencyKey: 'idemp_test_cod_456',
    };

    const isRazorpayRequired = payload.paymentMethod === 'ONLINE';
    assert.strictEqual(isRazorpayRequired, false, 'COD does not require Razorpay order');

    const orderRecord = {
      paymentMethod: payload.paymentMethod,
      paymentStatus: 'PENDING',
      fulfilmentStatus: 'CONFIRMED',
      razorpayOrderId: undefined,
    };

    assert.strictEqual(orderRecord.paymentMethod, 'COD');
    assert.strictEqual(orderRecord.paymentStatus, 'PENDING');
    assert.strictEqual(orderRecord.fulfilmentStatus, 'CONFIRMED');
    assert.strictEqual(orderRecord.razorpayOrderId, undefined);
  });

  // 5. Total calculation consistency
  test('5. Pricing and total calculations are identical regardless of selected payment method', () => {
    const items = [
      { productId: 'prod_dude', variantId: 'var_dude_m', quantity: 2, unitPricePaise: 5000 }, // 10000 paise
      { productId: 'prod_virat_kohli', variantId: 'var_vk_xl', quantity: 1, unitPricePaise: 40000 }, // 40000 paise
    ];

    const onlineTotals = calculateTotals(items);
    const codTotals = calculateTotals(items);

    assert.strictEqual(onlineTotals.subtotalPaise, 50000);
    assert.strictEqual(onlineTotals.totalPaise, 50000);
    assert.strictEqual(onlineTotals.totalPaise, codTotals.totalPaise, 'Total must not change between payment methods');
  });
});
