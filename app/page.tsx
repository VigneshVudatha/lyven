import Link from 'next/link';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import ArchitecturalHero from '@/components/home/ArchitecturalHero';
import ProductCard from '@/components/products/ProductCard';
import { getProducts } from '@/lib/products/data';

export default function HomePage() {
  const products = getProducts();

  return (
    <div className="bg-[#FAF8F3] text-[#0B0B0D] min-h-screen relative font-sans">
      {/* ─── 1. Editorial Architectural Hero Panel ───────────────────────── */}
      <ArchitecturalHero />

      {/* ─── 2. New Arrivals on Warm Ivory Background ────────────────────── */}
      <section className="py-6 sm:py-14 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-10 max-w-5xl mx-auto">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#C9A45C] font-bold block mb-1">
              CURRENT ROSTER
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B0B0D] font-sans">
              New Arrivals
            </h2>
          </div>

          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-[#0B0B0D] hover:text-[#C9A45C] transition-colors flex items-center gap-1.5 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C] rounded-md px-2 py-1"
          >
            <span>View all drops</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* 2-Column Responsive Grid for Current Roster on Mobile (12px gap) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── 3. Custom Design Studio Premium Rounded Panel ───────────────── */}
      <section className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-[20px] md:rounded-[32px] bg-gradient-to-br from-[#161720] via-[#0B0B0D] to-[#12131A] text-[#FAF8F3] p-8 sm:p-12 lg:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-[#C9A45C]/25 relative overflow-hidden">
          {/* Subtle champagne radial accent */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_rgba(201,164,92,0.1),_transparent_70%)] pointer-events-none"
          />

          <div className="max-w-xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#C9A45C] uppercase tracking-widest font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bespoke Apparel Drop</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#FAF8F3] font-sans leading-tight">
              Have your own artwork or fandom graphic?
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1AA] mt-3 font-sans leading-relaxed">
              Upload your graphic, select your garment silhouette, and share your vision directly with our studio on WhatsApp for live preview and custom printing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto shrink-0 relative z-10">
            {/* Primary CTA: Champagne Gold with Dark Text */}
            <Link
              href="/custom-design"
              className="px-7 py-3.5 rounded-full bg-[#C9A45C] hover:bg-[#B8934B] text-[#0B0B0D] font-extrabold text-xs sm:text-sm uppercase tracking-wider text-center transition-all shadow-[0_4px_20px_rgba(201,164,92,0.3)] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
            >
              Open Design Studio
            </Link>
            <a
              href="https://wa.me/916300107759?text=Hi%20LYVEN!%20I%20have%20a%20custom%20design%20to%20print."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 4. Honest Brand Specifications Strip ───────────────────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E7E5DD]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="p-5 rounded-[18px] bg-white border border-[#E7E5DD] shadow-2xs hover:border-[#C9A45C]/50 transition-colors">
            <span className="text-base sm:text-lg font-bold text-[#0B0B0D] block font-mono">240 GSM</span>
            <span className="text-xs text-[#6B6E7B] mt-0.5 block font-sans">French Terry Combed Cotton</span>
          </div>
          <div className="p-5 rounded-[18px] bg-white border border-[#E7E5DD] shadow-2xs hover:border-[#C9A45C]/50 transition-colors">
            <span className="text-base sm:text-lg font-bold text-[#0B0B0D] block font-mono">Flat ₹400</span>
            <span className="text-xs text-[#6B6E7B] mt-0.5 block font-sans">Honest Direct Pricing</span>
          </div>
          <div className="p-5 rounded-[18px] bg-white border border-[#E7E5DD] shadow-2xs hover:border-[#C9A45C]/50 transition-colors">
            <span className="text-base sm:text-lg font-bold text-[#0B0B0D] block font-mono">Boxy Cut</span>
            <span className="text-xs text-[#6B6E7B] mt-0.5 block font-sans">Drop-Shoulder Streetwear</span>
          </div>
          <div className="p-5 rounded-[18px] bg-white border border-[#E7E5DD] shadow-2xs hover:border-[#C9A45C]/50 transition-colors">
            <span className="text-base sm:text-lg font-bold text-[#0B0B0D] block font-mono">Bio-Washed</span>
            <span className="text-xs text-[#6B6E7B] mt-0.5 block font-sans">Soft Handfeel &amp; Pre-Shrunk</span>
          </div>
        </div>
      </section>
    </div>
  );
}
