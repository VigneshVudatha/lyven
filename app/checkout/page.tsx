'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Banknote,
  ShoppingBag,
  Lock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart/store';
import { formatPriceINR, INDIAN_STATES, isValidMobile, isValidEmail, isValidPinCode } from '@/lib/utils';
import type { OrderAddress, PaymentMethod } from '@/types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotalPaise = useCartStore((s) => s.getSubtotalPaise());
  const itemCount = useCartStore((s) => s.getItemCount());

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [idempotencyKey] = useState(generateIdempotencyKey);

  const [address, setAddress] = useState<OrderAddress>({
    fullName: '',
    mobile: '',
    email: '',
    houseFlat: '',
    streetLocality: '',
    city: '',
    state: '',
    pinCode: '',
    deliveryInstructions: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const updateAddress = (field: keyof OrderAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!address.fullName || address.fullName.trim().length < 2) {
      errors.fullName = 'Full name is required';
    }
    if (!address.mobile || !isValidMobile(address.mobile)) {
      errors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (address.email && !isValidEmail(address.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!address.houseFlat || address.houseFlat.trim().length < 2) {
      errors.houseFlat = 'House / Flat details are required';
    }
    if (!address.streetLocality || address.streetLocality.trim().length < 3) {
      errors.streetLocality = 'Street / Locality is required';
    }
    if (!address.city || address.city.trim().length < 2) {
      errors.city = 'City is required';
    }
    if (!address.state) {
      errors.state = 'State is required';
    }
    if (!address.pinCode || !isValidPinCode(address.pinCode)) {
      errors.pinCode = 'Enter a valid 6-digit PIN code';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;
    if (items.length === 0) {
      setError('Your shopping bag is empty');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          customer: address,
          paymentMethod,
          idempotencyKey,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      if (paymentMethod === 'COD') {
        clearCart();
        router.push(`/order-confirmation?ref=${data.data.orderRef}`);
        return;
      }

      if (!data.data.razorpayOrderId || !data.data.razorpayKeyId) {
        throw new Error('Payment configuration error');
      }

      const options = {
        key: data.data.razorpayKeyId,
        amount: data.data.totalPaise,
        currency: 'INR',
        name: 'LYVEN',
        description: 'LYVEN Order Payment',
        order_id: data.data.razorpayOrderId,
        prefill: {
          name: address.fullName,
          email: address.email || undefined,
          contact: address.mobile,
        },
        theme: {
          color: '#0B0B0D',
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.data.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            clearCart();
            router.push(`/order-confirmation?ref=${data.data.orderRef}`);
          } catch (err) {
            setError('Payment verification failed. Please contact support if amount was deducted.');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment was cancelled. Your order has been saved — you can retry payment.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="bg-[#FAF8F3] min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs font-mono uppercase tracking-widest text-[#6B6E7B]">Loading Checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F3] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white border border-[#E7E5DD] rounded-2xl p-8 sm:p-10 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F3] border border-[#E7E5DD] flex items-center justify-center mx-auto mb-5 text-[#C9A45C]">
            <ShoppingBag size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0B0B0D] tracking-tight font-sans">
            Nothing to Checkout
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6E7B] mt-2 mb-8 leading-relaxed font-sans">
            Your shopping bag is empty. Explore our collection to select your streetwear t-shirt.
          </p>
          <Link
            href="/shop"
            className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-xl bg-[#0B0B0D] hover:bg-neutral-800 text-[#FAF8F3] font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
          >
            Browse Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F3] text-[#0B0B0D] min-h-screen py-6 sm:py-12 pb-32 sm:pb-16 px-3.5 sm:px-6 lg:px-8 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full">
        {/* Navigation & Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Link
            href="/cart"
            className="p-2 rounded-xl border border-[#E7E5DD] bg-white text-[#6B6E7B] hover:text-[#0B0B0D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
            aria-label="Return to cart"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-0.5">
              FINAL STEP
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-[#0B0B0D] tracking-tight font-sans">
              Checkout
            </h1>
          </div>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 shadow-xs" role="alert">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-700 font-medium font-sans">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
            {/* Form Column */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-8">
              {/* Delivery Address Section */}
              <div className="bg-white border border-[#E7E5DD] rounded-2xl p-4 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#E7E5DD] mb-5 sm:mb-6">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0B0B0D] font-mono">
                      1. Delivery Address
                    </h2>
                    <p className="text-[11px] sm:text-xs text-[#6B6E7B] mt-0.5 font-sans">
                      Where should we send your parcel?
                    </p>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-[#6B6E7B] font-mono shrink-0">
                    <span className="text-red-500 font-bold">*</span> Required
                  </span>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-bold text-[#0B0B0D] mb-1.5 font-sans">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      value={address.fullName}
                      onChange={(e) => updateAddress('fullName', e.target.value)}
                      aria-invalid={!!fieldErrors.fullName}
                      aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
                      className={`w-full px-4 py-3 bg-[#FAF8F3] border rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none focus:bg-white transition-colors ${
                        fieldErrors.fullName
                          ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                          : 'border-[#E7E5DD] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]'
                      }`}
                      placeholder="e.g. Rahul Sharma"
                    />
                    {fieldErrors.fullName && (
                      <p id="fullName-error" className="text-xs text-red-600 mt-1 font-sans font-medium">
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Mobile & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="mobile" className="block text-xs font-bold text-[#0B0B0D] mb-1.5 font-sans">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="mobile"
                        type="tel"
                        autoComplete="tel"
                        inputMode="numeric"
                        value={address.mobile}
                        onChange={(e) => updateAddress('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        aria-invalid={!!fieldErrors.mobile}
                        aria-describedby={fieldErrors.mobile ? 'mobile-error' : undefined}
                        className={`w-full px-4 py-3 bg-[#FAF8F3] border rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none focus:bg-white transition-colors ${
                          fieldErrors.mobile
                            ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                            : 'border-[#E7E5DD] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]'
                        }`}
                        placeholder="10-digit number (e.g. 9876543210)"
                      />
                      {fieldErrors.mobile && (
                        <p id="mobile-error" className="text-xs text-red-600 mt-1 font-sans font-medium">
                          {fieldErrors.mobile}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-[#0B0B0D] mb-1.5 font-sans">
                        Email Address <span className="text-[#A1A1AA] font-normal">(Optional)</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={address.email}
                        onChange={(e) => updateAddress('email', e.target.value)}
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                        className={`w-full px-4 py-3 bg-[#FAF8F3] border rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none focus:bg-white transition-colors ${
                          fieldErrors.email
                            ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                            : 'border-[#E7E5DD] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]'
                        }`}
                        placeholder="For delivery dispatch tracking"
                      />
                      {fieldErrors.email && (
                        <p id="email-error" className="text-xs text-red-600 mt-1 font-sans font-medium">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* House / Flat / Building */}
                  <div>
                    <label htmlFor="houseFlat" className="block text-xs font-bold text-[#0B0B0D] mb-1.5 font-sans">
                      Flat, House No., Building Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="houseFlat"
                      type="text"
                      value={address.houseFlat}
                      onChange={(e) => updateAddress('houseFlat', e.target.value)}
                      aria-invalid={!!fieldErrors.houseFlat}
                      aria-describedby={fieldErrors.houseFlat ? 'houseFlat-error' : undefined}
                      className={`w-full px-4 py-3 bg-[#FAF8F3] border rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none focus:bg-white transition-colors ${
                        fieldErrors.houseFlat
                          ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                          : 'border-[#E7E5DD] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]'
                      }`}
                      placeholder="e.g. Flat 302, Sai Residency"
                    />
                    {fieldErrors.houseFlat && (
                      <p id="houseFlat-error" className="text-xs text-red-600 mt-1 font-sans font-medium">
                        {fieldErrors.houseFlat}
                      </p>
                    )}
                  </div>

                  {/* Street / Locality */}
                  <div>
                    <label htmlFor="streetLocality" className="block text-xs font-bold text-[#0B0B0D] mb-1.5 font-sans">
                      Street, Road, Locality, Area <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="streetLocality"
                      type="text"
                      value={address.streetLocality}
                      onChange={(e) => updateAddress('streetLocality', e.target.value)}
                      aria-invalid={!!fieldErrors.streetLocality}
                      aria-describedby={fieldErrors.streetLocality ? 'streetLocality-error' : undefined}
                      className={`w-full px-4 py-3 bg-[#FAF8F3] border rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none focus:bg-white transition-colors ${
                        fieldErrors.streetLocality
                          ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                          : 'border-[#E7E5DD] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]'
                      }`}
                      placeholder="e.g. 12th Main, Indiranagar"
                    />
                    {fieldErrors.streetLocality && (
                      <p id="streetLocality-error" className="text-xs text-red-600 mt-1 font-sans font-medium">
                        {fieldErrors.streetLocality}
                      </p>
                    )}
                  </div>

                  {/* City, State, PIN Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-xs font-bold text-[#0B0B0D] mb-1.5 font-sans">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={address.city}
                        onChange={(e) => updateAddress('city', e.target.value)}
                        aria-invalid={!!fieldErrors.city}
                        aria-describedby={fieldErrors.city ? 'city-error' : undefined}
                        className={`w-full px-4 py-3 bg-[#FAF8F3] border rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none focus:bg-white transition-colors ${
                          fieldErrors.city
                            ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                            : 'border-[#E7E5DD] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]'
                        }`}
                        placeholder="e.g. Bengaluru"
                      />
                      {fieldErrors.city && (
                        <p id="city-error" className="text-xs text-red-600 mt-1 font-sans font-medium">
                          {fieldErrors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-xs font-bold text-[#0B0B0D] mb-1.5 font-sans">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="state"
                        value={address.state}
                        onChange={(e) => updateAddress('state', e.target.value)}
                        aria-invalid={!!fieldErrors.state}
                        aria-describedby={fieldErrors.state ? 'state-error' : undefined}
                        className={`w-full px-3.5 py-3 bg-[#FAF8F3] border rounded-xl text-xs sm:text-sm text-[#0B0B0D] focus:outline-none focus:bg-white transition-colors cursor-pointer ${
                          fieldErrors.state
                            ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                            : 'border-[#E7E5DD] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]'
                        }`}
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.state && (
                        <p id="state-error" className="text-xs text-red-600 mt-1 font-sans font-medium">
                          {fieldErrors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="pinCode" className="block text-xs font-bold text-[#0B0B0D] mb-1.5 font-sans">
                        PIN Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="pinCode"
                        type="text"
                        inputMode="numeric"
                        value={address.pinCode}
                        onChange={(e) => updateAddress('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        aria-invalid={!!fieldErrors.pinCode}
                        aria-describedby={fieldErrors.pinCode ? 'pinCode-error' : undefined}
                        className={`w-full px-4 py-3 bg-[#FAF8F3] border rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none focus:bg-white transition-colors ${
                          fieldErrors.pinCode
                            ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                            : 'border-[#E7E5DD] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]'
                        }`}
                        placeholder="6-digit PIN"
                      />
                      {fieldErrors.pinCode && (
                        <p id="pinCode-error" className="text-xs text-red-600 mt-1 font-sans font-medium">
                          {fieldErrors.pinCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Instructions */}
                  <div>
                    <label htmlFor="deliveryInstructions" className="block text-xs font-bold text-[#0B0B0D] mb-1.5 font-sans">
                      Delivery Instructions <span className="text-[#A1A1AA] font-normal">(Optional)</span>
                    </label>
                    <textarea
                      id="deliveryInstructions"
                      rows={2}
                      value={address.deliveryInstructions}
                      onChange={(e) => updateAddress('deliveryInstructions', e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF8F3] border border-[#E7E5DD] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C] focus:bg-white rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none resize-none transition-colors"
                      placeholder="e.g. Leave package with security guard or call upon arrival"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="bg-white border border-[#E7E5DD] rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B0B0D] font-mono pb-4 border-b border-[#E7E5DD] mb-6">
                  2. Select Payment Method
                </h2>

                <div className="space-y-3">
                  {/* Prepaid / Razorpay */}
                  <label
                    className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'ONLINE'
                        ? 'border-[#0B0B0D] ring-2 ring-[#0B0B0D] bg-[#FAF8F3]/60'
                        : 'border-[#E7E5DD] hover:border-[#C9A45C]/60 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        paymentMethod === 'ONLINE' ? 'border-[#0B0B0D]' : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'ONLINE' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0B0B0D]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-[#0B0B0D]" />
                        <span className="text-sm font-bold text-[#0B0B0D] font-sans">
                          Pay Online (Instant &amp; Contactless)
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6E7B] mt-1 font-sans">
                        UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking via Razorpay.
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'border-[#0B0B0D] ring-2 ring-[#0B0B0D] bg-[#FAF8F3]/60'
                        : 'border-[#E7E5DD] hover:border-[#C9A45C]/60 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        paymentMethod === 'COD' ? 'border-[#0B0B0D]' : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'COD' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0B0B0D]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Banknote size={18} className="text-[#0B0B0D]" />
                        <span className="text-sm font-bold text-[#0B0B0D] font-sans">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6E7B] mt-1 font-sans">
                        Pay in cash or UPI directly to the courier executive upon doorstep delivery.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary Sticky Column */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-white border border-[#E7E5DD] rounded-2xl p-6 sm:p-7 shadow-xs sticky top-24 space-y-6">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-1">
                    CONFIRMATION
                  </span>
                  <h2 className="text-lg font-bold text-[#0B0B0D] font-sans">
                    Order Summary
                  </h2>
                </div>

                {/* Items List */}
                <div className="space-y-3.5 pb-4 border-b border-[#E7E5DD] max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-[#F4F3ED] rounded-lg shrink-0 overflow-hidden flex items-center justify-center p-1 border border-[#E7E5DD]/60">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <ShoppingBag size={14} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#0B0B0D] truncate font-sans">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#6B6E7B] font-mono mt-0.5">
                          Size {item.size} &times; {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-bold font-mono text-[#0B0B0D] shrink-0">
                        {formatPriceINR(item.pricePaise * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B6E7B]">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span className="font-bold font-mono text-[#0B0B0D]">{formatPriceINR(subtotalPaise)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6E7B]">Delivery</span>
                    <span className="text-[#15803D] font-mono font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full text-xs">
                      Free Delivery
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-[#E7E5DD] pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#0B0B0D] text-sm">Total Payable</span>
                    <span className="font-black text-xl sm:text-2xl font-mono text-[#0B0B0D]">
                      {formatPriceINR(subtotalPaise)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6E7B] mt-1 font-mono">
                    All taxes &amp; shipping included
                  </p>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl bg-[#0B0B0D] hover:bg-neutral-800 text-[#FAF8F3] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-[#C9A45C]" />
                      <span>Creating Order...</span>
                    </>
                  ) : paymentMethod === 'ONLINE' ? (
                    <>
                      <Lock size={14} className="text-[#C9A45C]" />
                      <span>Pay {formatPriceINR(subtotalPaise)} Online</span>
                    </>
                  ) : (
                    <span>Confirm Order — Cash on Delivery</span>
                  )}
                </button>

                {/* Terms agreement */}
                <p className="text-[11px] text-[#6B6E7B] text-center leading-relaxed font-sans">
                  By placing your order, you agree to our{' '}
                  <Link href="/policies/terms" className="underline hover:text-[#0B0B0D]">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="/policies/privacy" className="underline hover:text-[#0B0B0D]">
                    Privacy Policy
                  </Link>.
                </p>

                {/* Security trust badge */}
                <div className="pt-3 border-t border-[#E7E5DD] flex items-center justify-center gap-2 text-[11px] text-[#6B6E7B] font-mono">
                  <ShieldCheck size={14} className="text-[#15803D]" />
                  <span>256-Bit SSL Encrypted Payment</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
