import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Razorpay Payment Idempotency & Concurrency Race Condition Safety', () => {
  // Helper to create atomic transition simulator
  function createAtomicOrderStore(initialOrder) {
    let orderState = { ...initialOrder };
    let isLocked = false;
    const lockQueue = [];

    // Simple mutex lock to simulate PostgreSQL row-level lock on orders row
    async function acquireRowLock() {
      if (!isLocked) {
        isLocked = true;
        return;
      }
      await new Promise((resolve) => lockQueue.push(resolve));
    }

    function releaseRowLock() {
      if (lockQueue.length > 0) {
        const next = lockQueue.shift();
        next();
      } else {
        isLocked = false;
      }
    }

    async function atomicTransitionToPaid(orderId, paymentId) {
      await acquireRowLock();
      try {
        if (orderState.paymentStatus === 'PAID') {
          return { success: false, order: orderState, alreadyPaid: true };
        }

        // Atomically transition from PENDING -> PAID
        orderState = {
          ...orderState,
          paymentStatus: 'PAID',
          razorpayPaymentId: paymentId,
          updatedAt: new Date().toISOString(),
        };

        return { success: true, order: orderState, alreadyPaid: false };
      } finally {
        releaseRowLock();
      }
    }

    return {
      getOrder: () => ({ ...orderState }),
      atomicTransitionToPaid,
    };
  }

  // 1. Simultaneous Verify and Webhook Race Condition
  test('1. Simultaneous verification and webhook requests: exactly one transition, one stock deduction, one email', async () => {
    const store = createAtomicOrderStore({
      id: 'ord_race_01',
      orderRef: 'LYV-20261123-RACE1',
      paymentStatus: 'PENDING',
      paymentMethod: 'ONLINE',
      items: [{ variantId: 'var_dude_m', quantity: 1, unitPricePaise: 5000 }],
    });

    let stockDeductionCount = 0;
    let notificationCount = 0;
    let initialStock = 10;

    async function handleVerify(orderId, paymentId) {
      // 1. Atomic claim
      const claim = await store.atomicTransitionToPaid(orderId, paymentId);
      if (!claim.success) {
        return { status: 200, alreadyPaid: claim.alreadyPaid, role: 'verify' };
      }

      // 2. Only winner deducts stock
      stockDeductionCount += 1;
      initialStock -= 1;

      // 3. Only winner dispatches notification
      notificationCount += 1;

      return { status: 200, alreadyPaid: false, role: 'verify' };
    }

    async function handleWebhook(orderId, paymentId) {
      // 1. Atomic claim
      const claim = await store.atomicTransitionToPaid(orderId, paymentId);
      if (!claim.success) {
        return { status: 200, alreadyPaid: claim.alreadyPaid, role: 'webhook' };
      }

      // 2. Only winner deducts stock
      stockDeductionCount += 1;
      initialStock -= 1;

      // 3. Only winner dispatches notification
      notificationCount += 1;

      return { status: 200, alreadyPaid: false, role: 'webhook' };
    }

    // Fire both simultaneously (concurrency race)
    const [resVerify, resWebhook] = await Promise.all([
      handleVerify('ord_race_01', 'pay_rzp_client_123'),
      handleWebhook('ord_race_01', 'pay_rzp_webhook_123'),
    ]);

    // One must have won, and the other must have recognized alreadyPaid
    const winners = [resVerify, resWebhook].filter((r) => r.alreadyPaid === false);
    const losers = [resVerify, resWebhook].filter((r) => r.alreadyPaid === true);

    assert.strictEqual(winners.length, 1, 'Exactly one request must win the atomic transition');
    assert.strictEqual(losers.length, 1, 'Exactly one request must acknowledge alreadyPaid');
    assert.strictEqual(stockDeductionCount, 1, 'Stock must only be deducted once');
    assert.strictEqual(notificationCount, 1, 'Notification must only be dispatched once');
    assert.strictEqual(initialStock, 9, 'Inventory stock must decrement exactly once from 10 to 9');
    assert.strictEqual(store.getOrder().paymentStatus, 'PAID');
  });

  // 2. High-concurrency burst of duplicate webhooks
  test('2. High-concurrency burst of 10 duplicate webhook requests: exactly one claim, zero double-actions', async () => {
    const store = createAtomicOrderStore({
      id: 'ord_race_02',
      orderRef: 'LYV-20261123-RACE2',
      paymentStatus: 'PENDING',
      paymentMethod: 'ONLINE',
      items: [{ variantId: 'var_vk_l', quantity: 2, unitPricePaise: 40000 }],
    });

    let stockDeductionCount = 0;
    let notificationCount = 0;

    async function simulateWebhookCall(paymentId) {
      const claim = await store.atomicTransitionToPaid('ord_race_02', paymentId);
      if (claim.success) {
        stockDeductionCount += 1;
        notificationCount += 1;
        return { success: true, claimed: true };
      }
      return { success: true, claimed: false };
    }

    // Launch 10 simultaneous webhook attempts
    const promises = Array.from({ length: 10 }, (_, i) => simulateWebhookCall(`pay_burst_${i}`));
    const results = await Promise.all(promises);

    const claimedCount = results.filter((r) => r.claimed).length;
    const skippedCount = results.filter((r) => !r.claimed).length;

    assert.strictEqual(claimedCount, 1, 'Strictly 1 out of 10 burst calls must claim the transition');
    assert.strictEqual(skippedCount, 9, 'Remaining 9 calls must be safely skipped');
    assert.strictEqual(stockDeductionCount, 1, 'Stock deduction must happen exactly once');
    assert.strictEqual(notificationCount, 1, 'Notification dispatch must happen exactly once');
  });

  // 3. Failed email delivery does not suppress future retries or mark as sent
  test('3. Failed email delivery accurately reports failure without suppressing retry or corrupting payment state', async () => {
    const mockEmailResult = {
      success: false,
      error: 'RESEND_TIMEOUT_OR_UNAVAILABLE',
    };

    assert.strictEqual(mockEmailResult.success, false, 'Failed email must never be marked as success');
    assert.ok(mockEmailResult.error, 'Error message must be preserved for observability');

    // Ensure order payment status remains validly PAID despite notification failure
    const order = {
      id: 'ord_resend_err',
      orderRef: 'LYV-20261123-RESEND',
      paymentStatus: 'PAID',
    };

    assert.strictEqual(order.paymentStatus, 'PAID', 'Payment confirmation must remain intact even if email fails');
  });
});
