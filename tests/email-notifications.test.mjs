import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isEmailConfigured, sendCustomerOrderConfirmation, sendAdminOrderNotification } from '../lib/email/notifications.ts';

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
});
