import type { Order } from '@/types';

function formatINR(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export function isEmailConfigured(): boolean {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  if (apiKey.includes('your_') || apiKey.includes('placeholder') || apiKey.includes('example')) {
    return false;
  }
  return apiKey.startsWith('re_') && apiKey.length > 10;
}

async function sendViaResend(params: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!isEmailConfigured() || !apiKey) {
    console.log('[Email Notifications] RESEND_API_KEY is not configured. Email skipped safely.');
    return { success: false, error: 'EMAIL_NOT_CONFIGURED' };
  }

  const fromEmail = process.env.NOTIFICATION_EMAIL_FROM || 'LYVEN Orders <onboarding@resend.dev>';
  const recipients = Array.isArray(params.to) ? params.to : [params.to];

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn('[Email Notifications] Resend API error response:', data);
      return { success: false, error: data.message || 'Resend API error' };
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    console.error('[Email Notifications] Network error sending email via Resend:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 1. Admin Order Alert Notification
 * Dispatched immediately to lyven.support1@gmail.com upon order placement
 */
export async function sendAdminOrderNotification(order: Order) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'lyven.support1@gmail.com';
  const totalInRupees = formatINR(order.totalPaise);
  const subject = `🚨 [NEW ORDER] ${order.orderRef} — ${totalInRupees} (${order.paymentMethod})`;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #222;">
        <td style="padding: 10px 0; color: #FAF8F3;">
          <strong style="color: #FAF8F3;">${item.name}</strong><br/>
          <span style="font-size: 12px; color: #C9A45C; font-family: monospace;">Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 10px 0; text-align: right; color: #FAF8F3; font-family: monospace; font-weight: bold;">
          ${formatINR(item.totalPricePaise)}
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="background-color: #0B0B0D; color: #FAF8F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #121216; border: 1px solid #26262b; border-radius: 12px; overflow: hidden;">
          
          <!-- Header -->
          <div style="padding: 24px; background: linear-gradient(180deg, #18181e 0%, #121216 100%); border-bottom: 1px solid #26262b;">
            <div style="font-size: 11px; font-family: monospace; letter-spacing: 0.2em; color: #C9A45C; text-transform: uppercase;">LYVEN INTERNAL DISPATCH</div>
            <h1 style="margin: 6px 0 0; font-size: 20px; font-weight: 800; color: #FAF8F3;">New Customer Order Placed</h1>
          </div>

          <!-- Order Summary Card -->
          <div style="padding: 24px;">
            <div style="background-color: #0B0B0D; border: 1px solid #26262b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="color: #8E8E93; padding-bottom: 6px;">Order Reference:</td>
                  <td style="color: #FAF8F3; font-family: monospace; font-weight: bold; text-align: right;">${order.orderRef}</td>
                </tr>
                <tr>
                  <td style="color: #8E8E93; padding-bottom: 6px;">Payment Method:</td>
                  <td style="color: ${order.paymentMethod === 'ONLINE' ? '#34C759' : '#C9A45C'}; font-weight: bold; text-align: right;">${order.paymentMethod} (${order.paymentStatus})</td>
                </tr>
                <tr>
                  <td style="color: #8E8E93; padding-bottom: 6px;">Order Total:</td>
                  <td style="color: #FAF8F3; font-size: 16px; font-weight: 800; font-family: monospace; text-align: right;">${totalInRupees}</td>
                </tr>
              </table>
            </div>

            <!-- Customer & Delivery -->
            <h3 style="font-size: 14px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.1em; color: #C9A45C; margin: 0 0 10px;">Customer & Delivery Info</h3>
            <div style="background-color: #0B0B0D; border: 1px solid #26262b; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.6;">
              <strong style="color: #FAF8F3; font-size: 14px;">${order.customer.fullName}</strong><br/>
              <span style="color: #34C759;">📞 Mobile: ${order.customer.mobile}</span><br/>
              ${order.customer.email ? `<span style="color: #8E8E93;">✉️ Email: ${order.customer.email}</span><br/>` : ''}
              <span style="color: #8E8E93;">📍 Address: ${order.customer.houseFlat}, ${order.customer.streetLocality}, ${order.customer.city}, ${order.customer.state} — ${order.customer.pinCode}</span>
              ${order.customer.deliveryInstructions ? `<br/><span style="color: #C9A45C;">📝 Note: ${order.customer.deliveryInstructions}</span>` : ''}
            </div>

            <!-- Items Ordered -->
            <h3 style="font-size: 14px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.1em; color: #C9A45C; margin: 0 0 10px;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              ${itemsHtml}
            </table>

            <!-- Admin Button -->
            <div style="text-align: center; padding-top: 10px;">
              <a href="https://lyven.in/admin/orders" style="display: inline-block; background-color: #C9A45C; color: #0B0B0D; font-weight: 800; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Open Admin Order Manager</a>
            </div>
          </div>

          <div style="padding: 16px 24px; background-color: #0B0B0D; border-top: 1px solid #26262b; text-align: center; font-size: 11px; color: #555; font-family: monospace;">
            LYVEN E-COMMERCE · WEAR YOUR STORY
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendViaResend({
    to: adminEmail,
    subject,
    html,
    text: `New LYVEN order received: ${order.orderRef}. Customer: ${order.customer.fullName} (${order.customer.mobile}). Total: ${totalInRupees}. Payment: ${order.paymentMethod}`,
  });
}

/**
 * 2. Customer Order Confirmation
 * Dispatched to customer when email address is provided at checkout
 */
export async function sendCustomerOrderConfirmation(order: Order) {
  if (!order.customer.email) {
    // Email is optional in checkout, skip if not provided
    return { success: false, reason: 'NO_CUSTOMER_EMAIL_PROVIDED' };
  }

  const customerEmail = order.customer.email;
  const totalInRupees = formatINR(order.totalPaise);
  const subject = `Your LYVEN Order Confirmation — ${order.orderRef}`;

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #E7E5DD;">
        <td style="padding: 12px 0;">
          <strong style="color: #0B0B0D; font-size: 14px;">${item.name}</strong><br/>
          <span style="font-size: 12px; color: #6B6E7B;">Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 12px 0; text-align: right; color: #0B0B0D; font-weight: bold; font-family: monospace;">
          ${formatINR(item.totalPricePaise)}
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="background-color: #FAF8F3; color: #0B0B0D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E7E5DD; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Brand Header -->
          <div style="padding: 32px 24px 24px; text-align: center; background-color: #0B0B0D; color: #FAF8F3;">
            <div style="font-size: 24px; font-weight: 900; letter-spacing: 0.15em; color: #FAF8F3;">LYVEN</div>
            <div style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; color: #C9A45C; margin-top: 4px;">WEAR YOUR STORY</div>
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <h1 style="font-size: 20px; font-weight: 800; color: #0B0B0D; margin: 0 0 8px;">Order Confirmed!</h1>
            <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 24px;">
              Thank you for shopping with LYVEN, <strong>${order.customer.fullName}</strong>. We've received your order and are preparing your heavyweight French Terry silhouettes for dispatch.
            </p>

            <!-- Order Details Box -->
            <div style="background-color: #F8F7F3; border: 1px solid #EAE7DF; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="color: #6B6E7B; padding-bottom: 8px;">Order Reference:</td>
                  <td style="color: #0B0B0D; font-weight: bold; font-family: monospace; text-align: right;">${order.orderRef}</td>
                </tr>
                <tr>
                  <td style="color: #6B6E7B; padding-bottom: 8px;">Payment Method:</td>
                  <td style="color: #0B0B0D; font-weight: bold; text-align: right;">${order.paymentMethod === 'COD' ? 'Cash on Delivery (Pay at Doorstep)' : 'Online Payment (Verified)'}</td>
                </tr>
                <tr>
                  <td style="color: #6B6E7B;">Total Amount:</td>
                  <td style="color: #0B0B0D; font-size: 16px; font-weight: 800; font-family: monospace; text-align: right;">${totalInRupees}</td>
                </tr>
              </table>
            </div>

            <!-- Items -->
            <h2 style="font-size: 14px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.1em; color: #8E8E93; margin: 0 0 12px;">Items Summary</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              ${itemsHtml}
            </table>

            <!-- Shipping Address -->
            <div style="background-color: #F8F7F3; border: 1px solid #EAE7DF; border-radius: 12px; padding: 16px; margin-bottom: 28px; font-size: 13px; line-height: 1.6;">
              <strong style="color: #0B0B0D; display: block; margin-bottom: 4px;">Delivering to:</strong>
              ${order.customer.houseFlat}, ${order.customer.streetLocality}<br/>
              ${order.customer.city}, ${order.customer.state} — ${order.customer.pinCode}<br/>
              <span style="color: #6B6E7B;">Contact: +91 ${order.customer.mobile}</span>
            </div>

            <!-- WhatsApp Support -->
            <div style="text-align: center; padding: 20px 0; border-top: 1px solid #EAE7DF;">
              <p style="font-size: 12px; color: #6B6E7B; margin-bottom: 12px;">Need help with sizing or delivery updates?</p>
              <a href="https://wa.me/916300107759?text=Hi%20LYVEN!%20I%20have%20a%20question%20about%20order%20${order.orderRef}" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 700; font-size: 12px; padding: 12px 24px; border-radius: 10px; text-decoration: none;">
                Chat with Studio on WhatsApp
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #F4F3ED; padding: 20px 24px; text-align: center; font-size: 11px; color: #8E8E93; border-top: 1px solid #E7E5DD;">
            © 2026 LYVEN. Premium streetwear designed and crafted in India.
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendViaResend({
    to: customerEmail,
    subject,
    html,
    text: `Thank you for your LYVEN order ${order.orderRef}. Total: ${totalInRupees}. Delivering to ${order.customer.fullName}, ${order.customer.city}.`,
  });
}
