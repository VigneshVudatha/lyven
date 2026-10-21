'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, CreditCard, Truck, ArrowRight, Loader2, FileText, MessageCircle } from 'lucide-react';
import { formatPriceINR } from '@/lib/utils';
import TaxInvoiceModal from '@/components/orders/TaxInvoiceModal';

interface OrderData {
  orderRef: string;
  items: {
    name: string;
    size: string;
    color: string;
    quantity: number;
    unitPricePaise: number;
    totalPricePaise: number;
    image: string;
  }[];
  subtotalPaise: number;
  deliveryChargePaise: number;
  taxPaise: number;
  totalPaise: number;
  paymentMethod: string;
  paymentStatus: string;
  fulfilmentStatus: string;
  createdAt: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPinCode: string;
  customer?: {
    fullName: string;
    houseFlat: string;
    streetLocality: string;
    city: string;
    state: string;
    pinCode: string;
    mobile?: string;
    email?: string;
  };
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (!ref) {
      setError('No order reference provided');
      setLoading(false);
      return;
    }

    fetch(`/api/orders/lookup?ref=${encodeURIComponent(ref)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.data);
        } else {
          setError(data.error || 'Order not found');
        }
      })
      .catch(() => setError('Failed to load order details'))
      .finally(() => setLoading(false));
  }, [ref]);

  if (loading) {
    return (
      <div className="bg-[#FAF8F3] min-h-[60vh] flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono uppercase tracking-widest text-[#6B6E7B]">Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-[#FAF8F3] min-h-[60vh] flex flex-col items-center justify-center py-16 px-4 text-center font-sans">
        <div className="max-w-md w-full bg-white border border-[#E7E5DD] rounded-2xl p-8 shadow-xs">
          <p className="text-sm text-[#6B6E7B] mb-6 font-medium">{error || 'Order not found'}</p>
          <Link
            href="/shop"
            className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-xl bg-[#0B0B0D] hover:bg-neutral-800 text-[#FAF8F3] font-bold text-xs uppercase tracking-wider transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-8 sm:py-16 px-3.5 sm:px-6 pb-28 sm:pb-16 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} className="text-[#15803D]" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-1">
            {order.paymentMethod === 'COD' ? 'ORDER PLACED · CASH ON DELIVERY' : 'PAYMENT SUCCESSFUL'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B0B0D]">
            Order Confirmed
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6E7B] mt-1">
            Thank you for shopping with LYVEN. Your order reference is:
          </p>
          <div className="mt-3 inline-block px-4 py-2 bg-white border border-[#E7E5DD] rounded-xl text-base font-extrabold font-mono text-[#0B0B0D] tracking-wider shadow-2xs">
            {order.orderRef}
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white border border-[#E7E5DD] rounded-2xl divide-y divide-[#E7E5DD] shadow-xs overflow-hidden">
          {/* Items */}
          <div className="p-5 sm:p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B0B0D] font-mono mb-4">
              Order Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3.5">
                  <div className="w-12 h-14 bg-[#F4F3ED] rounded-lg shrink-0 overflow-hidden flex items-center justify-center p-1 border border-[#E7E5DD]/60">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package size={14} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-[#0B0B0D] truncate font-sans">{item.name}</p>
                    <p className="text-[11px] text-[#6B6E7B] font-mono mt-0.5">
                      Size: {item.size} · Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-bold font-mono text-[#0B0B0D]">
                    {formatPriceINR(item.totalPricePaise)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-5 sm:p-6">
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B6E7B]">Subtotal</span>
                <span className="font-bold font-mono text-[#0B0B0D]">{formatPriceINR(order.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B6E7B]">Delivery</span>
                <span className="text-[#15803D] font-mono font-bold bg-[#DCFCE7] px-2 py-0.5 rounded-full text-xs">
                  {order.deliveryChargePaise > 0 ? formatPriceINR(order.deliveryChargePaise) : 'Free Delivery'}
                </span>
              </div>
              {order.taxPaise > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#6B6E7B]">Tax</span>
                  <span className="font-mono text-[#0B0B0D]">{formatPriceINR(order.taxPaise)}</span>
                </div>
              )}
              <div className="border-t border-[#E7E5DD] pt-3 mt-3 flex justify-between items-baseline font-bold">
                <span className="text-[#0B0B0D]">
                  {order.paymentMethod === 'COD' ? 'Total Payable on Delivery' : 'Total Paid'}
                </span>
                <span className="text-lg sm:text-xl font-mono text-[#0B0B0D]">{formatPriceINR(order.totalPaise)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Metadata */}
          <div className="p-5 sm:p-6 bg-[#FAF8F3]/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex items-center gap-1.5 mb-1 text-[#0B0B0D] font-bold">
                  <CreditCard size={14} className="text-[#C9A45C]" />
                  <span className="uppercase tracking-wider font-mono">Payment</span>
                </div>
                <p className="text-[#6B6E7B]">
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}
                </p>
                <p className={`text-[11px] font-mono font-bold mt-0.5 ${
                  order.paymentStatus === 'PAID' ? 'text-[#15803D]' : 'text-amber-600'
                }`}>
                  Status: {order.paymentStatus}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1 text-[#0B0B0D] font-bold">
                  <Truck size={14} className="text-[#C9A45C]" />
                  <span className="uppercase tracking-wider font-mono">Shipping To</span>
                </div>
                <p className="text-[#6B6E7B]">
                  {order.deliveryCity}, {order.deliveryState} — {order.deliveryPinCode}
                </p>
                <p className="text-[11px] font-mono font-bold text-blue-700 mt-0.5">
                  Fulfillment: {order.fulfilmentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="px-5 sm:px-6 py-3 bg-[#FAF8F3] text-[11px] text-[#6B6E7B] font-mono">
            Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            type="button"
            onClick={() => setShowInvoice(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#E7E5DD] bg-white hover:bg-[#FAF8F3] text-[#0B0B0D] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <FileText size={15} className="text-[#C9A45C]" />
            <span>Tax Invoice</span>
          </button>
          <Link
            href={`/track?ref=${order.orderRef}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0B0B0D] hover:bg-neutral-800 text-[#FAF8F3] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs"
          >
            <span>Track Order</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#E7E5DD] hover:border-[#C9A45C] text-[#6B6E7B] hover:text-[#0B0B0D] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors"
          >
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* WhatsApp Assistance */}
        <div className="mt-8 text-center">
          <a
            href={`https://wa.me/916300107759?text=${encodeURIComponent(
              `Hi LYVEN Concierge, I placed order ${order.orderRef} and have a quick query regarding delivery.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#25D366]/40 text-xs font-semibold text-[#0B0B0D] hover:bg-[#DCFCE7]/40 transition-colors shadow-2xs"
          >
            <MessageCircle size={15} className="text-[#25D366] fill-current" />
            <span>Need immediate delivery help? Chat with LYVEN on WhatsApp</span>
          </a>
        </div>

        {/* GST Invoice Modal */}
        <TaxInvoiceModal
          order={order}
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
        />
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#FAF8F3] min-h-[60vh] flex flex-col items-center justify-center font-sans">
          <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono uppercase tracking-widest text-[#6B6E7B]">Loading order details...</p>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
