/**
 * Format paise to INR display string
 * e.g., 40000 → "₹400" or 38800 → "₹388"
 */
export function formatPriceINR(paise: number): string {
  const rupees = paise / 100;
  // Use Indian locale formatting
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export const formatINR = formatPriceINR;

/**
 * Generate a unique order reference
 * Format: LYV-YYYYMMDD-XXXXX (random alphanumeric)
 */
export function generateOrderRef(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LYV-${datePart}-${randomPart}`;
}

/**
 * Validate Indian PIN code format (6 digits, doesn't start with 0)
 */
export function isValidPinCode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin);
}

/**
 * Validate Indian mobile number (10 digits starting with 6-9)
 */
export function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Sanitize string input
 */
export function sanitize(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Calculate cart totals
 */
export function calculateTotals(
  items: { unitPricePaise: number; quantity: number }[],
  deliveryChargePaise: number = 0,
  taxRate: number = 0
): {
  subtotalPaise: number;
  deliveryChargePaise: number;
  taxPaise: number;
  totalPaise: number;
} {
  const subtotalPaise = items.reduce(
    (sum, item) => sum + item.unitPricePaise * item.quantity,
    0
  );
  const taxPaise = Math.round(subtotalPaise * taxRate);
  const totalPaise = subtotalPaise + deliveryChargePaise + taxPaise;

  return {
    subtotalPaise,
    deliveryChargePaise,
    taxPaise,
    totalPaise,
  };
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * cn — merge class names (minimal alternative to clsx)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Indian states list for address forms
 */
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

export type IndianState = typeof INDIAN_STATES[number];
