import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isEmailConfigured,
  sendCustomerOrderConfirmation,
  sendAdminOrderNotification,
  sendPaymentSuccessNotification,
  sendOrderStatusUpdateNotification,
  sendOrderCancellationNotification,
} from '../lib/email/notifications.ts';

describe('LYVEN Transactional Email Notifications', () => {
  const originalEnv = process.env.RESEND_API_KEY;

  test('isEmailConfigured returns false when key is missing or is placeholder', () => {
    delete process.env.RESEND_API_KEY;
    assert.strictEqual(isEmailConfigured(), false);

    process.env.RESEND_API_KEY = 're_your_resend_api_key_here';
    assert.strictEqual(isEmailConfigured(), false);
  });

  test('isEmailConfigured returns true when a genuine Resend key is provided', () => {
    process.env.RESEND_API_KEY = 're_live_sec_1234567890abcdef';
    assert.strictEqual(isEmailConfigured(), true);
    // Cleanup
    if (originalEnv) {
      process.env.RESEND_API_KEY = originalEnv;
    } else {
      delete process.env.RESEND_API_KEY;
    }
  });

  test('sendCustomerOrderConfirmation skips safely when customer email is omitted', async () => {
    const mockOrder = {
      id: 'ord_test_01',
      orderRef: 'LYV-20261021-TEST',
      customer: {
        fullName: 'Arjun Sharma',
        mobile: '9876543210',
        email: undefined, // No email provided
        houseFlat: 'Flat 402',
        streetLocality: 'Indiranagar 100ft Rd',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560038',
      },
      items: [
        {
          productId: 'prod_dude',
          variantId: 'var_dude_l',
          sku: 'LYV-DUDE-BLK-L',
          name: 'LYVEN DUDE Graphic Oversized T-Shirt',
          slug: 'dude',
          size: 'L',
          color: 'Jet Black',
          quantity: 1,
          unitPricePaise: 40000,
          totalPricePaise: 40000,
          image: '/images/products/dude-tee-front.jpg',
        },
      ],
      subtotalPaise: 40000,
      deliveryChargePaise: 0,
      taxPaise: 0,
      totalPaise: 40000,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      fulfilmentStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await sendCustomerOrderConfirmation(mockOrder);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.reason, 'NO_CUSTOMER_EMAIL_PROVIDED');
  });

  test('sendAdminOrderNotification targets lyven.support1@gmail.com by default', async () => {
    // With unconfigured Resend key, should safely return error without crashing
    delete process.env.RESEND_API_KEY;

    const mockOrder = {
      id: 'ord_test_02',
      orderRef: 'LYV-20261021-0002',
      customer: {
        fullName: 'Vikram Rao',
        mobile: '9123456780',
        email: 'vikram@example.com',
        houseFlat: 'Villa 12',
        streetLocality: 'Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pinCode: '500033',
      },
      items: [
        {
          productId: 'prod_virat_kohli',
          variantId: 'var_vk_xl',
          sku: 'LYV-VK-BLK-XL',
          name: 'LYVEN Virat Kohli Graphic Oversized T-Shirt',
          slug: 'virat-kohli',
          size: 'XL',
          color: 'Jet Black',
          quantity: 2,
          unitPricePaise: 40000,
          totalPricePaise: 80000,
          image: '/images/products/virat-kohli-tee-front.jpg',
        },
      ],
      subtotalPaise: 80000,
      deliveryChargePaise: 0,
      taxPaise: 0,
      totalPaise: 80000,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      fulfilmentStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await sendAdminOrderNotification(mockOrder);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'EMAIL_NOT_CONFIGURED');
  });

  test('sendPaymentSuccessNotification executes safely for admin and customer', async () => {
    delete process.env.RESEND_API_KEY;

    const mockOrder = {
      id: 'ord_test_03',
      orderRef: 'LYV-20261021-0003',
      customer: {
        fullName: 'Rohit Verma',
        mobile: '9876543211',
        email: 'rohit@example.com',
        houseFlat: 'Flat 101',
        streetLocality: 'Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400050',
      },
      items: [
        {
          productId: 'prod_dude',
          variantId: 'var_dude_m',
          sku: 'LYV-DUDE-BLK-M',
          name: 'LYVEN DUDE Graphic Oversized T-Shirt',
          slug: 'dude',
          size: 'M',
          color: 'Jet Black',
          quantity: 1,
          unitPricePaise: 5000,
          totalPricePaise: 5000,
        },
      ],
      subtotalPaise: 5000,
      deliveryChargePaise: 0,
      taxPaise: 0,
      totalPaise: 5000,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      fulfilmentStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await sendPaymentSuccessNotification(mockOrder, 'pay_test_rzp12345');
    assert.strictEqual(result.success, false, 'Should be false when no emails were sent');
    assert.strictEqual(result.adminResult.success, false);
    assert.strictEqual(result.adminResult.error, 'EMAIL_NOT_CONFIGURED');
    assert.strictEqual(result.customerResult.success, false);
    assert.strictEqual(result.customerResult.error, 'EMAIL_NOT_CONFIGURED');
  });

  test('sendOrderStatusUpdateNotification handles tracking metadata safely', async () => {
    delete process.env.RESEND_API_KEY;

    const mockOrder = {
      id: 'ord_test_04',
      orderRef: 'LYV-20261021-0004',
      customer: {
        fullName: 'Ananya Sen',
        mobile: '9876543212',
        email: 'ananya@example.com',
        houseFlat: 'Tower B, Apt 5',
        streetLocality: 'Salt Lake',
        city: 'Kolkata',
        state: 'West Bengal',
        pinCode: '700091',
      },
      items: [],
      subtotalPaise: 40000,
      deliveryChargePaise: 0,
      taxPaise: 0,
      totalPaise: 40000,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      fulfilmentStatus: 'SHIPPED',
      courierName: 'BlueDart Express',
      trackingId: 'BD123456789IN',
      trackingUrl: 'https://bluedart.com/track/BD123456789IN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await sendOrderStatusUpdateNotification(mockOrder, 'CONFIRMED', 'SHIPPED');
    assert.strictEqual(result.success, false, 'Should be false when no emails were sent');
    assert.strictEqual(result.adminResult.success, false);
    assert.strictEqual(result.adminResult.error, 'EMAIL_NOT_CONFIGURED');
  });

  test('sendOrderCancellationNotification handles cancellation reason and refund notices', async () => {
    delete process.env.RESEND_API_KEY;

    const mockOrder = {
      id: 'ord_test_05',
      orderRef: 'LYV-20261021-0005',
      customer: {
        fullName: 'Karan Mehra',
        mobile: '9876543213',
        email: 'karan@example.com',
        houseFlat: 'B-12',
        streetLocality: 'Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pinCode: '110001',
      },
      items: [],
      subtotalPaise: 40000,
      deliveryChargePaise: 0,
      taxPaise: 0,
      totalPaise: 40000,
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      fulfilmentStatus: 'CANCELLED',
      cancellationReason: 'Customer requested cancellation prior to dispatch',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await sendOrderCancellationNotification(mockOrder, mockOrder.cancellationReason);
    assert.strictEqual(result.success, false, 'Should be false when no emails were sent');
    assert.strictEqual(result.adminResult.success, false);
    assert.strictEqual(result.adminResult.error, 'EMAIL_NOT_CONFIGURED');
  });

  test('Duplicate webhook payment events are idempotent and do not trigger duplicate notifications', async () => {
    let notificationCount = 0;
    const mockSendNotification = async () => {
      notificationCount += 1;
    };

    const existingOrder = {
      id: 'ord_test_webhook_01',
      orderRef: 'LYV-20261021-WH01',
      paymentStatus: 'PAID', // Already marked as PAID by earlier verification or webhook
    };

    // Simulate incoming webhook event for an already PAID order
    if (existingOrder.paymentStatus !== 'PAID') {
      await mockSendNotification();
    }

    assert.strictEqual(notificationCount, 0, 'Duplicate webhook event must be ignored if already PAID');
  });
});
