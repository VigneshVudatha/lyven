// ─── Product Types ───────────────────────────────────────────────

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  pricePaise: number;
  fit: string;
  category: string;
  images: ProductImage[];
  active: boolean;
  careInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  type: 'front' | 'back' | 'detail' | 'lifestyle';
  order: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: Size;
  color: string;
  sku: string;
  quantity: number;
  active: boolean;
}

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export const ALL_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// ─── Cart Types ──────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  variantId: string;
  sku?: string;
  slug: string;
  name: string;
  size: Size;
  color: string;
  quantity: number;
  pricePaise: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}

// ─── Order Types ─────────────────────────────────────────────────

export type PaymentMethod = 'ONLINE' | 'COD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type FulfilmentStatus = 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderAddress {
  fullName: string;
  mobile: string;
  email?: string;
  houseFlat: string;
  streetLocality: string;
  city: string;
  state: string;
  pinCode: string;
  deliveryInstructions?: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  slug: string;
  size: Size;
  color: string;
  quantity: number;
  unitPricePaise: number;
  totalPricePaise: number;
  image: string;
}

export interface Order {
  id: string;
  orderRef: string;
  userId?: string;
  customer: OrderAddress;
  items: OrderItem[];
  subtotalPaise: number;
  deliveryChargePaise: number;
  taxPaise: number;
  totalPaise: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  courierName?: string;
  trackingId?: string;
  trackingUrl?: string;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment Types ───────────────────────────────────────────────

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderRef: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  verified: boolean;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Admin Types ─────────────────────────────────────────────────

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin';
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paidCount: number;
  unpaidCount: number;
  onlineRevenuePaise: number;
  codRevenuePaise: number;
  codPendingPaise: number;
}

// ─── API Response Types ──────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Config Types ────────────────────────────────────────────────

export interface StoreConfig {
  codEnabled: boolean;
  codFeePaise: number;
  deliveryChargePaise: number;
  freeDeliveryAbovePaise: number;
  taxRate: number; // e.g., 0.05 for 5% GST
  maxQuantityPerItem: number;
}

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  codEnabled: true,
  codFeePaise: 0,
  deliveryChargePaise: 0,
  freeDeliveryAbovePaise: 0,
  taxRate: 0,
  maxQuantityPerItem: 5,
};

// ─── Checkout Types ──────────────────────────────────────────────

export interface CheckoutPayload {
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
  customer: OrderAddress;
  paymentMethod: PaymentMethod;
  idempotencyKey: string;
}

export interface CheckoutResponse {
  orderId: string;
  orderRef: string;
  totalPaise: number;
  paymentMethod: PaymentMethod;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
}

// ─── Custom Design Enquiry Types ──────────────────────────────────

export interface CustomDesignEnquiry {
  id: string;
  enquiryRef: string;
  apparelId: string;
  apparelName: string;
  fabric: string;
  description?: string;
  referenceFileName?: string;
  referenceFileUrl?: string;
  customerName?: string;
  customerPhone?: string;
  whatsappUrl?: string;
  status: 'NEW' | 'IN_DISCUSSION' | 'DESIGN_APPROVED' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

