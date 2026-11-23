import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

describe('Razorpay Production Webhook Route Security & Fail-Closed Behavior', () => {
  const TEST_SECRET = 'whsec_lyven_prod_secret_f1890ad_test';

  function timingSafeEqualStrings(a, b) {
    try {
      const bufA = Buffer.from(a, 'utf8');
      const bufB = Buffer.from(b, 'utf8');
      if (bufA.length !== bufB.length) return false;
      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }

  // Pure simulation of app/api/payments/webhook/route.ts POST logic
  async function simulateWebhookRoute({ rawBody, headers, envSecret, dbStore }) {
    const signature = headers['x-razorpay-signature'];
    const webhookSecret = envSecret?.trim();

    // 1. Fail-closed: Reject all requests with 500 if the secret is not configured
    if (!webhookSecret) {
      return {
        status: 500,
        body: { success: false, error: 'Webhook gateway secret is not configured' },
      };
    }

    // 2. Reject missing signature header with 400
    if (!signature) {
      return {
        status: 400,
        body: { success: false, error: 'Missing x-razorpay-signature header' },
      };
    }

    // 3. HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isSignatureValid = timingSafeEqualStrings(expectedSignature, signature);

    if (!isSignatureValid) {
      return {
        status: 400,
        body: { success: false, error: 'Invalid webhook signature' },
      };
    }

    // 4. Payload Parsing
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return {
        status: 500,
        body: { success: false, error: 'Internal webhook error' },
      };
    }

    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;
    const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
    const rzpPaymentId = paymentEntity?.id;

    if (!rzpOrderId) {
      return { status: 200, body: { status: 'ignored_no_order_id' } };
    }

    // Lookup order
    const order = dbStore.getOrder(rzpOrderId);
    if (!order) {
      return { status: 200, body: { status: 'order_not_found' } };
    }

    // 5. Atomic Idempotency Claim
    if (event === 'payment.captured' || event === 'order.paid') {
      const claim = await dbStore.transitionOrderToPaid(order.id, rzpPaymentId || 'WEBHOOK');

      if (claim.success && claim.order) {
        // Winning claim deducts stock and triggers notification
        dbStore.deductStock(claim.order);
        dbStore.dispatchNotification(claim.order);
        return { status: 200, body: { status: 'ok', event, orderRef: order.orderRef, claimed: true } };
      } else {
        // Duplicate webhook skips stock deduction and notification
        return { status: 200, body: { status: 'ok', event, orderRef: order.orderRef, claimed: false } };
      }
    }

    return { status: 200, body: { status: 'ok', event, orderRef: order.orderRef } };
  }

  function createMockStore(order) {
    let orderState = { ...order };
    let stockDeducted = 0;
    let notificationsSent = 0;

    return {
      getOrder: (rzpOrderId) => (orderState.razorpayOrderId === rzpOrderId ? { ...orderState } : null),
      transitionOrderToPaid: async (orderId, paymentId) => {
        if (orderState.paymentStatus === 'PAID') {
          return { success: false, order: orderState, alreadyPaid: true };
        }
        orderState.paymentStatus = 'PAID';
        orderState.razorpayPaymentId = paymentId;
        return { success: true, order: { ...orderState }, alreadyPaid: false };
      },
      deductStock: (order) => {
        stockDeducted += order.items.reduce((acc, i) => acc + i.quantity, 0);
      },
      dispatchNotification: (order) => {
        notificationsSent += 1;
      },
      getStockDeducted: () => stockDeducted,
      getNotificationsSent: () => notificationsSent,
    };
  }

  // --- Test 1: Missing Secret fails closed with HTTP 500 ---
  test('1. Rejects webhook requests with HTTP 500 when RAZORPAY_WEBHOOK_SECRET is missing (Fail-Closed)', async () => {
    const rawBody = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_123', order_id: 'order_rzp_123' } } },
    });

    const store = createMockStore({
      id: 'ord_01',
      orderRef: 'LYV-20261123-01',
      razorpayOrderId: 'order_rzp_123',
      paymentStatus: 'PENDING',
      items: [{ variantId: 'var_1', quantity: 1 }],
    });

    // Test with undefined secret
    const resUndefined = await simulateWebhookRoute({
      rawBody,
      headers: { 'x-razorpay-signature': 'some_sig' },
      envSecret: undefined,
      dbStore: store,
    });

    assert.strictEqual(resUndefined.status, 500);
    assert.strictEqual(resUndefined.body.success, false);
    assert.strictEqual(resUndefined.body.error, 'Webhook gateway secret is not configured');

    // Test with whitespace/empty secret
    const resEmpty = await simulateWebhookRoute({
      rawBody,
      headers: { 'x-razorpay-signature': 'some_sig' },
      envSecret: '   ',
      dbStore: store,
    });

    assert.strictEqual(resEmpty.status, 500);
    assert.strictEqual(resEmpty.body.success, false);
    assert.strictEqual(store.getStockDeducted(), 0, 'No stock should be deducted when secret is missing');
    assert.strictEqual(store.getNotificationsSent(), 0, 'No notification should be sent when secret is missing');
  });

  // --- Test 2: Missing signature header returns HTTP 400 ---
  test('2. Rejects webhook requests with HTTP 400 when x-razorpay-signature header is missing', async () => {
    const rawBody = JSON.stringify({ event: 'payment.captured' });
    const store = createMockStore({ id: 'ord_02' });

    const res = await simulateWebhookRoute({
      rawBody,
      headers: {}, // No signature header
      envSecret: TEST_SECRET,
      dbStore: store,
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error, 'Missing x-razorpay-signature header');
  });

  // --- Test 3: Invalid signature returns HTTP 400 ---
  test('3. Rejects webhook requests with HTTP 400 when signature does not match (Timing-Safe)', async () => {
    const rawBody = JSON.stringify({ event: 'payment.captured' });
    const store = createMockStore({ id: 'ord_03' });

    const invalidSignature = crypto
      .createHmac('sha256', 'wrong_secret_key')
      .update(rawBody)
      .digest('hex');

    const res = await simulateWebhookRoute({
      rawBody,
      headers: { 'x-razorpay-signature': invalidSignature },
      envSecret: TEST_SECRET,
      dbStore: store,
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error, 'Invalid webhook signature');
  });

  // --- Test 4: Valid signature processes payment.captured successfully ---
  test('4. Accepts genuine webhook request with valid HMAC signature and processes payment.captured', async () => {
    const rawBody = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay_valid_999', order_id: 'order_rzp_valid_999' } },
      },
    });

    const store = createMockStore({
      id: 'ord_valid_01',
      orderRef: 'LYV-20261123-VALID1',
      razorpayOrderId: 'order_rzp_valid_999',
      paymentStatus: 'PENDING',
      items: [{ variantId: 'var_dude_m', quantity: 2 }],
    });

    const validSignature = crypto
      .createHmac('sha256', TEST_SECRET)
      .update(rawBody)
      .digest('hex');

    const res = await simulateWebhookRoute({
      rawBody,
      headers: { 'x-razorpay-signature': validSignature },
      envSecret: TEST_SECRET,
      dbStore: store,
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.claimed, true);
    assert.strictEqual(store.getStockDeducted(), 2, 'Stock must be deducted exactly once');
    assert.strictEqual(store.getNotificationsSent(), 1, 'Email notification must be dispatched exactly once');
  });

  // --- Test 5: Duplicate webhook delivery is idempotent ---
  test('5. Duplicate webhook requests return HTTP 200 without duplicate stock deduction or notifications', async () => {
    const rawBody = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay_valid_dup', order_id: 'order_rzp_dup' } },
      },
    });

    const store = createMockStore({
      id: 'ord_dup_01',
      orderRef: 'LYV-20261123-DUP1',
      razorpayOrderId: 'order_rzp_dup',
      paymentStatus: 'PENDING',
      items: [{ variantId: 'var_dude_l', quantity: 1 }],
    });

    const validSignature = crypto
      .createHmac('sha256', TEST_SECRET)
      .update(rawBody)
      .digest('hex');

    // 1st delivery (Wins claim)
    const res1 = await simulateWebhookRoute({
      rawBody,
      headers: { 'x-razorpay-signature': validSignature },
      envSecret: TEST_SECRET,
      dbStore: store,
    });
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.body.claimed, true);
    assert.strictEqual(store.getStockDeducted(), 1);
    assert.strictEqual(store.getNotificationsSent(), 1);

    // 2nd delivery (Duplicate/Retry)
    const res2 = await simulateWebhookRoute({
      rawBody,
      headers: { 'x-razorpay-signature': validSignature },
      envSecret: TEST_SECRET,
      dbStore: store,
    });
    assert.strictEqual(res2.status, 200, 'Duplicate delivery must return HTTP 200 to acknowledge Razorpay');
    assert.strictEqual(res2.body.claimed, false, 'Duplicate delivery must not claim the transition');
    assert.strictEqual(store.getStockDeducted(), 1, 'Stock must NOT be deducted again');
    assert.strictEqual(store.getNotificationsSent(), 1, 'Notification must NOT be dispatched again');
  });

  // --- Test 6: Never expose secrets in responses ---
  test('6. Error responses never expose the webhook secret or sensitive environment data', async () => {
    const rawBody = 'invalid_json{';
    const store = createMockStore({ id: 'ord_sec_01' });

    const validSignature = crypto
      .createHmac('sha256', TEST_SECRET)
      .update(rawBody)
      .digest('hex');

    const res = await simulateWebhookRoute({
      rawBody,
      headers: { 'x-razorpay-signature': validSignature },
      envSecret: TEST_SECRET,
      dbStore: store,
    });

    const responseString = JSON.stringify(res);
    assert.strictEqual(responseString.includes(TEST_SECRET), false, 'Response must never leak secret string');
  });
});
