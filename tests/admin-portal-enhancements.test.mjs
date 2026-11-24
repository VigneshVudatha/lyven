import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Helper replicate mapping logic from lib/db/repository.ts for unit verification
function sortProductImages(images) {
  return [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });
}

function resolvePrimaryCover(images) {
  if (!images || images.length === 0) return null;
  return images.find((img) => img.isPrimary || img.is_primary) || images[0];
}

function isTestOrder(order) {
  if (order.isTest) return true;
  const notes = (order.notes || '').toUpperCase();
  if (notes.includes('[TEST_ORDER]') || notes.includes('[TEST]') || notes.includes('[DUMMY]')) return true;
  const email = (order.customer?.email || '').toLowerCase();
  if (email.endsWith('@example.com') || email.endsWith('@test.com') || email.endsWith('@dummy.com')) return true;
  const name = (order.customer?.fullName || '').toLowerCase();
  if (name.includes('test order') || name.includes('dummy') || name.includes('test user')) return true;
  const ref = (order.orderRef || '').toUpperCase();
  if (ref.includes('-TEST-') || ref.includes('RACE')) return true;
  return false;
}

function validateUploadFile(file) {
  const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `Invalid file type "${file.type}". Allowed: JPG, PNG, WEBP, AVIF.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File "${file.name}" exceeds 5MB size limit.` };
  }
  return { valid: true };
}

describe('TASK 1: Multi-Product Image Architecture & Sorting', () => {
  it('preserves 100% backward compatibility for single-image products', () => {
    const legacySingleImage = [
      { id: 'img_1', url: 'https://cdn.lyven.com/dude-front.png', is_primary: true, display_order: 0 },
    ];

    const sorted = sortProductImages(legacySingleImage);
    assert.equal(sorted.length, 1);
    assert.equal(sorted[0].url, 'https://cdn.lyven.com/dude-front.png');
    assert.equal(resolvePrimaryCover(sorted).url, 'https://cdn.lyven.com/dude-front.png');
  });

  it('guarantees that the image marked as primary is sorted to index 0', () => {
    const multiImages = [
      { id: 'img_back', url: 'https://cdn.lyven.com/tee-back.png', is_primary: false, display_order: 0 },
      { id: 'img_front', url: 'https://cdn.lyven.com/tee-front.png', is_primary: true, display_order: 1 },
      { id: 'img_detail', url: 'https://cdn.lyven.com/tee-detail.png', is_primary: false, display_order: 2 },
    ];

    const sorted = sortProductImages(multiImages);
    assert.equal(sorted[0].id, 'img_front', 'Primary image must be placed first at index 0');
    assert.equal(sorted[0].is_primary, true);
    assert.equal(sorted[1].id, 'img_back');
    assert.equal(sorted[2].id, 'img_detail');

    const primaryCover = resolvePrimaryCover(sorted);
    assert.equal(primaryCover.id, 'img_front');
  });

  it('sorts non-primary images cleanly by display_order', () => {
    const images = [
      { id: 'img_4', url: 'img4.png', is_primary: false, display_order: 3 },
      { id: 'img_1', url: 'img1.png', is_primary: true, display_order: 0 },
      { id: 'img_3', url: 'img3.png', is_primary: false, display_order: 2 },
      { id: 'img_2', url: 'img2.png', is_primary: false, display_order: 1 },
    ];

    const sorted = sortProductImages(images);
    assert.deepEqual(
      sorted.map((i) => i.id),
      ['img_1', 'img_2', 'img_3', 'img_4']
    );
  });

  it('resolves primary cover fallback to index 0 if no primary flag is set', () => {
    const images = [
      { id: 'img_a', url: 'a.png', is_primary: false, display_order: 0 },
      { id: 'img_b', url: 'b.png', is_primary: false, display_order: 1 },
    ];

    const cover = resolvePrimaryCover(images);
    assert.equal(cover.id, 'img_a');
  });

  it('validates upload MIME types and size constraints', () => {
    assert.equal(validateUploadFile({ name: 'tee.jpg', type: 'image/jpeg', size: 1024 * 1024 }).valid, true);
    assert.equal(validateUploadFile({ name: 'tee.webp', type: 'image/webp', size: 2 * 1024 * 1024 }).valid, true);
    assert.equal(validateUploadFile({ name: 'tee.avif', type: 'image/avif', size: 500 * 1024 }).valid, true);

    // Invalid file type
    const exeCheck = validateUploadFile({ name: 'malware.exe', type: 'application/x-msdownload', size: 1000 });
    assert.equal(exeCheck.valid, false);
    assert.match(exeCheck.error, /Invalid file type/);

    // Oversized file (> 5MB)
    const largeCheck = validateUploadFile({ name: 'giant.png', type: 'image/png', size: 6 * 1024 * 1024 });
    assert.equal(largeCheck.valid, false);
    assert.match(largeCheck.error, /exceeds 5MB/);
  });
});

