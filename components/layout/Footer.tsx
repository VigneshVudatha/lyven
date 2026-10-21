import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B0B0D] border-t border-white/10 text-[#A1A1AA] py-14 sm:py-18 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full border border-[#C9A45C] bg-[#161720] flex items-center justify-center p-1">
                <img
                  src="/brand/lyven-emblem-white.png"
                  alt="LYVEN Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-lg font-black tracking-[0.2em] text-[#FAF8F3] uppercase font-sans">
                LYVEN
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-sm font-sans">
              Heavyweight 240 GSM fan-merch tees for movies, cricket icons &amp; custom statement prints.
              <br />
              <span className="text-[#C9A45C] font-semibold">Wear your statement.</span>
            </p>
          </div>

          {/* Column 2: SHOP */}
          <div>
            <h3 className="text-xs font-bold text-[#C9A45C] uppercase tracking-[0.18em] mb-4 font-mono">
              SHOP
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/" className="text-[#D4D4D8] hover:text-[#FAF8F3] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-[#D4D4D8] hover:text-[#FAF8F3] transition-colors">
                  All T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-[#D4D4D8] hover:text-[#C9A45C] transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/custom-design" className="text-[#C9A45C] hover:underline transition-colors font-medium">
                  Custom Design Studio
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-[#D4D4D8] hover:text-[#FAF8F3] transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/my-orders" className="text-[#D4D4D8] hover:text-[#C9A45C] transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-[#D4D4D8] hover:text-[#FAF8F3] transition-colors">
                  Customer Account
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-[#D4D4D8] hover:text-[#FAF8F3] transition-colors">
                  Track Shipment
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: CONNECT */}
          <div>
            <h3 className="text-xs font-bold text-[#C9A45C] uppercase tracking-[0.18em] mb-4 font-mono">
              CONNECT
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <a
                  href="https://wa.me/916300107759?text=Hi%20LYVEN!%20I%20want%20to%20order%20or%20inquire%20about%20t-shirts."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-[#D4D4D8] hover:text-[#25D366] transition-colors group"
                >
                  <MessageCircle size={17} className="text-[#25D366] shrink-0 group-hover:scale-110 transition-transform fill-current" />
                  <span>WhatsApp Concierge</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/lyven.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-[#D4D4D8] hover:text-[#F43F5E] transition-colors group"
                >
                  <svg className="w-4 h-4 text-[#F43F5E] fill-none stroke-current stroke-2 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  <span>Instagram @lyven.in</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717A] gap-2 font-sans">
          <p>© {new Date().getFullYear()} LYVEN Apparel. All rights reserved.</p>
          <p className="font-mono text-[11px] text-[#A1A1AA]">
            100% Combed Cotton · 240 GSM French Terry
          </p>
        </div>
      </div>
    </footer>
  );
}
