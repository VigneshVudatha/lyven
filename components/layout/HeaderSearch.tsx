'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { SEED_PRODUCTS } from '@/lib/products/data';
import { formatPriceINR } from '@/lib/utils';
import type { Product } from '@/types';

export default function HeaderSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = SEED_PRODUCTS.filter((product) => {
      return (
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)
      );
    });
    setResults(filtered);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-full sm:max-w-md lg:max-w-lg">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search t-shirts..."
          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white/10 hover:bg-white/15 focus:bg-white/20 text-[#FAF8F3] placeholder-gray-400 rounded-full border border-white/15 focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C] focus:outline-none transition-all duration-200"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-0.5 text-gray-400 hover:text-white cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Live Dropdown Results */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-[#0B0B0D] border border-[#C9A45C]/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 bg-white/[0.04] border-b border-white/10 flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Results for &ldquo;{query}&rdquo;</span>
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={() => setIsOpen(false)}
              className="text-[#C9A45C] hover:underline flex items-center gap-1 font-semibold"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.06]">
            {results.length > 0 ? (
              results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3.5 p-3 hover:bg-white/[0.06] transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={product.images[0]?.url || '/products/virat-kohli-front.svg'}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#FAF8F3] truncate group-hover:text-[#C9A45C] transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">
                      {product.fit} · 240 GSM
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-[#C9A45C]">
                      {formatPriceINR(product.pricePaise)}
                    </div>
                    <span className="text-[9px] font-mono text-[#15803D] uppercase font-semibold">
                      In Stock
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center">
                <Sparkles className="w-6 h-6 text-[#C9A45C] mx-auto mb-2" />
                <p className="text-xs text-[#FAF8F3] font-medium">No ready drops found</p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Want something custom? Print any artwork in our Studio.
                </p>
                <Link
                  href="/custom-design"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-full bg-[#C9A45C] text-[#0B0B0D] text-xs font-mono font-bold hover:bg-[#B8934B] transition-all"
                >
                  Open Custom Design Studio <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
