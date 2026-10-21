'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/cart/store';
import { formatPriceINR } from '@/lib/utils';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotalPaise = useCartStore((s) => s.getSubtotalPaise());
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-[#FAF8F3] min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs font-mono uppercase tracking-widest text-[#6B6E7B]">Loading Bag...</p>
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
            Your Bag is Empty
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6E7B] mt-2 mb-8 leading-relaxed font-sans">
            Looks like you haven&apos;t added any drops to your bag yet. Explore our oversized streetwear tees.
          </p>
          <Link
            href="/shop"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#0B0B0D] hover:bg-neutral-800 text-[#FAF8F3] font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
          >
            <span>Explore Drops</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-6 sm:py-12 px-3.5 sm:px-6 lg:px-8 pb-28 sm:pb-16 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-[#E7E5DD] mb-6 sm:mb-8">
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-1">
              REVIEW ORDER
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B0B0D] tracking-tight font-sans">
              Shopping Bag
            </h1>
          </div>
          <span className="text-xs font-mono font-semibold text-[#6B6E7B] bg-white border border-[#E7E5DD] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Cart items column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-3.5 sm:space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="bg-white border border-[#E7E5DD] rounded-2xl p-3.5 sm:p-5 flex gap-3 sm:gap-6 shadow-xs hover:border-[#C9A45C]/40 transition-colors"
              >
                {/* Image Stage */}
                <Link
                  href={`/products/${item.slug}`}
                  className="shrink-0 w-20 h-24 sm:w-28 sm:h-32 bg-[#F4F3ED] rounded-xl overflow-hidden flex items-center justify-center p-1.5 sm:p-2 border border-[#E7E5DD]/60"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag size={20} />
                    </div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-sm sm:text-base font-bold text-[#0B0B0D] hover:text-[#C9A45C] transition-colors line-clamp-1 font-sans"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 cursor-pointer"
                        aria-label={`Remove ${item.name} from bag`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="mt-0.5 sm:mt-1 flex items-center gap-1.5 text-xs text-[#6B6E7B] font-mono">
                      <span>Size: <strong className="text-[#0B0B0D]">{item.size}</strong></span>
                      {item.color && (
                        <>
                          <span>·</span>
                          <span>{item.color}</span>
                        </>
                      )}
                    </div>

                    <p className="mt-1.5 sm:mt-2 text-sm sm:text-base font-bold font-mono text-[#0B0B0D]">
                      {formatPriceINR(item.pricePaise)}
                    </p>
                  </div>

                  {/* Quantity Controller & Line Total */}
                  <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3 border-t border-[#E7E5DD] flex items-center justify-between">
                    <div className="flex items-center border border-[#E7E5DD] rounded-xl overflow-hidden bg-[#FAF8F3]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 sm:p-2 text-[#0B0B0D] hover:bg-[#E7E5DD] transition-colors disabled:opacity-30 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2.5 sm:px-3.5 text-xs font-bold font-mono text-[#0B0B0D] min-w-[28px] sm:min-w-[32px] text-center border-x border-[#E7E5DD] bg-white py-1 sm:py-1.5">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= 5}
                        className="p-1.5 sm:p-2 text-[#0B0B0D] hover:bg-[#E7E5DD] transition-colors disabled:opacity-30 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="text-xs sm:text-sm font-extrabold font-mono text-[#0B0B0D]">
                      {formatPriceINR(item.pricePaise * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white border border-[#E7E5DD] rounded-2xl p-4 sm:p-6 shadow-xs sticky top-24 space-y-4 sm:space-y-5">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-1">
                  PAYMENT SUMMARY
                </span>
                <h2 className="text-lg font-bold text-[#0B0B0D] font-sans">
                  Order Summary
                </h2>
              </div>

              <div className="space-y-3 text-xs sm:text-sm pt-2 border-t border-[#E7E5DD]">
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

              <div className="border-t border-[#E7E5DD] pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[#0B0B0D] text-sm">Estimated Total</span>
                  <span className="font-black text-xl sm:text-2xl font-mono text-[#0B0B0D]">
                    {formatPriceINR(subtotalPaise)}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6E7B] mt-1 font-mono">
                  Inclusive of all taxes
                </p>
              </div>

              <div className="pt-2 space-y-2.5">
                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#0B0B0D] hover:bg-neutral-800 text-[#FAF8F3] font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  href="/shop"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#FAF8F3] hover:bg-[#F4F3ED] text-[#0B0B0D] border border-[#E7E5DD] font-medium text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Continue Shopping</span>
                </Link>
              </div>

              {/* Assurance note */}
              <div className="pt-4 border-t border-[#E7E5DD] flex items-center justify-center gap-2 text-[11px] text-[#6B6E7B] font-mono">
                <ShieldCheck size={14} className="text-[#15803D]" />
                <span>SSL Encrypted &amp; Verified Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
