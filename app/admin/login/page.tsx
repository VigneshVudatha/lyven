'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Shield, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mx-auto mb-4 font-mono font-black text-xl">
            L
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 bg-neutral-800/80 px-3 py-1 rounded-full border border-neutral-700">
            Internal Operations
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-3">LYVEN COMMAND CENTER</h1>
          <p className="text-xs text-neutral-400 mt-1">Authenticate to access store management &amp; orders</p>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-800/80 rounded-xl p-3.5 mb-6 flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
              Administrator Access Key
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 bg-white text-black font-semibold text-xs uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              'Verifying...'
            ) : (
              <>
                Unlock Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 pt-6 border-t border-neutral-800/60 text-center">
            <p className="text-[11px] text-neutral-500 font-mono">
              Development key: <code className="text-neutral-400">lyvenadmin2026</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
