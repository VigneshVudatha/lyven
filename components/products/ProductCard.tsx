'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist/store';
import { formatPriceINR } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const toggleItem = useWishlistStore((s) => s.toggleItem);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasImage = product.images && product.images.length > 0;
  const wishlisted = mounted && isInWishlist;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  return (
    <div className="group relative bg-white border border-[#E7E5DD] hover:border-[#C9A45C]/60 rounded-xl sm:rounded-[18px] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col w-full h-full">
      {/* Product Image Stage in Subtle Warm Cream */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/5] bg-[#F4F3ED] overflow-hidden flex items-center justify-center p-2.5 sm:p-4 select-none shrink-0"
        aria-label={`View ${product.name}`}
      >
        {hasImage ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest">LYVEN Studio</span>
          </div>
        )}

        {/* Small & Accessible Floating Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full transition-all duration-200 z-10 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C] ${
            wishlisted
              ? 'bg-[#F6EEDF] text-[#C9A45C] shadow-xs scale-105'
              : 'bg-white/90 hover:bg-white text-gray-400 hover:text-[#C9A45C] shadow-2xs hover:scale-110'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
              wishlisted ? 'fill-[#C9A45C] text-[#C9A45C]' : ''
            }`}
          />
        </button>
      </Link>

      {/* Product Information */}
      <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-xs sm:text-base font-bold text-[#0B0B0D] group-hover:text-[#C9A45C] transition-colors line-clamp-2 font-sans leading-snug">
            {product.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-[#6B6E7B] mt-0.5 sm:mt-1 truncate font-sans">
            {product.fit} · 240 GSM
          </p>
        </Link>

        {/* Price & In-Stock Status */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-[#E7E5DD] flex items-center justify-between gap-1">
          <span className="text-xs sm:text-base font-extrabold text-[#0B0B0D] font-mono shrink-0">
            {formatPriceINR(product.pricePaise)}
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono text-[#15803D] font-bold bg-[#DCFCE7] px-1.5 sm:px-2.5 py-0.5 rounded-full shrink-0">
            In Stock
          </span>
        </div>
      </div>
    </div>
  );
}
