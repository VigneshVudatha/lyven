'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import type { Product } from '@/types';

interface ShopClientProps {
  initialProducts: Product[];
  initialQuery?: string;
}

export default function ShopClient({ initialProducts, initialQuery = '' }: ShopClientProps) {
  const [search, setSearch] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.pricePaise - b.pricePaise);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.pricePaise - a.pricePaise);
    }

    return list;
  }, [initialProducts, search, sortBy]);

  const hasActiveFilters = search.trim() !== '' || sortBy !== 'featured';

  const resetFilters = () => {
    setSearch('');
    setSortBy('featured');
  };

  return (
    <div className="bg-[#FAF8F3] text-[#0B0B0D] min-h-screen pb-28 sm:pb-24 font-sans">
      {/* ─── Header Banner ──────────────────────────────────────────────── */}
      <section className="py-6 sm:py-12 border-b border-[#E7E5DD] bg-white">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-1">
            Collection Roster
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B0B0D] font-sans">
            All T-Shirts &amp; Graphic Drops
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#6B6E7B] max-w-xl font-sans leading-relaxed">
            240 GSM combed French Terry cotton. Handcrafted graphic tees with a relaxed drop-shoulder boxy cut.
          </p>
        </div>
      </section>

      {/* ─── Filter & Search Bar ────────────────────────────────────────── */}
      <section className="py-3 sm:py-4 border-b border-[#E7E5DD] bg-[#FAF8F3] sticky top-[106px] sm:top-16 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search drops..."
                className="w-full bg-white border border-[#E7E5DD] rounded-full pl-9 pr-8 py-2 text-xs text-[#0B0B0D] placeholder-gray-400 focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter: All Products */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSearch('')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#0B0B0D] text-[#FAF8F3] shadow-xs cursor-pointer transition-all hover:bg-neutral-800"
                title="View all products"
              >
                All Products ({filteredProducts.length})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#6B6E7B] uppercase hidden sm:inline font-mono">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#E7E5DD] rounded-xl px-3 py-1.5 text-xs text-[#0B0B0D] focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C] cursor-pointer"
              >
                <option value="featured">Featured Drops</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-2.5 py-1 text-xs text-[#C9A45C] hover:underline font-bold cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Product Results Grid ────────────────────────────────────────── */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 text-xs text-[#6B6E7B]">
            <span>
              Showing <strong className="text-[#0B0B0D]">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'item' : 'items'}
            </span>
            <span className="text-[#15803D] font-semibold bg-[#DCFCE7] px-2.5 py-0.5 rounded-full font-mono">
              ✓ Direct Shipping &amp; Cash on Delivery
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4 bg-white border border-[#E7E5DD] rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
              <p className="text-base font-bold text-[#0B0B0D]">No matching products found</p>
              <p className="text-xs text-[#6B6E7B] leading-relaxed">
                Try searching for &quot;Virat&quot; or &quot;DUDE&quot;, or clear your active search query.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#0B0B0D] text-[#FAF8F3] hover:bg-neutral-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
