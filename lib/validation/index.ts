import { isValidMobile, isValidEmail, isValidPinCode, sanitize } from '@/lib/utils';
import type { OrderAddress, CheckoutPayload } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateAddress(address: OrderAddress): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!address.fullName || sanitize(address.fullName).length < 2) {
    errors.push({ field: 'fullName', message: 'Please enter your full name' });
  }

  if (!address.mobile || !isValidMobile(address.mobile)) {
    errors.push({ field: 'mobile', message: 'Please enter a valid 10-digit mobile number' });
  }

  if (address.email && !isValidEmail(address.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!address.houseFlat || sanitize(address.houseFlat).length < 2) {
    errors.push({ field: 'houseFlat', message: 'Please enter your house/flat number' });
  }

  if (!address.streetLocality || sanitize(address.streetLocality).length < 3) {
    errors.push({ field: 'streetLocality', message: 'Please enter your street/locality' });
  }

  if (!address.city || sanitize(address.city).length < 2) {
    errors.push({ field: 'city', message: 'Please enter your city' });
  }

  if (!address.state || sanitize(address.state).length < 2) {
    errors.push({ field: 'state', message: 'Please select your state' });
  }

  if (!address.pinCode || !isValidPinCode(address.pinCode)) {
    errors.push({ field: 'pinCode', message: 'Please enter a valid 6-digit PIN code' });
  }

  return errors;
}

export function validateCheckoutPayload(payload: CheckoutPayload): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate items
  if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push({ field: 'items', message: 'No items in cart' });
  } else {
    payload.items.forEach((item, index) => {
      if (!item.productId) {
        errors.push({ field: `items[${index}].productId`, message: 'Invalid product' });
      }
      if (!item.variantId) {
        errors.push({ field: `items[${index}].variantId`, message: 'Invalid variant' });
      }
      if (!item.quantity || item.quantity < 1 || item.quantity > 10) {
        errors.push({ field: `items[${index}].quantity`, message: 'Invalid quantity' });
      }
    });
  }

  // Validate customer
  const addressErrors = validateAddress(payload.customer);
  errors.push(...addressErrors);

  // Validate payment method
  if (!['ONLINE', 'COD'].includes(payload.paymentMethod)) {
    errors.push({ field: 'paymentMethod', message: 'Invalid payment method' });
  }

  // Validate idempotency key
  if (!payload.idempotencyKey || payload.idempotencyKey.length < 10) {
    errors.push({ field: 'idempotencyKey', message: 'Missing idempotency key' });
  }

  return errors;
}