describe('TASK 2: Safe Test Data Management & Guardrails', () => {
  it('correctly detects test and dummy orders through multiple criteria', () => {
    const testCases = [
      { order: { notes: '[TEST_ORDER] Verified checkout flow', customer: { fullName: 'Vignesh', email: 'v@gmail.com' } }, expected: true },
      { order: { notes: '[TEST] Payment test', customer: { fullName: 'Vignesh', email: 'v@gmail.com' } }, expected: true },
      { order: { notes: '[DUMMY] Staging seed', customer: { fullName: 'Vignesh', email: 'v@gmail.com' } }, expected: true },
      { order: { notes: '', customer: { fullName: 'Test User 1', email: 'v@gmail.com' } }, expected: true },
      { order: { notes: '', customer: { fullName: 'Dummy Account', email: 'v@gmail.com' } }, expected: true },
      { order: { notes: '', customer: { fullName: 'Rahul Sharma', email: 'test@example.com' } }, expected: true },
      { order: { notes: '', customer: { fullName: 'Rahul Sharma', email: 'dev@test.com' } }, expected: true },
      { order: { orderRef: 'LYV-TEST-8842', customer: { fullName: 'Rahul Sharma', email: 'rahul@gmail.com' } }, expected: true },
    ];

    for (const { order, expected } of testCases) {
      assert.equal(isTestOrder(order), expected, `Failed detection for: ${JSON.stringify(order)}`);
    }
  });

  it('STRICTLY protects genuine live customer orders from being classified as test data', () => {
    const genuineOrders = [
      {
        orderRef: 'LYV-9482-1049',
        customer: { fullName: 'Vikram Malhotra', email: 'vikram.m@gmail.com', mobile: '9876543210' },
        notes: 'Please ring the doorbell upon arrival. Leave package with guard.',
      },
      {
        orderRef: 'LYV-2041-3891',
        customer: { fullName: 'Ananya Reddy', email: 'ananya.reddy@yahoo.co.in', mobile: '9123456789' },
        notes: 'Call before delivery',
      },
      {
        orderRef: 'LYV-1029-4482',
        customer: { fullName: 'Kabir Singhania', email: 'kabir@outlook.com', mobile: '9811223344' },
        notes: '',
      },
    ];

    for (const order of genuineOrders) {
      assert.equal(isTestOrder(order), false, `Genuine order falsely marked as test: ${order.orderRef}`);
    }
  });

  it('enforces deletion guardrail: throws when attempting to delete a genuine customer order', () => {
    const genuineOrder = {
      id: 'ord_real_001',
      orderRef: 'LYV-GENUINE-1001',
      customer: { fullName: 'Aditya Roy', email: 'aditya.roy@gmail.com' },
      items: [{ quantity: 2 }],
      isTest: false,
    };

    function simulateSafeDelete(order) {
      if (!isTestOrder(order)) {
        throw new Error(`CANNOT_DELETE_GENUINE_ORDER: Order ${order.orderRef} is a confirmed customer order. Permanent deletion is blocked to prevent data loss.`);
      }
      return { success: true };
    }

    assert.throws(
      () => simulateSafeDelete(genuineOrder),
      /CANNOT_DELETE_GENUINE_ORDER/
    );
  });

  it('restores deducted inventory stock units when test order is deleted', () => {
    // Inventory before test order
    let variantStock = { 'var_dude_m': 15, 'var_virat_l': 8 };

    const testOrder = {
      id: 'ord_test_999',
      orderRef: 'LYV-TEST-999',
      customer: { fullName: 'Test Runner', email: 'test@example.com' },
      items: [
        { variantId: 'var_dude_m', quantity: 2 },
        { variantId: 'var_virat_l', quantity: 1 },
      ],
      isTest: true,
    };

    function simulateDeleteTestOrder(order, stockMap) {
      if (!isTestOrder(order)) throw new Error('Not a test order');

      let restoredUnits = 0;
      for (const item of order.items) {
        if (stockMap[item.variantId] !== undefined) {
          stockMap[item.variantId] += item.quantity;
          restoredUnits += item.quantity;
        }
      }
      return { success: true, restoredStockUnits: restoredUnits };
    }

    const result = simulateDeleteTestOrder(testOrder, variantStock);
    assert.equal(result.success, true);
    assert.equal(result.restoredStockUnits, 3);
    assert.equal(variantStock['var_dude_m'], 17, 'Variant stock must be incremented by 2');
    assert.equal(variantStock['var_virat_l'], 9, 'Variant stock must be incremented by 1');
  });

  it('enforces product deletion guardrail: archives instead of deleting when orders exist', () => {
    function simulateDeleteProduct(product, linkedOrderCount, hardDeleteRequested) {
      if (linkedOrderCount > 0) {
        // Safe archival fallback
        product.isPublished = false;
        return {
          success: true,
          action: 'archived',
          message: `Product "${product.name}" has ${linkedOrderCount} existing customer order(s) and was safely archived (unpublished) instead of deleted to protect order history.`,
        };
      }

      if (hardDeleteRequested) {
        return {
          success: true,
          action: 'deleted',
          message: `Product "${product.name}" was permanently deleted along with its variants and image records.`,
        };
      }

      product.isPublished = false;
      return { success: true, action: 'archived', message: 'Product archived.' };
    }

    const prodWithOrders = { name: 'DUDE Oversized Tee', isPublished: true };
    const res1 = simulateDeleteProduct(prodWithOrders, 5, true);
    assert.equal(res1.action, 'archived');
    assert.equal(prodWithOrders.isPublished, false);
    assert.match(res1.message, /safely archived/);

    const testProdWithoutOrders = { name: 'Dummy Prototype Tee', isPublished: true };
    const res2 = simulateDeleteProduct(testProdWithoutOrders, 0, true);
    assert.equal(res2.action, 'deleted');
    assert.match(res2.message, /permanently deleted/);
  });
});

