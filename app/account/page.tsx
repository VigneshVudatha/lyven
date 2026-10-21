'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, ShieldCheck } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(
      'Notice: Regular shoppers can checkout without an account or order via WhatsApp. Redirecting to Order Tracker...'
    );
    setTimeout(() => {
      router.push('/track');
    }, 1200);
  };

  return (
    <div className="bg-[#FAF8F3] text-[#0B0B0D] min-h-[80vh] flex flex-col justify-center py-8 sm:py-12 px-3.5 sm:px-6 lg:px-8 pb-28 sm:pb-12 font-sans">
      <div className="max-w-md w-full mx-auto">
        {/* Title and Subtitle */}
        <div className="text-center sm:text-left">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-1">
            CUSTOMER ACCESS
          </span>
          <h1 className="text-3xl font-extrabold text-[#0B0B0D] font-sans tracking-tight">
            Account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#6B6E7B] font-sans leading-relaxed">
            Sign in to track orders and save your preferences. Regular shoppers can browse and order directly via WhatsApp without an account.
          </p>
        </div>

        {/* Tab Switcher (Log in | Sign up) */}
        <div className="mt-6 flex rounded-2xl border border-[#E7E5DD] p-1.5 bg-white shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#0B0B0D] text-[#FAF8F3] shadow-xs'
                : 'text-[#6B6E7B] hover:text-[#0B0B0D]'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-[#0B0B0D] text-[#FAF8F3] shadow-xs'
                : 'text-[#6B6E7B] hover:text-[#0B0B0D]'
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Form Container */}
        <div className="mt-6 bg-white border border-[#E7E5DD] rounded-2xl p-4 sm:p-8 shadow-xs">
          {statusMsg && (
            <div className="mb-4 p-3.5 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl text-xs font-mono text-[#15803D]">
              {statusMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="account-email" className="block text-xs font-bold text-[#0B0B0D] mb-1.5">
                Email Address
              </label>
              <input
                id="account-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-[#FAF8F3] border border-[#E7E5DD] focus:border-[#C9A45C] focus:bg-white focus:ring-1 focus:ring-[#C9A45C] rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="account-password" className="block text-xs font-bold text-[#0B0B0D] mb-1.5">
                Password
              </label>
              <input
                id="account-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-[#FAF8F3] border border-[#E7E5DD] focus:border-[#C9A45C] focus:bg-white focus:ring-1 focus:ring-[#C9A45C] rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#0B0B0D] text-[#FAF8F3] font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
            >
              {activeTab === 'login' ? 'Log in' : 'Create Account'}
            </button>
          </form>

          {/* Quick WhatsApp order notice with recognizable WhatsApp green */}
          <div className="mt-8 pt-6 border-t border-[#E7E5DD] text-center">
            <span className="text-xs text-[#6B6E7B] block mb-3 font-sans">
              Want to place an order or ask a sizing question right now?
            </span>
            <a
              href="https://wa.me/916300107759?text=Hi%20LYVEN!%20I'd%20like%20to%20order%20directly%20over%20WhatsApp."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
            >
              <MessageCircle size={15} className="fill-current" />
              <span>Order Directly via WhatsApp</span>
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#A1A1AA] font-mono">
            <ShieldCheck size={13} className="text-[#15803D]" />
            <span>Secure Shopper Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
