import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// Tests for business calculations, pricing, validation, and security
describe('LYVEN Pricing & Totals Calculation', () => {
  const DUDE_PRICE_PAISE = 40000; // ₹400
  const VIRAT_KOHLI_PRICE_PAISE = 40000; // ₹400

  function calculateTotals(items, deliveryChargePaise = 0, taxRate = 0) {
    const subtotalPaise = items.reduce(
      (sum, item) => sum + item.unitPricePaise * item.quantity,
      0
    );
    const taxPaise = Math.round(subtotalPaise * taxRate);
    const totalPaise = subtotalPaise + deliveryChargePaise + taxPaise;
    return { subtotalPaise, deliveryChargePaise, taxPaise, totalPaise };
  }

  it('correctly calculates total for 1 DUDE tee (₹400)', () => {
    const items = [{ unitPricePaise: DUDE_PRICE_PAISE, quantity: 1 }];
    const result = calculateTotals(items, 0, 0);

    assert.equal(result.subtotalPaise, 40000);
    assert.equal(result.totalPaise, 40000);
  });

  it('correctly calculates total for 2 units of DUDE or Virat Kohli (₹800)', () => {
    const items = [{ unitPricePaise: DUDE_PRICE_PAISE, quantity: 2 }];
    const result = calculateTotals(items, 0, 0);

    assert.equal(result.subtotalPaise, 80000);
    assert.equal(result.totalPaise, 80000);
  });

  it('correctly calculates total for 1 Virat Kohli tee (₹400)', () => {
    const items = [{ unitPricePaise: VIRAT_KOHLI_PRICE_PAISE, quantity: 1 }];
    const result = calculateTotals(items, 0, 0);

    assert.equal(result.subtotalPaise, 40000);
    assert.equal(result.totalPaise, 40000);
  });

  it('correctly calculates combined cart (1 DUDE + 1 Virat Kohli)', () => {
    const items = [
      { unitPricePaise: DUDE_PRICE_PAISE, quantity: 1 },
      { unitPricePaise: VIRAT_KOHLI_PRICE_PAISE, quantity: 1 },
    ];
    // 400 + 400 = 80000 paise (₹800)
    const result = calculateTotals(items, 0, 0);

    assert.equal(result.subtotalPaise, 80000);
    assert.equal(result.totalPaise, 80000);
  });

  it('correctly calculates combined cart (2 DUDE + 1 Virat Kohli)', () => {
    const items = [
      { unitPricePaise: DUDE_PRICE_PAISE, quantity: 2 },
      { unitPricePaise: VIRAT_KOHLI_PRICE_PAISE, quantity: 1 },
    ];
    // (400 * 2) + 400 = 120000 paise (₹1200)
    const result = calculateTotals(items, 0, 0);

    assert.equal(result.subtotalPaise, 120000);
    assert.equal(result.totalPaise, 120000);
  });

  it('correctly handles shipping fee below threshold', () => {
    const items = [{ unitPricePaise: VIRAT_KOHLI_PRICE_PAISE, quantity: 1 }];
    const deliveryFeePaise = 5000; // ₹50 delivery fee
    const result = calculateTotals(items, deliveryFeePaise, 0);

    assert.equal(result.subtotalPaise, 40000);
    assert.equal(result.deliveryChargePaise, 5000);
    assert.equal(result.totalPaise, 45000); // ₹450
  });
});

describe('Validation Rules for Indian Checkout', () => {
  function isValidMobile(mobile) {
    return /^[6-9]\d{9}$/.test(mobile);
  }

  function isValidPinCode(pin) {
    return /^[1-9][0-9]{5}$/.test(pin);
  }

  it('validates 10-digit Indian mobile starting with 6, 7, 8, or 9', () => {
    assert.equal(isValidMobile('9876543210'), true);
    assert.equal(isValidMobile('8123456789'), true);
    assert.equal(isValidMobile('7012345678'), true);
    assert.equal(isValidMobile('6301234567'), true);

    // Invalid numbers
    assert.equal(isValidMobile('1234567890'), false);
    assert.equal(isValidMobile('987654321'), false); // 9 digits
    assert.equal(isValidMobile('98765432100'), false); // 11 digits
    assert.equal(isValidMobile('abcdefghij'), false);
  });

  it('validates 6-digit Indian PIN codes', () => {
    assert.equal(isValidPinCode('560038'), true); // Indiranagar
    assert.equal(isValidPinCode('110001'), true); // New Delhi
    assert.equal(isValidPinCode('400001'), true); // Mumbai

    // Invalid PIN codes
    assert.equal(isValidPinCode('010001'), false); // Cannot start with 0
    assert.equal(isValidPinCode('56003'), false);  // 5 digits
    assert.equal(isValidPinCode('5600388'), false); // 7 digits
    assert.equal(isValidPinCode('ABCDEF'), false);
  });
});

describe('Razorpay Signature Verification Security', () => {
  function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
    const text = `${orderId}|${paymentId}`;
    const generated = crypto.createHmac('sha256', secret).update(text).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(generated));
  }

  it('verifies genuine Razorpay webhook/redirect HMAC signatures', () => {
    const secret = 'rzp_test_secret_key_123';
    const orderId = 'order_DAvD38W8VwPfxF';
    const paymentId = 'pay_DAvEP8wXUa2D4p';

    const text = `${orderId}|${paymentId}`;
    const validSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');

    const isValid = verifyRazorpaySignature(orderId, paymentId, validSignature, secret);
    assert.equal(isValid, true);
  });

  it('rejects tampered signatures or altered payment IDs', () => {
    const secret = 'rzp_test_secret_key_123';
    const orderId = 'order_DAvD38W8VwPfxF';
    const paymentId = 'pay_DAvEP8wXUa2D4p';

    const tamperedSignature = 'a'.repeat(64);
    const isValid = verifyRazorpaySignature(orderId, paymentId, tamperedSignature, secret);
    assert.equal(isValid, false);
  });
});

describe('Order Reference Generation Format', () => {
  function generateOrderRef() {
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `LYV-${datePart}-${randomPart}`;
  }

  it('generates compliant LYV prefix and date pattern', () => {
    const ref = generateOrderRef();
    assert.match(ref, /^LYV-\d{8}-[A-Z0-9]{5}$/);
  });
});