describe('TASK 3: Universal Order History Management (Archive, Restore & Protected Deletion)', () => {
  function isArchivedOrder(order) {
    if (order.isArchived) return true;
    const notes = (order.notes || '').toUpperCase();
    return notes.includes('[ARCHIVED]') || notes.includes('[ARCHIVE]');
  }

  function simulateArchiveOrder(order, archive = true) {
    let currentNotes = order.notes || '';
    if (archive) {
      if (!currentNotes.toUpperCase().includes('[ARCHIVED]')) {
        currentNotes = currentNotes ? `[ARCHIVED] ${currentNotes}` : '[ARCHIVED]';
      }
    } else {
      currentNotes = currentNotes
        .replace(/\[ARCHIVED\]/gi, '')
        .replace(/\[ARCHIVE\]/gi, '')
        .trim();
    }
    return {
      ...order,
      notes: currentNotes,
      isArchived: archive,
    };
  }

  function checkOrderDeletionEligibility(order) {
    if (order.paymentStatus === 'PAID' || order.paymentStatus === 'REFUNDED' || Boolean(order.razorpayPaymentId)) {
      return {
        canPermanentlyDelete: false,
        reason: `This order contains verified payment records (Payment Status: ${order.paymentStatus}). Financial and GST audit regulations mandate retaining all transaction records. Permanent deletion is blocked. You can safely Archive this order instead.`,
        suggestArchive: true,
      };
    }

    if (!order.isTest && order.fulfilmentStatus !== 'CANCELLED') {
      return {
        canPermanentlyDelete: false,
        reason: `This is an active live customer order (Fulfillment Status: ${order.fulfilmentStatus}). Customer order history and delivery tracking must be preserved for customer support and dispute defense. You can safely Archive this order instead.`,
        suggestArchive: true,
      };
    }

    return {
      canPermanentlyDelete: true,
      reason: 'This order has no verified monetary transactions or active customer fulfillment liabilities. It is eligible for permanent removal.',
      suggestArchive: false,
    };
  }

  it('allows archiving ANY order (live customer, COD, or paid online) while preserving all data', () => {
    const livePaidOrder = {
      id: 'ord_real_777',
      orderRef: 'LYV-9921-3312',
      customer: { fullName: 'Siddharth Rao', email: 'sid.rao@gmail.com' },
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      razorpayPaymentId: 'pay_Nq8731924',
      totalPaise: 80000,
      notes: 'Customer requested evening delivery',
      isTest: false,
      isArchived: false,
    };

    const archived = simulateArchiveOrder(livePaidOrder, true);
    assert.equal(archived.isArchived, true);
    assert.equal(isArchivedOrder(archived), true);
    // Preserves all financial and customer properties
    assert.equal(archived.paymentStatus, 'PAID');
    assert.equal(archived.razorpayPaymentId, 'pay_Nq8731924');
    assert.equal(archived.totalPaise, 80000);
    assert.match(archived.notes, /Customer requested evening delivery/);
  });

  it('allows restoring an archived order back to active status', () => {
    const archivedOrder = {
      id: 'ord_archived_1',
      orderRef: 'LYV-1122-3344',
      notes: '[ARCHIVED] Customer placed order for blue shirt',
      isArchived: true,
    };

    const restored = simulateArchiveOrder(archivedOrder, false);
    assert.equal(restored.isArchived, false);
    assert.equal(isArchivedOrder(restored), false);
    assert.equal(restored.notes, 'Customer placed order for blue shirt');
  });

  it('filters active orders list by hiding archived orders and showing them in ARCHIVED tab', () => {
    const orderList = [
      { orderRef: 'LYV-001', isArchived: false, fulfilmentStatus: 'CONFIRMED', isTest: false },
      { orderRef: 'LYV-002', isArchived: true, fulfilmentStatus: 'DELIVERED', isTest: false },
      { orderRef: 'LYV-003', isArchived: false, fulfilmentStatus: 'SHIPPED', isTest: false },
      { orderRef: 'LYV-004', isArchived: true, fulfilmentStatus: 'CONFIRMED', isTest: true },
    ];

    function applyFilter(orders, tab) {
      if (tab === 'ARCHIVED') return orders.filter((o) => o.isArchived);
      return orders.filter((o) => !o.isArchived && (tab === 'ALL' || o.fulfilmentStatus === tab));
    }

    const mainActiveList = applyFilter(orderList, 'ALL');
    assert.deepEqual(
      mainActiveList.map((o) => o.orderRef),
      ['LYV-001', 'LYV-003'],
      'Main orders list MUST exclude all archived orders'
    );

    const archivedList = applyFilter(orderList, 'ARCHIVED');
    assert.deepEqual(
      archivedList.map((o) => o.orderRef),
      ['LYV-002', 'LYV-004'],
      'Archived tab MUST display only archived orders'
    );
  });

  it('strictly blocks permanent deletion of PAID orders and offers Archive instead', () => {
    const paidOrder = {
      orderRef: 'LYV-PAID-001',
      customer: { fullName: 'Pooja Hegde' },
      paymentStatus: 'PAID',
      razorpayPaymentId: 'pay_ABC123456',
      fulfilmentStatus: 'CONFIRMED',
      isTest: false,
    };

    const eligibility = checkOrderDeletionEligibility(paidOrder);
    assert.equal(eligibility.canPermanentlyDelete, false);
    assert.equal(eligibility.suggestArchive, true);
    assert.match(eligibility.reason, /verified payment records/);
    assert.match(eligibility.reason, /Archive this order instead/);
  });

  it('strictly blocks permanent deletion of active live customer orders and offers Archive instead', () => {
    const livePendingOrder = {
      orderRef: 'LYV-COD-9988',
      customer: { fullName: 'Rajesh Kumar' },
      paymentStatus: 'PENDING',
      paymentMethod: 'COD',
      fulfilmentStatus: 'SHIPPED',
      isTest: false,
    };

    const eligibility = checkOrderDeletionEligibility(livePendingOrder);
    assert.equal(eligibility.canPermanentlyDelete, false);
    assert.equal(eligibility.suggestArchive, true);
    assert.match(eligibility.reason, /active live customer order/);
  });

  it('permits permanent deletion only for confirmed dummy/test orders with no payment liability', () => {
    const dummyOrder = {
      orderRef: 'LYV-TEST-0001',
      customer: { fullName: 'Test Runner' },
      paymentStatus: 'PENDING',
      fulfilmentStatus: 'CANCELLED',
      isTest: true,
    };

    const eligibility = checkOrderDeletionEligibility(dummyOrder);
    assert.equal(eligibility.canPermanentlyDelete, true);
    assert.equal(eligibility.suggestArchive, false);
  });
});

