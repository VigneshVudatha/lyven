'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import type { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';

interface SearchClientProps {
  initialProducts: Product[];
}

export default function SearchClient({ initialProducts = [] }: SearchClientProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredProducts = useMemo(() => {
    let list = initialProducts;

    if (categoryFilter !== 'ALL') {
      list = list.filter((p) => p.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [searchTerm, categoryFilter, initialProducts]);

  return (
    <div className="bg-[#FAF8F3] text-[#0B0B0D] min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Search Header Banner */}
        <div className="max-w-xl mx-auto text-center mb-8">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-1">
            Product Discovery
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B0B0D] font-sans">
            Search Drops &amp; Custom Tees
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6E7B] mt-1 font-sans">
            Search our fan-merch drops or custom typography designs.
          </p>

          {/* Search Input Bar */}
          <div className="relative mt-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search t-shirts..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E7E5DD] focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C] rounded-full text-sm text-[#0B0B0D] focus:outline-none transition-colors shadow-2xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            {['ALL', 'Cricket', 'Graphic', 'Custom'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#0B0B0D] text-[#FAF8F3]'
                    : 'bg-white border border-[#E7E5DD] text-[#6B6E7B] hover:text-[#0B0B0D]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between py-3 border-b border-[#E7E5DD] mb-6 text-xs text-[#6B6E7B]">
          <span>
            Found <strong className="text-[#0B0B0D]">{filteredProducts.length}</strong> items
            {searchTerm && <span> for &ldquo;{searchTerm}&rdquo;</span>}
          </span>
          <Link
            href="/custom-design"
            className="text-[#C9A45C] hover:underline flex items-center gap-1 font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span>Customize Any Graphic &rarr;</span>
          </Link>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-[#E7E5DD] rounded-2xl p-8 max-w-md mx-auto shadow-sm">
            <Sparkles className="w-8 h-8 text-[#C9A45C] mx-auto mb-2" />
            <h3 className="text-base font-bold text-[#0B0B0D] font-sans">
              No matching ready drops found
            </h3>
            <p className="text-xs text-[#6B6E7B] mt-1 leading-relaxed font-sans">
              We can print any custom artwork or statement on 240 GSM heavy cotton in our Studio.
            </p>
            <Link
              href="/custom-design"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-[#C9A45C] hover:bg-[#B8934B] text-[#0B0B0D] font-extrabold text-xs transition-colors shadow-xs"
            >
              <span>Open Custom Design Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
