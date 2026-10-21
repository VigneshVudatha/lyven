import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Customer Authentication Validation & Session Management', () => {
  function validateSignUpInput({ email, password, fullName }) {
    const errors = [];
    if (!email || !email.includes('@') || !email.includes('.')) {
      errors.push('Invalid email address');
    }
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (!fullName || fullName.trim().length === 0) {
      errors.push('Full name is required');
    }
    return { isValid: errors.length === 0, errors };
  }

  test('accepts valid customer registration credentials', () => {
    const result = validateSignUpInput({
      fullName: 'Aarav Sharma',
      email: 'aarav@example.com',
      password: 'secure_password_123',
    });
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  test('rejects passwords shorter than 6 characters', () => {
    const result = validateSignUpInput({
      fullName: 'Aarav Sharma',
      email: 'aarav@example.com',
      password: '12345',
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some((e) => e.includes('at least 6 characters')));
  });

  test('rejects malformed email addresses', () => {
    const result = validateSignUpInput({
      fullName: 'Aarav Sharma',
      email: 'invalid-email-no-domain',
      password: 'valid_password_2026',
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.some((e) => e.includes('Invalid email address')));
  });

  test('simulates session persistence across page refreshes and logout invalidation', () => {
    let mockSessionStore = new Map();

    function createSession(userId, email) {
      const sessionId = `sess_${Date.now()}`;
      const session = {
        sessionId,
        user: { id: userId, email },
        expiresAt: Date.now() + 3600 * 1000,
      };
      mockSessionStore.set(sessionId, session);
      return sessionId;
    }

    function getSession(sessionId) {
      const sess = mockSessionStore.get(sessionId);
      if (!sess) return null;
      if (sess.expiresAt < Date.now()) {
        mockSessionStore.delete(sessionId);
        return null;
      }
      return sess;
    }

    function destroySession(sessionId) {
      mockSessionStore.delete(sessionId);
    }

    const sid = createSession('usr_123', 'customer@lyven.in');
    assert.ok(getSession(sid));
    assert.strictEqual(getSession(sid).user.email, 'customer@lyven.in');

    // Logout invalidates session immediately
    destroySession(sid);
    assert.strictEqual(getSession(sid), null);
  });
});

describe('Customer Order Ownership & Server-Side Security', () => {
  const mockDatabaseOrders = [
    {
      id: 'ord_001',
      orderRef: 'LYV-20261021-AAA11',
      userId: 'usr_cust_a',
      customerFullName: 'Customer A',
      customerEmail: 'cust.a@example.com',
      totalPaise: 40000,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      fulfilmentStatus: 'CONFIRMED',
      items: [{ name: 'DUDE Oversized Tee', size: 'L', quantity: 1 }],
      createdAt: '2026-10-21T10:00:00.000Z',
    },
    {
      id: 'ord_002',
      orderRef: 'LYV-20261021-BBB22',
      userId: 'usr_cust_b',
      customerFullName: 'Customer B',
      customerEmail: 'cust.b@example.com',
      totalPaise: 80000,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      fulfilmentStatus: 'SHIPPED',
      items: [{ name: 'Virat Kohli Tee', size: 'M', quantity: 2 }],
      createdAt: '2026-10-21T11:00:00.000Z',
    },
    {
      id: 'ord_003',
      orderRef: 'LYV-20261021-GST33',
      userId: null, // Historical Guest Order
      customerFullName: 'Guest Shopper',
      customerEmail: 'guest@example.com',
      totalPaise: 40000,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      fulfilmentStatus: 'DELIVERED',
      items: [{ name: 'DUDE Oversized Tee', size: 'XL', quantity: 1 }],
      createdAt: '2026-10-21T09:00:00.000Z',
    },
  ];

  function getOrdersForCustomer(serverAuthenticatedUserId) {
    if (!serverAuthenticatedUserId) {
      return { status: 401, error: 'Authentication required' };
    }
    // Strict isolation: only returns records matching authenticated userId
    const userOrders = mockDatabaseOrders.filter(
      (o) => o.userId === serverAuthenticatedUserId
    );
    return { status: 200, orders: userOrders };
  }

  test('authenticated customer A can only see their own orders', () => {
    const res = getOrdersForCustomer('usr_cust_a');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.orders.length, 1);
    assert.strictEqual(res.orders[0].orderRef, 'LYV-20261021-AAA11');
    assert.strictEqual(res.orders[0].userId, 'usr_cust_a');
  });

  test('customer A cannot view customer B orders or guest orders', () => {
    const res = getOrdersForCustomer('usr_cust_a');
    const hasOrderB = res.orders.some((o) => o.userId === 'usr_cust_b');
    const hasGuestOrder = res.orders.some((o) => o.userId === null);
    assert.strictEqual(hasOrderB, false);
    assert.strictEqual(hasGuestOrder, false);
  });

  test('unauthenticated visitor receives 401 Unauthorized for my-orders', () => {
    const res = getOrdersForCustomer(null);
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.error, 'Authentication required');
  });

  test('customer with zero orders receives empty array with 200 OK', () => {
    const res = getOrdersForCustomer('usr_new_user_no_orders');
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.orders, []);
  });

  test('order creation preserves guest checkout when unauthenticated', () => {
    function createOrderOnServer({ clientPayload, serverSessionUser }) {
      // Security rule: server ignores any spoofed userId from clientPayload
      const assignedUserId = serverSessionUser?.id || undefined;
      return {
        id: `ord_${Date.now()}`,
        orderRef: 'LYV-20261021-TEST99',
        userId: assignedUserId,
        customerFullName: clientPayload.customer.fullName,
        totalPaise: 40000,
        paymentMethod: clientPayload.paymentMethod,
      };
    }

    // Case 1: Guest checkout
    const guestOrder = createOrderOnServer({
      clientPayload: {
        customer: { fullName: 'Guest User' },
        paymentMethod: 'COD',
        spoofedUserId: 'hacker_trying_to_spoof_id',
      },
      serverSessionUser: null,
    });
    assert.strictEqual(guestOrder.userId, undefined);

    // Case 2: Authenticated customer checkout
    const memberOrder = createOrderOnServer({
      clientPayload: {
        customer: { fullName: 'Member User' },
        paymentMethod: 'COD',
      },
      serverSessionUser: { id: 'usr_legitimate_customer_77' },
    });
    assert.strictEqual(memberOrder.userId, 'usr_legitimate_customer_77');
  });

  test('historical guest orders are never automatically claimed without verified ownership', () => {
    const guestOrder = mockDatabaseOrders.find((o) => o.id === 'ord_003');
    assert.strictEqual(guestOrder.userId, null);

    // If a new customer registers with the same email as the guest, guest order remains guest
    const newCustomer = { id: 'usr_cust_new', email: 'guest@example.com' };
    const myOrdersResult = getOrdersForCustomer(newCustomer.id);
    assert.strictEqual(myOrdersResult.orders.length, 0);
  });
});
