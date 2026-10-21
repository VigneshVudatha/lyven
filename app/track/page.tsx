'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Package, Truck, CheckCircle2, Clock, AlertCircle, ArrowLeft, ShieldCheck, MapPin, FileText, MessageCircle } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import TaxInvoiceModal from '@/components/orders/TaxInvoiceModal';

interface TrackedOrderData {
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
  customer?: {
    fullName: string;
    houseFlat: string;
    streetLocality: string;
    city: string;
    state: string;
    pinCode: string;
  };
  deliveryCity: string;
  deliveryState: string;
  deliveryPinCode: string;
  courierName?: string;
  trackingId?: string;
  trackingUrl?: string;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const queryRef = searchParams.get('ref');
  const [reference, setReference] = useState(queryRef || '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (queryRef) {
      setReference(queryRef);
      lookupOrder(queryRef);
    }
  }, [queryRef]);

  const lookupOrder = async (refStr: string) => {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/lookup?ref=${encodeURIComponent(refStr.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Order not found. Please verify your reference number.');
      }

      setOrder(data.data);
    } catch (err: any) {
      setError(err.message || 'Unable to track order. Please try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;
    await lookupOrder(reference);
  };

  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    const s = currentStatus.toUpperCase();
    const statusMap: Record<string, number> = {
      CONFIRMED: 0,
      PROCESSING: 1,
      SHIPPED: 2,
      DELIVERED: 3,
      CANCELLED: -1,
    };

    const currentStep = statusMap[s] ?? 0;
    if (s === 'CANCELLED') return 'cancelled';
    if (currentStep > stepIndex) return 'completed';
    if (currentStep === stepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#0B0B0D] py-10 sm:py-16 px-4 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Navigation link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#6B6E7B] hover:text-[#0B0B0D] transition-colors mb-6 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C] rounded-md px-1 py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storefront</span>
        </Link>

        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-1">
            FULFILLMENT TRACKER
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B0B0D]">
            Track Your Shipment
          </h1>
          <p className="text-[#6B6E7B] text-xs sm:text-sm mt-2 max-w-lg leading-relaxed">
            Enter your unique LYVEN order reference received on confirmation (e.g.{' '}
            <span className="text-[#0B0B0D] font-mono font-bold">LYV-20261012-ABC12</span>).
          </p>
        </div>

        {/* Tracking Search Form */}
        <form onSubmit={handleTrack} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="ENTER ORDER REFERENCE"
                className="w-full bg-white border border-[#E7E5DD] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C] rounded-xl pl-11 pr-4 py-3.5 text-xs sm:text-sm uppercase tracking-wider text-[#0B0B0D] placeholder-neutral-400 focus:outline-none transition-colors font-mono shadow-xs"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !reference.trim()}
              className="bg-[#0B0B0D] hover:bg-neutral-800 text-[#FAF8F3] font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                'Track Order'
              )}
            </button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-800 font-sans">Order Not Located</h4>
              <p className="text-xs text-red-700 mt-1 font-sans">{error}</p>
              <p className="text-xs text-[#6B6E7B] mt-2 font-sans">
                Need help? Contact support at{' '}
                <a href="mailto:support@lyven.in" className="underline hover:text-[#0B0B0D]">
                  support@lyven.in
                </a>{' '}
                or WhatsApp{' '}
                <a href="https://wa.me/916300107759" className="underline hover:text-[#0B0B0D]">
                  +91 63001 07759
                </a>.
              </p>
            </div>
          </div>
        )}

        {/* Order Details View */}
        {order && (
          <div className="space-y-6">
            {/* Status Summary Banner */}
            <div className="bg-white border border-[#E7E5DD] rounded-2xl p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E5DD]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-[#0B0B0D] tracking-wider">
                      {order.orderRef}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono ${
                        order.fulfilmentStatus === 'DELIVERED'
                          ? 'bg-[#DCFCE7] text-[#15803D]'
                          : order.fulfilmentStatus === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : order.fulfilmentStatus === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-[#F6EEDF] text-[#9A7328]'
                      }`}
                    >
                      {order.fulfilmentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6E7B] mt-1 font-sans">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-2">
                  <div>
                    <p className="text-xs text-[#6B6E7B]">Total Order Amount</p>
                    <p className="text-lg font-bold font-mono text-[#0B0B0D]">{formatINR(order.totalPaise)}</p>
                    <span className="text-[10px] text-[#6B6E7B] uppercase tracking-widest font-mono">
                      Payment: {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid (Razorpay)'} &bull; {order.paymentStatus}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setShowInvoice(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F3] hover:bg-[#F4F3ED] border border-[#E7E5DD] text-[#0B0B0D] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#C9A45C]" />
                      <span>GST Invoice</span>
                    </button>
                    <a
                      href={`https://wa.me/916300107759?text=${encodeURIComponent(
                        `Hi LYVEN Support, I am tracking order ${order.orderRef} and need assistance.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>WhatsApp Help</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Fulfillment Progress Timeline */}
              {order.fulfilmentStatus !== 'CANCELLED' ? (
                <div className="pt-8 pb-4">
                  <div className="grid grid-cols-4 relative">
                    {/* Connecting line */}
                    <div className="absolute top-4 left-[12%] right-[12%] h-0.5 bg-[#E7E5DD] -z-0" />

                    {[
                      { title: 'Confirmed', icon: CheckCircle2, idx: 0 },
                      { title: 'Processing', icon: Clock, idx: 1 },
                      { title: 'In Transit', icon: Truck, idx: 2 },
                      { title: 'Delivered', icon: Package, idx: 3 },
                    ].map((step) => {
                      const status = getStepStatus(step.idx, order.fulfilmentStatus);
                      const Icon = step.icon;
                      const isComplete = status === 'completed';
                      const isCurrent = status === 'current';

                      return (
                        <div key={step.title} className="flex flex-col items-center text-center relative z-10">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                              isComplete
                                ? 'bg-[#0B0B0D] text-white shadow-xs'
                                : isCurrent
                                ? 'bg-[#C9A45C] text-[#0B0B0D] ring-4 ring-[#C9A45C]/20 shadow-xs'
                                : 'bg-white border border-[#E7E5DD] text-gray-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-xs mt-3 font-semibold tracking-wide ${
                              isComplete || isCurrent ? 'text-[#0B0B0D]' : 'text-gray-400'
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="pt-6 text-center text-red-600 text-xs font-mono uppercase tracking-widest font-bold">
                  This order was cancelled.
                </div>
              )}

              {/* Courier Tracking Info if dispatched */}
              {order.trackingId && (
                <div className="mt-6 pt-4 border-t border-[#E7E5DD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#FAF8F3] p-4 rounded-xl">
                  <div>
                    <p className="text-[10px] text-[#6B6E7B] uppercase tracking-widest font-mono">Shipping Partner &amp; AWB</p>
                    <p className="text-xs font-mono font-bold text-[#0B0B0D] mt-0.5">
                      {order.courierName || 'BlueDart / Delhivery'} — {order.trackingId}
                    </p>
                  </div>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase tracking-wider text-[#0B0B0D] underline hover:text-[#C9A45C] font-semibold"
                    >
                      Track on Courier Portal &rarr;
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Delivery & Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Destination */}
              <div className="bg-white border border-[#E7E5DD] rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 text-[#6B6E7B]">
                  <MapPin className="w-4 h-4 text-[#C9A45C]" />
                  <h3 className="text-xs uppercase tracking-wider font-bold text-[#0B0B0D] font-mono">Shipping Destination</h3>
                </div>
                <div className="text-xs text-[#6B6E7B] space-y-1 font-sans">
                  {order.customer?.fullName && (
                    <p className="font-bold text-[#0B0B0D]">{order.customer.fullName}</p>
                  )}
                  {order.customer?.houseFlat && (
                    <p>{order.customer.houseFlat}, {order.customer.streetLocality}</p>
                  )}
                  <p>
                    {order.deliveryCity}, {order.deliveryState} — {order.deliveryPinCode}
                  </p>
                  <p className="text-[#15803D] pt-2 font-mono font-semibold">Verified for Pan-India Dispatch</p>
                </div>

                {order.fulfilmentStatus === 'CONFIRMED' && (
                  <div className="mt-4 pt-3 border-t border-[#E7E5DD] text-[11px] text-[#6B6E7B]">
                    <p className="mb-1 text-[#0B0B0D] font-semibold">Need to update shipping address?</p>
                    <a
                      href={`https://wa.me/916300107759?text=${encodeURIComponent(
                        `Hi LYVEN Support, I would like to request a change/cancellation for my confirmed order ${order.orderRef} before dispatch.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C9A45C] hover:underline font-bold"
                    >
                      Request modification before warehouse dispatch &rarr;
                    </a>
                  </div>
                )}
              </div>

              {/* Package Items */}
              <div className="bg-white border border-[#E7E5DD] rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 text-[#6B6E7B]">
                  <Package className="w-4 h-4 text-[#C9A45C]" />
                  <h3 className="text-xs uppercase tracking-wider font-bold text-[#0B0B0D] font-mono">Package Contents</h3>
                </div>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-[#E7E5DD] last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-[#0B0B0D]">{item.name}</p>
                        <p className="text-[#6B6E7B] font-mono text-[11px]">
                          Size: {item.size} &times; {item.quantity}
                        </p>
                      </div>
                      <p className="font-mono font-bold text-[#0B0B0D]">{formatINR(item.totalPricePaise)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tax Invoice Modal */}
            <TaxInvoiceModal
              order={order}
              isOpen={showInvoice}
              onClose={() => setShowInvoice(false)}
            />
          </div>
        )}

        {/* Brand note */}
        {!order && !searched && (
          <div className="mt-12 p-6 rounded-2xl bg-white border border-[#E7E5DD] text-center shadow-xs">
            <ShieldCheck className="w-8 h-8 text-[#C9A45C] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#0B0B0D] mb-1 font-sans">Pan-India Express Dispatch</h3>
            <p className="text-xs text-[#6B6E7B] max-w-md mx-auto leading-relaxed font-sans">
              Every LYVEN garment is inspected for stitching and print quality before dispatch from our Bengaluru warehouse. Live courier tracking is assigned upon dispatch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] bg-[#FAF8F3] flex flex-col items-center justify-center font-sans">
          <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono uppercase tracking-widest text-[#6B6E7B]">Loading Tracker...</p>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
