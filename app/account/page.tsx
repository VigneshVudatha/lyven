'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MessageCircle,
  ShieldCheck,
  User,
  ShoppingBag,
  LogOut,
  Package,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Palette,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account';

  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initialize and check current Supabase session
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setCurrentUser(session.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setCurrentUser(data.user);
        setSuccessMessage('Successfully signed in! Welcome back to LYVEN.');
        if (redirectTarget && redirectTarget !== '/account') {
          router.push(redirectTarget);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || undefined,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        if (data.session) {
          // Automatic session created
          setCurrentUser(data.user);
          setSuccessMessage('Account created successfully! Welcome to LYVEN.');
          if (redirectTarget && redirectTarget !== '/account') {
            router.push(redirectTarget);
          }
        } else {
          // Email confirmation is required by Supabase Auth settings
          setSuccessMessage(
            'Account registration initiated! If email confirmation is enabled, please verify your email to log in.'
          );
          setActiveTab('login');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/account`,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage('Password reset instructions have been sent to your email.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send reset link. Please check the email address.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setCurrentUser(null);
      setSuccessMessage('You have logged out successfully.');
      setActiveTab('login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Initial Loading State
  if (loading) {
    return (
      <div className="bg-[#FAF8F3] text-[#0B0B0D] min-h-[75vh] flex flex-col justify-center items-center font-sans">
        <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono uppercase tracking-widest text-[#6B6E7B]">Loading Account...</p>
      </div>
    );
  }

  // 2. Authenticated Customer Dashboard View
  if (currentUser) {
    const displayName =
      currentUser.user_metadata?.full_name ||
      currentUser.email?.split('@')[0] ||
      'LYVEN Member';

    return (
      <div className="bg-[#FAF8F3] text-[#0B0B0D] min-h-[80vh] py-8 sm:py-14 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          {/* Top Profile Summary Card */}
          <div className="bg-white border border-[#E7E5DD] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#0B0B0D] text-[#C9A45C] border-2 border-[#C9A45C] flex items-center justify-center font-bold text-lg font-mono shadow-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-0.5">
                  LYVEN MEMBER
                </span>
                <h1 className="text-2xl font-extrabold text-[#0B0B0D] tracking-tight">
                  {displayName}
                </h1>
                <p className="text-xs text-[#6B6E7B] font-mono mt-0.5">{currentUser.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E7E5DD] hover:bg-neutral-100 text-xs font-bold uppercase tracking-wider text-[#0B0B0D] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#6B6E7B]" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Quick Navigation Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* My Orders Card (Prominent) */}
            <Link
              href="/my-orders"
              className="bg-white border border-[#E7E5DD] hover:border-[#C9A45C] rounded-2xl p-6 shadow-xs group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] border border-[#E7E5DD] flex items-center justify-center text-[#C9A45C] mb-4 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0B0B0D]">My Orders</h3>
                <ArrowRight className="w-4 h-4 text-[#C9A45C] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-[#6B6E7B] mt-1.5 leading-relaxed">
                View your order history, live courier dispatch, and GST tax invoices.
              </p>
            </Link>

            {/* Track Shipment by Ref Card */}
            <Link
              href="/track"
              className="bg-white border border-[#E7E5DD] hover:border-[#C9A45C] rounded-2xl p-6 shadow-xs group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] border border-[#E7E5DD] flex items-center justify-center text-[#C9A45C] mb-4 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0B0B0D]">Track Shipment</h3>
                <ArrowRight className="w-4 h-4 text-[#C9A45C] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-[#6B6E7B] mt-1.5 leading-relaxed">
                Lookup live courier status using your unique LYVEN order reference.
              </p>
            </Link>

            {/* Custom Design Studio */}
            <Link
              href="/custom-design"
              className="bg-white border border-[#E7E5DD] hover:border-[#C9A45C] rounded-2xl p-6 shadow-xs group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] border border-[#E7E5DD] flex items-center justify-center text-[#C9A45C] mb-4 group-hover:scale-105 transition-transform">
                <Palette className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0B0B0D]">Custom Design Studio</h3>
                <ArrowRight className="w-4 h-4 text-[#C9A45C] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-[#6B6E7B] mt-1.5 leading-relaxed">
                Upload your custom artwork for custom heavyweight tees printed on-demand.
              </p>
            </Link>

            {/* Explore Drops */}
            <Link
              href="/shop"
              className="bg-white border border-[#E7E5DD] hover:border-[#C9A45C] rounded-2xl p-6 shadow-xs group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] border border-[#E7E5DD] flex items-center justify-center text-[#C9A45C] mb-4 group-hover:scale-105 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0B0B0D]">Browse Catalog</h3>
                <ArrowRight className="w-4 h-4 text-[#C9A45C] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-[#6B6E7B] mt-1.5 leading-relaxed">
                Discover the latest oversized graphic tees and signature Indian streetwear.
              </p>
            </Link>
          </div>

          {/* Concierge Assistance */}
          <div className="bg-white border border-[#E7E5DD] rounded-2xl p-6 text-center shadow-xs">
            <span className="text-xs text-[#6B6E7B] block mb-3 font-sans">
              Have questions regarding sizing, custom prints, or an existing order?
            </span>
            <a
              href="https://wa.me/916300107759?text=Hi%20LYVEN!%20I%20need%20assistance%20with%20my%20account."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <MessageCircle size={15} className="fill-current" />
              <span>Contact LYVEN Concierge on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. Guest / Visitor Auth Form View
  return (
    <div className="bg-[#FAF8F3] text-[#0B0B0D] min-h-[80vh] flex flex-col justify-center py-8 sm:py-14 px-4 sm:px-6 lg:px-8 pb-28 sm:pb-14 font-sans">
      <div className="max-w-md w-full mx-auto">
        {/* Title and Subtitle */}
        <div className="text-center sm:text-left">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C9A45C] font-bold block mb-1">
            CUSTOMER ACCESS
          </span>
          <h1 className="text-3xl font-extrabold text-[#0B0B0D] tracking-tight">
            Account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#6B6E7B] leading-relaxed">
            Sign in to track orders and save your preferences. Regular shoppers can browse and order directly via WhatsApp or guest checkout without an account.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex rounded-2xl border border-[#E7E5DD] p-1.5 bg-white shadow-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
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
            onClick={() => {
              setActiveTab('signup');
              setErrorMessage('');
              setSuccessMessage('');
            }}
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
        <div className="mt-6 bg-white border border-[#E7E5DD] rounded-2xl p-5 sm:p-8 shadow-xs">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="mb-4 p-3.5 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl text-xs font-medium text-[#15803D] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="account-email"
                  className="block text-xs font-bold text-[#0B0B0D] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="account-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F3] border border-[#E7E5DD] focus:border-[#C9A45C] focus:bg-white focus:ring-1 focus:ring-[#C9A45C] rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="account-password"
                    className="block text-xs font-bold text-[#0B0B0D]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] text-[#C9A45C] hover:text-[#9A7328] font-semibold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="account-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F3] border border-[#E7E5DD] focus:border-[#C9A45C] focus:bg-white focus:ring-1 focus:ring-[#C9A45C] rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#0B0B0D] text-[#FAF8F3] font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Authenticating...' : 'Log In'}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-bold text-[#0B0B0D] mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F3] border border-[#E7E5DD] focus:border-[#C9A45C] focus:bg-white focus:ring-1 focus:ring-[#C9A45C] rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-bold text-[#0B0B0D] mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F3] border border-[#E7E5DD] focus:border-[#C9A45C] focus:bg-white focus:ring-1 focus:ring-[#C9A45C] rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-bold text-[#0B0B0D] mb-1.5"
                >
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F3] border border-[#E7E5DD] focus:border-[#C9A45C] focus:bg-white focus:ring-1 focus:ring-[#C9A45C] rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#0B0B0D] text-[#FAF8F3] font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {activeTab === 'forgot' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-xs font-bold text-[#0B0B0D] mb-1.5"
                >
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F3] border border-[#E7E5DD] focus:border-[#C9A45C] focus:bg-white focus:ring-1 focus:ring-[#C9A45C] rounded-xl text-xs sm:text-sm text-[#0B0B0D] placeholder-neutral-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#0B0B0D] text-[#FAF8F3] font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Sending Link...' : 'Send Password Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="w-full text-center text-xs text-[#6B6E7B] hover:text-[#0B0B0D] font-medium pt-2 block"
              >
                &larr; Back to Log in
              </button>
            </form>
          )}

          {/* Quick WhatsApp order notice */}
          <div className="mt-8 pt-6 border-t border-[#E7E5DD] text-center">
            <span className="text-xs text-[#6B6E7B] block mb-3 font-sans">
              Want to place an order or ask a sizing question right now?
            </span>
            <a
              href="https://wa.me/916300107759?text=Hi%20LYVEN!%20I'd%20like%20to%20order%20directly%20over%20WhatsApp."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
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

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#FAF8F3] text-[#0B0B0D] min-h-[75vh] flex flex-col justify-center items-center font-sans">
          <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono uppercase tracking-widest text-[#6B6E7B]">Loading Account...</p>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}

