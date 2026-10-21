'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  ShoppingBag,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatINR } from '@/lib/utils';
import type { Order } from '@/types';

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomerOrders() {
      setLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);

        const res = await fetch('/api/orders/my-orders');
        const data = await res.json();

        if (res.ok && data.success) {
          setOrders(data.data || []);
        } else if (res.status === 401) {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomerOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'DELIVERED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D]">
          <CheckCircle2 className="w-3 h-3" />
          <span>Delivered</span>
        </span>
      );
    }
    if (s === 'SHIPPED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
          <Truck className="w-3 h-3" />
          <span>In Transit</span>
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-red-800">
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F6EEDF] text-[#9A7328]">
        <Clock className="w-3 h-3" />
        <span>{s === 'PROCESSING' ? 'Processing' : 'Confirmed'}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#0B0B0D] py-8 sm:py-14 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6E7B] hover:text-[#0B0B0D] font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Account</span>
          </Link>

          <Link
            href="/track"
            className="text-xs text-[#C9A45C] hover:text-[#9A7328] font-mono font-semibold uppercase tracking-wider transition-colors"
          >
            Track by Reference &rarr;
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-1">
            CUSTOMER ORDER ARCHIVE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B0B0D] tracking-tight">
            My Orders
          </h1>
          <p className="text-[#6B6E7B] text-xs sm:text-sm mt-1.5 leading-relaxed">
            Review your order history, fulfillment progress, and live dispatch tracking.
          </p>
        </div>

        {/* 1. Loading State */}
        {loading && (
          <div className="bg-white border border-[#E7E5DD] rounded-2xl p-12 text-center shadow-xs">
            <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono uppercase tracking-widest text-[#6B6E7B]">
              Loading your order history...
            </p>
          </div>
        )}

        {/* 2. Authentication Required State */}
        {!loading && isAuthenticated === false && (
          <div className="bg-white border border-[#E7E5DD] rounded-2xl p-6 sm:p-10 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F3] border border-[#E7E5DD] flex items-center justify-center mx-auto mb-4 text-[#C9A45C]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0B0B0D] mb-2">
              Sign In to View Orders
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6E7B] max-w-md mx-auto mb-6 leading-relaxed">
              Please sign into your LYVEN account to view your past orders, delivery updates, and tax invoices.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/account?redirect=/my-orders"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0B0B0D] text-[#FAF8F3] text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xs"
              >
                Log In to Account
              </Link>
              <Link
                href="/track"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FAF8F3] hover:bg-[#F4F3ED] border border-[#E7E5DD] text-[#0B0B0D] text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Track Guest Order
              </Link>
            </div>
          </div>
        )}

        {/* 3. Empty State (Signed in, 0 orders) */}
        {!loading && isAuthenticated === true && orders.length === 0 && (
          <div className="bg-white border border-[#E7E5DD] rounded-2xl p-8 sm:p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F3] border border-[#E7E5DD] flex items-center justify-center mx-auto mb-4 text-[#C9A45C]">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0B0B0D] mb-2">
              No Orders Yet
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6E7B] max-w-md mx-auto mb-6 leading-relaxed">
              You haven&apos;t placed any orders with this account yet. Discover our signature heavyweight streetwear drops and custom tees.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B0B0D] text-[#FAF8F3] text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <span>Explore Drops</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/custom-design"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#FAF8F3] border border-[#E7E5DD] text-[#0B0B0D] text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <span>Custom Design Studio</span>
              </Link>
            </div>
          </div>
        )}

        {/* 4. Orders List */}
        {!loading && isAuthenticated === true && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#E7E5DD] rounded-2xl p-5 sm:p-7 shadow-xs hover:border-[#C9A45C]/40 transition-colors"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E5DD]">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-sm sm:text-base font-bold text-[#0B0B0D] tracking-wider">
                        {order.orderRef}
                      </span>
                      {getStatusBadge(order.fulfilmentStatus)}
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#6B6E7B] mt-1 font-sans">
                      Placed on{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-base sm:text-lg font-bold font-mono text-[#0B0B0D]">
                      {formatINR(order.totalPaise)}
                    </p>
                    <span className="text-[10px] text-[#6B6E7B] font-mono uppercase tracking-wider block">
                      {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid (Online)'} &bull;{' '}
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="py-4 space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 sm:gap-4 py-1.5"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#FAF8F3] border border-[#E7E5DD] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-neutral-400" />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-[#0B0B0D] truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-[#6B6E7B] font-mono mt-0.5">
                          Size: <span className="font-bold text-[#0B0B0D]">{item.size}</span> &bull;
                          Qty: <span className="font-bold text-[#0B0B0D]">{item.quantity}</span>
                        </p>
                      </div>

                      {/* Item Price */}
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-bold font-mono text-[#0B0B0D]">
                          {formatINR(item.totalPricePaise)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer & Actions */}
                <div className="pt-4 border-t border-[#E7E5DD] flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-[#6B6E7B] font-sans">
                    Deliver to:{' '}
                    <span className="font-medium text-[#0B0B0D]">
                      {order.customer.city}, {order.customer.state} ({order.customer.pinCode})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/track?ref=${encodeURIComponent(order.orderRef)}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B0B0D] text-[#FAF8F3] hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#C9A45C]" />
                      <span>Track Order</span>
                    </Link>

                    <a
                      href={`https://wa.me/916300107759?text=${encodeURIComponent(
                        `Hi LYVEN Support, I am inquiring about my order ${order.orderRef}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-colors"
                      title="WhatsApp Support"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Help</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
