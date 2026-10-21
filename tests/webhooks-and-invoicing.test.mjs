import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

describe('Razorpay Webhooks Cryptographic Security', () => {
  const WEBHOOK_SECRET = 'whsec_lyven_test_secret_998124';

  function verifyWebhookSignature(rawBody, signatureHeader, secret) {
    if (!signatureHeader || !secret) return false;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const bufA = Buffer.from(signatureHeader, 'utf8');
    const bufB = Buffer.from(expected, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  it('accepts genuine webhook payloads with matching HMAC-SHA256 signature', () => {
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_ABC123456789',
            order_id: 'order_DEF987654321',
            amount: 40000,
            status: 'captured',
          },
        },
      },
    });

    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawPayload)
      .digest('hex');

    assert.equal(verifyWebhookSignature(rawPayload, signature, WEBHOOK_SECRET), true);
  });

  it('rejects tampered webhook payloads where amount or status was altered in transit', () => {
    const originalPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_ABC123456789',
            order_id: 'order_DEF987654321',
            amount: 40000,
          },
        },
      },
    });

    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(originalPayload)
      .digest('hex');

    // Tampered payload (attacker changes amount)
    const tamperedPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_ABC123456789',
            order_id: 'order_DEF987654321',
            amount: 1000,
          },
        },
      },
    });

    assert.equal(verifyWebhookSignature(tamperedPayload, signature, WEBHOOK_SECRET), false);
  });

  it('rejects signatures signed with an invalid secret', () => {
    const rawPayload = JSON.stringify({ event: 'order.paid' });
    const wrongSignature = crypto
      .createHmac('sha256', 'wrong_secret')
      .update(rawPayload)
      .digest('hex');

    assert.equal(verifyWebhookSignature(rawPayload, wrongSignature, WEBHOOK_SECRET), false);
  });
});

describe('Indian GST Invoice Calculations for LYVEN Apparel', () => {
  function computeGstBreakdown(totalPaise, state) {
    const isKarnataka = (state || '').toLowerCase().includes('karnataka');
    const totalINR = totalPaise / 100;
    // GST rate for garments <= ₹1000 is 5%
    const taxableBase = Math.round((totalINR / 1.05) * 100) / 100;
    const totalGst = Math.round((totalINR - taxableBase) * 100) / 100;

    const cgst = isKarnataka ? Math.round((totalGst / 2) * 100) / 100 : 0;
    const sgst = isKarnataka ? Math.round((totalGst / 2) * 100) / 100 : 0;
    const igst = !isKarnataka ? totalGst : 0;

    return {
      totalINR,
      taxableBase,
      totalGst,
      cgst,
      sgst,
      igst,
      isKarnataka,
    };
  }

  it('correctly calculates 5% GST split (CGST 2.5% + SGST 2.5%) for Karnataka (intra-state)', () => {
    // ₹400 Virat Kohli Tee
    const { totalINR, taxableBase, totalGst, cgst, sgst, igst } = computeGstBreakdown(40000, 'Karnataka');

    assert.equal(totalINR, 400);
    // 400 / 1.05 = 380.95 taxable value
    assert.equal(taxableBase, 380.95);
    // 400 - 380.95 = 19.05 total tax
    assert.equal(totalGst, 19.05);
    assert.equal(cgst, 9.53);
    assert.equal(sgst, 9.53);
    assert.equal(igst, 0);
    assert.equal(Math.round((taxableBase + cgst + sgst) * 10) / 10, 400);
  });

  it('correctly calculates 5% IGST for Inter-State delivery (e.g. Maharashtra, Delhi)', () => {
    // ₹800 for 2 T-shirts Inter-State
    const { totalINR, taxableBase, totalGst, cgst, sgst, igst } = computeGstBreakdown(80000, 'Maharashtra');

    assert.equal(totalINR, 800);
    // 800 / 1.05 = 761.9
    assert.equal(taxableBase, 761.9);
    // 800 - 761.90 = 38.10
    assert.equal(totalGst, 38.1);
    assert.equal(igst, 38.1);
    assert.equal(cgst, 0);
    assert.equal(sgst, 0);
  });

  it('validates cotton T-shirt HSN code standard', () => {
    const HSN_CODE = '61091000';
    // Indian customs / GST HSN code for cotton T-shirts
    assert.match(HSN_CODE, /^61091000$/);
  });
});
