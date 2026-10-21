'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist/store';
import { useCartStore } from '@/lib/cart/store';
import { formatPriceINR } from '@/lib/utils';

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMoveToCart = (item: (typeof items)[0]) => {
    addItem({
      productId: item.id,
      variantId: `var_${item.slug}_l`,
      sku: `LYV-${item.slug.toUpperCase()}-L`,
      name: item.name,
      slug: item.slug,
      pricePaise: item.pricePaise,
      size: 'L',
      color: 'Jet Black',
      image: item.image,
      quantity: 1,
    });
    removeItem(item.id);
  };

  if (!mounted) {
    return (
      <div className="bg-[#FAF8F3] min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs font-mono uppercase tracking-widest text-[#6B6E7B]">Loading Wishlist...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F3] text-[#0B0B0D] min-h-screen py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8 pb-28 sm:pb-16 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E7E5DD] mb-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-1">
              Personal Vault
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B0B0D] font-sans">
              Your Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6E7B] mt-1 font-sans">
              {items.length} {items.length === 1 ? 'saved piece' : 'saved pieces'}
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="text-xs text-[#6B6E7B] hover:text-[#0B0B0D] transition-colors self-start sm:self-auto underline cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-white border border-[#E7E5DD] rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
            <Heart className="w-12 h-12 text-[#C9A45C]/40 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-[#0B0B0D] font-sans">
              Your wishlist is empty
            </h2>
            <p className="text-xs text-[#6B6E7B] mt-1 leading-relaxed font-sans">
              Explore our drops or design your custom t-shirt in our studio.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0B0B0D] hover:bg-neutral-800 text-[#FAF8F3] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Browse Drops</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/custom-design"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#C9A45C] hover:bg-[#B8934B] text-[#0B0B0D] font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0B0B0D]" />
                <span>Custom Studio</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E7E5DD] rounded-2xl overflow-hidden flex flex-col group hover:shadow-md transition-all hover:border-[#C9A45C]/70"
              >
                {/* Thumbnail */}
                <Link
                  href={`/products/${item.slug}`}
                  className="relative aspect-[4/5] bg-[#F4F3ED] overflow-hidden flex items-center justify-center p-4 select-none"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeItem(item.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-[#F6EEDF] text-gray-400 hover:text-[#C9A45C] shadow-2xs transition-colors cursor-pointer"
                    aria-label={`Remove ${item.name} from wishlist`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Link>

                {/* Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-bold text-[#0B0B0D] group-hover:text-[#C9A45C] transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-1 text-sm font-extrabold font-mono text-[#0B0B0D]">
                      {formatPriceINR(item.pricePaise)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-[#E7E5DD] space-y-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(item)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#0B0B0D] text-[#FAF8F3] font-semibold text-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move To Bag</span>
                    </button>

                    <a
                      href={`https://wa.me/916300107759?text=${encodeURIComponent(
                        `Hi LYVEN! I want to order this wishlist item: ${item.name} (${formatPriceINR(item.pricePaise)}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>Order on WhatsApp</span>
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
