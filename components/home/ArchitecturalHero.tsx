'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function ArchitecturalHero() {
  return (
    <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-2 sm:pt-6 pb-3 sm:pb-6">
      {/* Premium Rounded Editorial Hero Panel */}
      <div className="relative rounded-[20px] md:rounded-[32px] overflow-hidden bg-gradient-to-b from-[#161720] via-[#0B0B0D] to-[#08080A] border border-[#C9A45C]/25 shadow-[0_20px_50px_rgba(0,0,0,0.35)] px-4 sm:px-10 lg:px-16 py-8 sm:py-16 lg:py-20 text-center flex flex-col items-center justify-center transition-all">
        {/* Subtle Ambient Radial Champagne Glow */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(201,164,92,0.12),_transparent_70%)]" 
        />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center w-full">
          {/* Prominent Geometric Winged "V" Emblem */}
          <div className="flex flex-col items-center justify-center transition-transform duration-300 hover:scale-[1.03]">
            <div className="relative w-24 sm:w-36 md:w-44 aspect-[594/420] flex items-center justify-center">
              <Image
                src="/brand/lyven-emblem-transparent.png"
                alt="LYVEN Official Emblem"
                width={594}
                height={420}
                priority
                className="w-full h-auto object-contain drop-shadow-[0_10px_35px_rgba(201,164,92,0.3)]"
              />
            </div>
          </div>

          {/* Brand Title: LYVEN in Solid White */}
          <h1 className="mt-3 sm:mt-5 text-3xl sm:text-5xl md:text-7xl font-black tracking-[0.2em] sm:tracking-[0.22em] uppercase text-white font-sans drop-shadow-md">
            LYVEN
          </h1>

          {/* Tagline: Wear Your Story. */}
          <p className="mt-1.5 sm:mt-3 text-xs sm:text-base md:text-lg font-mono uppercase tracking-[0.22em] sm:tracking-[0.25em] text-[#C9A45C] font-bold">
            Wear Your Story.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 w-full sm:w-auto">
            {/* Primary CTA: Champagne Gold with Dark Text */}
            <Link
              href="/shop"
              className="w-full sm:w-auto px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#C9A45C] hover:bg-[#B8934B] text-[#0B0B0D] font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(201,164,92,0.3)] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
            >
              <span>Shop Collection</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </Link>

            {/* Secondary CTA: Frosted Button */}
            <Link
              href="/custom-design"
              className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-[#FAF8F3] border border-white/20 hover:border-[#C9A45C]/50 font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
            >
              <span>Customize Your Design</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
