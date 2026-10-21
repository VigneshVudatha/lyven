'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Palette, Heart, ShoppingBag, User, Package, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/cart/store';
import { useWishlistStore } from '@/lib/wishlist/store';
import HeaderSearch from '@/components/layout/HeaderSearch';
import { cn } from '@/lib/utils';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getItemCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      {/* Midnight Black Header */}
      <header className="sticky top-0 z-50 w-full bg-[#0B0B0D] text-[#FAF8F3] border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-2.5 min-[360px]:px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-1.5 sm:gap-6 h-14 sm:h-18 min-w-0">
            {/* Left: Brand Logo */}
            <div className="flex items-center min-w-0 shrink-0">
              <Link
                href="/"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C] rounded-lg p-0.5 sm:p-1 flex items-center gap-1.5 sm:gap-3 group shrink-0"
                aria-label="LYVEN Homepage"
              >
                {/* Circular Badge with Champagne Gold Border */}
                <div className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 sm:w-10 sm:h-10 rounded-full border-1.5 sm:border-2 border-[#C9A45C] bg-[#161720] flex items-center justify-center p-1 sm:p-1.5 shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
                  <img
                    src="/brand/lyven-emblem-white.png"
                    alt="LYVEN Logo"
                    className="w-full h-full object-contain filter"
                  />
                </div>
                {/* Brand Name in Warm White with subtle Champagne glow */}
                <span className="text-sm min-[380px]:text-base sm:text-xl font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[#FAF8F3] font-sans group-hover:text-[#C9A45C] transition-colors whitespace-nowrap">
                  LYVEN
                </span>
              </Link>
            </div>

            {/* Center: Search Bar (Desktop) */}
            <div className="hidden sm:flex flex-1 justify-center max-w-md lg:max-w-lg mx-2 min-w-0">
              <HeaderSearch />
            </div>

            {/* Right: Icon Buttons Group (Palette, Heart, Cart, My Orders, User, Hamburger) */}
            <div className="flex items-center gap-0.5 min-[380px]:gap-1 sm:gap-2 shrink-0">
              {/* Custom Design Studio Palette Icon */}
              <Link
                href="/custom-design"
                title="Customize Your Own T-Shirt"
                className={cn(
                  'p-1.5 min-[380px]:p-2 sm:p-2.5 rounded-full text-neutral-300 hover:text-[#C9A45C] hover:bg-white/10 transition-colors relative flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]',
                  pathname === '/custom-design' && 'text-[#C9A45C] bg-[#C9A45C]/15'
                )}
                aria-label="Custom Design Studio"
              >
                <Palette className="w-4 h-4 min-[380px]:w-[18px] min-[380px]:h-[18px] sm:w-5 sm:h-5 stroke-[1.75]" />
              </Link>

              {/* Wishlist Heart Icon */}
              <Link
                href="/wishlist"
                title="Saved Wishlist"
                className={cn(
                  'p-1.5 min-[380px]:p-2 sm:p-2.5 rounded-full text-neutral-300 hover:text-[#C9A45C] hover:bg-white/10 transition-colors relative flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]',
                  pathname === '/wishlist' && 'text-[#C9A45C] bg-[#C9A45C]/15'
                )}
                aria-label={`Wishlist, ${mounted ? wishlistCount : 0} items`}
              >
                <Heart className="w-4 h-4 min-[380px]:w-[18px] min-[380px]:h-[18px] sm:w-5 sm:h-5 stroke-[1.75]" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#C9A45C] text-[#0B0B0D] text-[9px] sm:text-[10px] font-mono font-bold flex items-center justify-center pointer-events-none">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag / Cart Icon */}
              <Link
                href="/cart"
                title="Shopping Bag"
                className={cn(
                  'p-1.5 min-[380px]:p-2 sm:p-2.5 rounded-full text-neutral-300 hover:text-[#C9A45C] hover:bg-white/10 transition-colors relative flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]',
                  pathname === '/cart' && 'text-[#C9A45C] bg-white/15'
                )}
                aria-label={`Shopping bag, ${mounted ? cartCount : 0} items`}
              >
                <ShoppingBag className="w-4 h-4 min-[380px]:w-[18px] min-[380px]:h-[18px] sm:w-5 sm:h-5 stroke-[1.75]" />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#C9A45C] text-[#0B0B0D] text-[9px] sm:text-[10px] font-mono font-bold flex items-center justify-center pointer-events-none">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* My Orders Icon Button */}
              <Link
                href="/my-orders"
                title="My Orders"
                className={cn(
                  'p-1.5 min-[380px]:p-2 sm:p-2.5 rounded-full text-neutral-300 hover:text-[#C9A45C] hover:bg-white/10 transition-colors relative flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]',
                  pathname === '/my-orders' && 'text-[#C9A45C] bg-white/15'
                )}
                aria-label="My Orders"
              >
                <Package className="w-4 h-4 min-[380px]:w-[18px] min-[380px]:h-[18px] sm:w-5 sm:h-5 stroke-[1.75]" />
              </Link>

              {/* User Account Icon */}
              <Link
                href="/account"
                title="Account"
                className={cn(
                  'p-1.5 min-[380px]:p-2 sm:p-2.5 rounded-full text-neutral-300 hover:text-[#C9A45C] hover:bg-white/10 transition-colors relative flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]',
                  pathname === '/account' && 'text-[#C9A45C] bg-white/15'
                )}
                aria-label="Account"
              >
                <User className="w-4 h-4 min-[380px]:w-[18px] min-[380px]:h-[18px] sm:w-5 sm:h-5 stroke-[1.75]" />
              </Link>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-1.5 min-[380px]:p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 relative flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? (
                  <X className="w-4 h-4 min-[380px]:w-[18px] min-[380px]:h-[18px] sm:w-5 sm:h-5" />
                ) : (
                  <Menu className="w-4 h-4 min-[380px]:w-[18px] min-[380px]:h-[18px] sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Input Row */}
          <div className="sm:hidden pb-2.5">
            <HeaderSearch />
          </div>
        </div>

        {/* Mobile Drawer Menu inside Midnight Header */}
        {menuOpen && (
          <nav 
            className="md:hidden border-t border-white/10 bg-[#0B0B0D] py-5 px-4 max-h-[calc(100dvh-120px)] overflow-y-auto shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold uppercase tracking-wider">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="px-3.5 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-[#FAF8F3] text-center hover:bg-white/10 active:scale-98 transition-all"
              >
                Home
              </Link>
              <Link
                href="/shop"
                onClick={() => setMenuOpen(false)}
                className="px-3.5 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-[#FAF8F3] text-center hover:bg-white/10 active:scale-98 transition-all"
              >
                Shop All Drops
              </Link>
              <Link
                href="/custom-design"
                onClick={() => setMenuOpen(false)}
                className="col-span-2 px-4 py-3 rounded-xl bg-[#C9A45C]/20 border border-[#C9A45C]/40 text-[#C9A45C] font-bold text-center hover:bg-[#C9A45C]/30 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Palette className="w-4 h-4" />
                <span>Customize Your Own Design</span>
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="px-3.5 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-[#FAF8F3] text-center hover:bg-white/10 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <Heart className="w-4 h-4 text-[#C9A45C]" />
                <span>Wishlist ({mounted ? wishlistCount : 0})</span>
              </Link>
              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                className="px-3.5 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-[#FAF8F3] text-center hover:bg-white/10 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Bag ({mounted ? cartCount : 0})</span>
              </Link>
              <Link
                href="/my-orders"
                onClick={() => setMenuOpen(false)}
                className="px-3.5 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-[#FAF8F3] text-center hover:bg-white/10 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <Package className="w-4 h-4 text-[#C9A45C]" />
                <span>My Orders</span>
              </Link>
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="px-3.5 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-[#FAF8F3] text-center hover:bg-white/10 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <User className="w-4 h-4 text-[#C9A45C]" />
                <span>Account</span>
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Backdrop for Mobile Drawer */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden" 
          onClick={() => setMenuOpen(false)} 
          aria-hidden="true"
        />
      )}
    </>
  );
}
