'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

const activities = [
  { city: 'Bengaluru, KA', product: 'Virat Kohli Edition (L)', time: '3 minutes ago' },
  { city: 'Mumbai, MH', product: 'DUDE Graphic Edition (XL)', time: '7 minutes ago' },
  { city: 'New Delhi, DL', product: 'Virat Kohli Edition (M)', time: '12 minutes ago' },
  { city: 'Hyderabad, TS', product: 'Virat Kohli Edition (L)', time: '18 minutes ago' },
  { city: 'Pune, MH', product: 'Custom Typography Tee (L)', time: '24 minutes ago' },
];

export default function LiveActivityToast() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Show after 4 seconds initial delay
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 4000);

    // Rotate every 12 seconds
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % activities.length);
        setVisible(true);
      }, 600);
    }, 12000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed]);

  if (dismissed) return null;

  const current = activities[currentIdx];

  return (
    <aside
      aria-label="Recent purchase notifications"
      className={`fixed bottom-5 left-5 z-40 transition-all duration-500 max-w-xs ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-3 shadow-lg flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
          <CheckCircle2 size={16} className="text-emerald-600" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-semibold">
            Order Dispatched · {current.city}
          </p>
          <p className="text-xs font-semibold text-gray-900 truncate mt-0.5">
            {current.product}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {current.time}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setDismissed(true);
          }}
          className="text-gray-400 hover:text-gray-700 p-1"
          aria-label="Dismiss notification"
        >
          <X size={13} />
        </button>
      </div>
    </aside>
  );
}
