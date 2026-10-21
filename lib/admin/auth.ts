import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'lyven_admin_secure_key_2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lyvenadmin2026';
const COOKIE_NAME = 'lyven_admin_token';

/**
 * Generate a signed session token for the admin
 */
export function generateAdminToken(): string {
  const timestamp = Date.now();
  const data = `admin:${timestamp}`;
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('hex');
  return Buffer.from(`${data}:${signature}`).toString('base64');
}

/**
 * Verify if the given token is valid and not expired (24h validity)
 */
export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [prefix, timestampStr, signature] = decoded.split(':');

    if (prefix !== 'admin' || !timestampStr || !signature) {
      return false;
    }

    const timestamp = parseInt(timestampStr, 10);
    // 24-hour expiration window
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(`admin:${timestampStr}`)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

/**
 * Check if the current request is from an authenticated admin (Server Components & API Routes)
 */
export async function isAuthenticatedAdmin(req?: NextRequest): Promise<boolean> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) return false;
  return verifyAdminToken(token);
}

export { ADMIN_PASSWORD, COOKIE_NAME };
