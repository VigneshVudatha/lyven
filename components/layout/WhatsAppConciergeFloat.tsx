'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppConciergeFloat() {
  const pathname = usePathname();

  // Hide on custom design studio to avoid duplicate WhatsApp CTAs
  if (pathname === '/custom-design') return null;

  const isCheckoutPage = pathname === '/checkout';

  return (
    <div
      className={`fixed z-30 group items-center transition-all duration-300 ${
        isCheckoutPage
          ? 'hidden sm:flex bottom-6 right-6'
          : 'flex bottom-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] right-3.5 sm:bottom-6 sm:right-6'
      }`}
    >
      {/* Non-overlapping hover label */}
      <span className="hidden group-hover:inline-block mr-3 px-3 py-1.5 rounded-full bg-[#0B0B0D] text-[#FAF8F3] text-xs font-mono font-medium shadow-lg transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Order on WhatsApp
      </span>

      {/* Floating WhatsApp Action Button with mobile safe-area support */}
      <a
        href="https://wa.me/916300107759?text=Hi%20LYVEN!%20I'm%20browsing%20your%20t-shirts%20and%20would%20like%20to%20order."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with LYVEN Concierge on WhatsApp"
        className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-[0_4px_25px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
      </a>
    </div>
  );
}
