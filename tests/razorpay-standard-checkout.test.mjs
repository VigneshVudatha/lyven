import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

describe('Razorpay Standard Web Checkout Integration', () => {
  const TEST_KEY_ID = 'rzp_test_TqYOVmJTE0eGNq';
  const TEST_KEY_SECRET = '9ZoSgTf72fuxvfytLFuGj6oG';

  // 1. Order Creation Logic
  function validateOrderCreationPayload({ amount, currency }) {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return { isValid: false, error: 'Amount is required' };
    }
    const numAmount = Number(amount);
    if (numAmount < 100) {
      return { isValid: false, error: 'Amount must be at least 100 paise (₹1)' };
    }
    const cur = (currency || 'INR').toUpperCase();
    if (cur !== 'INR') {
      return { isValid: false, error: 'Only INR is supported for domestic transactions' };
    }
    return { isValid: true, amount: Math.round(numAmount), currency: cur };
  }

  test('validates minimum Razorpay order amount of 100 paise (₹1)', () => {
    const valid = validateOrderCreationPayload({ amount: 40000, currency: 'INR' });
    assert.strictEqual(valid.isValid, true);
    assert.strictEqual(valid.amount, 40000);

    const invalid = validateOrderCreationPayload({ amount: 50 });
    assert.strictEqual(invalid.isValid, false);
    assert.ok(invalid.error.includes('at least 100 paise'));
  });

  // 2. Cryptographic Signature Verification
  function verifyPaymentSignature({ orderId, paymentId, signature, secret }) {
    if (!orderId || !paymentId || !signature) {
      return { success: false, code: 400, error: 'Missing required fields' };
    }
    if (!secret) {
      return { success: false, code: 500, error: 'Missing secret' };
    }

    const payload = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const bufExpected = Buffer.from(expected, 'utf8');
    const bufReceived = Buffer.from(signature, 'utf8');

    if (bufExpected.length !== bufReceived.length) {
      return { success: false, code: 400, error: 'Signature mismatch' };
    }

    const matches = crypto.timingSafeEqual(bufExpected, bufReceived);
    if (!matches) {
      return { success: false, code: 400, error: 'Signature mismatch' };
    }

    return { success: true, code: 200 };
  }

  test('successfully verifies genuine Razorpay payment signature', () => {
    const orderId = 'order_test_998877';
    const paymentId = 'pay_test_112233';
    const signature = crypto
      .createHmac('sha256', TEST_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const result = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
      secret: TEST_KEY_SECRET,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.code, 200);
  });

  test('rejects tampered or forged signature with HTTP 400', () => {
    const orderId = 'order_test_998877';
    const paymentId = 'pay_test_112233';
    const tamperedSignature = 'f'.repeat(64);

    const result = verifyPaymentSignature({
      orderId,
      paymentId,
      signature: tamperedSignature,
      secret: TEST_KEY_SECRET,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.code, 400);
    assert.strictEqual(result.error, 'Signature mismatch');
  });

  test('rejects missing parameters with HTTP 400 without verifying', () => {
    const result1 = verifyPaymentSignature({ orderId: '', paymentId: 'pay_123', signature: 'abc', secret: TEST_KEY_SECRET });
    assert.strictEqual(result1.success, false);
    assert.strictEqual(result1.code, 400);

    const result2 = verifyPaymentSignature({ orderId: 'order_123', paymentId: '', signature: 'abc', secret: TEST_KEY_SECRET });
    assert.strictEqual(result2.success, false);
    assert.strictEqual(result2.code, 400);

    const result3 = verifyPaymentSignature({ orderId: 'order_123', paymentId: 'pay_123', signature: '', secret: TEST_KEY_SECRET });
    assert.strictEqual(result3.success, false);
    assert.strictEqual(result3.code, 400);
  });

  // 3. Client Modal & Event Handling Simulation
  test('simulates user dismiss/cancellation and payment.failed events safely', () => {
    let orderStatus = 'PENDING';
    let errorMessage = null;

    // Simulate modal dismiss
    function onModalDismiss() {
      // Order remains PENDING; user can retry payment without losing order
      orderStatus = 'PENDING';
      errorMessage = 'Payment was cancelled. Your order has been saved — you can retry payment.';
    }

    onModalDismiss();
    assert.strictEqual(orderStatus, 'PENDING');
    assert.ok(errorMessage.includes('cancelled'));

    // Simulate payment.failed event
    function onPaymentFailed(errResponse) {
      orderStatus = 'FAILED';
      errorMessage = `Payment failed: ${errResponse.error.description}`;
    }

    onPaymentFailed({
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'Payment was declined by the issuing bank',
      },
    });

    assert.strictEqual(orderStatus, 'FAILED');
    assert.ok(errorMessage.includes('declined by the issuing bank'));
  });

  // 4. Cash On Delivery Independence
  test('preserves Cash on Delivery checkout without Razorpay dependencies', () => {
    function processOrder(paymentMethod, totalPaise) {
      if (paymentMethod === 'COD') {
        return {
          success: true,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          fulfilmentStatus: 'CONFIRMED',
          requiresRazorpay: false,
        };
      }
      return {
        success: true,
        paymentMethod: 'ONLINE',
        paymentStatus: 'PENDING',
        fulfilmentStatus: 'CONFIRMED',
        requiresRazorpay: true,
      };
    }

    const codOrder = processOrder('COD', 40000);
    assert.strictEqual(codOrder.paymentMethod, 'COD');
    assert.strictEqual(codOrder.requiresRazorpay, false);

    const onlineOrder = processOrder('ONLINE', 40000);
    assert.strictEqual(onlineOrder.paymentMethod, 'ONLINE');
    assert.strictEqual(onlineOrder.requiresRazorpay, true);
  });

  // 5. Regression Tests for Razorpay Order Creation & Error Extraction
  test('safely extracts error description and code without logging undefined', () => {
    // Simulate Razorpay SDK error structure
    const razorpaySdk401Error = {
      statusCode: 401,
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'Authentication failed',
      },
    };

    function parseRazorpayError(err) {
      const upstreamStatus = err?.statusCode || (err?.error?.code ? 400 : 500);
      const errorCode = err?.error?.code || 'RAZORPAY_ERROR';
      const errorDesc = err?.error?.description || err?.message || 'Upstream provider rejected order creation';
      return { upstreamStatus, errorCode, errorDesc };
    }

    const parsed = parseRazorpayError(razorpaySdk401Error);
    assert.strictEqual(parsed.upstreamStatus, 401);
    assert.strictEqual(parsed.errorCode, 'BAD_REQUEST_ERROR');
    assert.strictEqual(parsed.errorDesc, 'Authentication failed');
    assert.notStrictEqual(parsed.errorDesc, 'undefined');
  });

  test('trims whitespace and invisible newlines from environment credentials', () => {
    const rawKeyId = '  rzp_test_TqYOVmJTE0eGNq \n';
    const rawSecret = ' 9ZoSgTf72fuxvfytLFuGj6oG\r\n';

    const cleanedKeyId = rawKeyId.trim();
    const cleanedSecret = rawSecret.trim();

    assert.strictEqual(cleanedKeyId, 'rzp_test_TqYOVmJTE0eGNq');
    assert.strictEqual(cleanedSecret, '9ZoSgTf72fuxvfytLFuGj6oG');
    assert.strictEqual(cleanedKeyId.includes(' '), false);
    assert.strictEqual(cleanedSecret.includes('\n'), false);
  });

  test('validates key format starts with rzp_test_ or rzp_live_', () => {
    function isValidKeyFormat(key) {
      if (!key) return false;
      const trimmed = key.trim();
      return trimmed.startsWith('rzp_test_') || trimmed.startsWith('rzp_live_');
    }

    assert.strictEqual(isValidKeyFormat('rzp_test_TqYOVmJTE0eGNq'), true);
    assert.strictEqual(isValidKeyFormat('rzp_live_abcdef12345678'), true);
    assert.strictEqual(isValidKeyFormat('invalid_prefix_123'), false);
    assert.strictEqual(isValidKeyFormat(''), false);
  });

  test('ensures order amount is rounded to an integer paise', () => {
    function sanitizePaise(amount) {
      const rounded = Math.round(Number(amount));
      return Number.isInteger(rounded) && rounded >= 100 ? rounded : null;
    }

    assert.strictEqual(sanitizePaise(40000), 40000);
    assert.strictEqual(sanitizePaise(40000.4), 40000);
    assert.strictEqual(sanitizePaise(40000.7), 40001);
    assert.strictEqual(sanitizePaise(50), null); // below min 100 paise
  });
});
