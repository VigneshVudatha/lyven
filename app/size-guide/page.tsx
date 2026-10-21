import Link from 'next/link';
import { ArrowLeft, Check, Info } from 'lucide-react';

export const metadata = {
  title: 'Size & Fit Guide — LYVEN Oversized Streetwear',
  description: 'Find your perfect oversized fit with LYVEN measurement charts, body specs, and styling recommendations.',
};

export default function SizeGuidePage() {
  const measurements = [
    { size: 'S', chest: '42 in (106 cm)', length: '28.5 in (72 cm)', shoulder: '21 in (53 cm)', sleeve: '9 in (23 cm)' },
    { size: 'M', chest: '44 in (112 cm)', length: '29.5 in (75 cm)', shoulder: '22 in (56 cm)', sleeve: '9.5 in (24 cm)' },
    { size: 'L', chest: '46 in (117 cm)', length: '30.5 in (77 cm)', shoulder: '23 in (58 cm)', sleeve: '10 in (25 cm)' },
    { size: 'XL', chest: '48 in (122 cm)', length: '31.5 in (80 cm)', shoulder: '24 in (61 cm)', sleeve: '10.5 in (26 cm)' },
    { size: 'XXL', chest: '50 in (127 cm)', length: '32.5 in (82 cm)', shoulder: '25 in (63 cm)', sleeve: '11 in (28 cm)' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Shop
        </Link>

        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-400 mb-2">Tailoring &amp; Dimensions</p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Oversized Fit Guide</h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
            All LYVEN T-shirts are engineered with a boxy, dropped-shoulder oversized silhouette. 
            Select your true size for our intended relaxed, streetwear drape. If you prefer a closer, traditional fit, consider sizing down one step.
          </p>
        </div>

        {/* Interactive Measurement Table */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden mb-12">
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="text-xs uppercase font-mono tracking-widest text-neutral-300">Garment Dimensions (Inches &amp; Centimeters)</h3>
            <span className="text-[11px] text-neutral-500 font-mono">Unisex / Boxy Fit</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-900/80 text-neutral-400 font-mono uppercase text-[11px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Size</th>
                  <th className="py-3.5 px-6 font-semibold">Chest (Circumference)</th>
                  <th className="py-3.5 px-6 font-semibold">Length</th>
                  <th className="py-3.5 px-6 font-semibold">Shoulder Drop</th>
                  <th className="py-3.5 px-6 font-semibold">Sleeve Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {measurements.map((row) => (
                  <tr key={row.size} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white text-sm">{row.size}</td>
                    <td className="py-4 px-6 text-neutral-300">{row.chest}</td>
                    <td className="py-4 px-6 text-neutral-300">{row.length}</td>
                    <td className="py-4 px-6 text-neutral-300">{row.shoulder}</td>
                    <td className="py-4 px-6 text-neutral-300">{row.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to Measure Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">How To Measure Your Best Fitting Tee</h3>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-neutral-800 text-white font-mono flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span><strong>Chest:</strong> Lay a favourite T-shirt flat. Measure armpit to armpit horizontally, then double the figure.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-neutral-800 text-white font-mono flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span><strong>Length:</strong> Measure from the highest point of the shoulder seam straight down to the bottom hem.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-neutral-800 text-white font-mono flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span><strong>Shoulder:</strong> Measure straight across from left shoulder seam to right shoulder seam.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Garment Care &amp; Longevity</h3>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cold machine wash inside out (30°C max) to preserve screen print vibrancy.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Do not iron directly over printed graphics; iron on reverse side.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Line dry in shade. Avoid hot tumble dryers to prevent shrinkage.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
