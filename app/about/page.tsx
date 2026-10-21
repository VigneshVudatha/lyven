import Link from 'next/link';
import { Sparkles, Shield, Compass, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About LYVEN — Premium Oversized Streetwear',
  description: 'Learn about LYVEN — an independent streetwear label born from the pursuit of modern graphic art and uncompromising garment craftsmanship in India.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="border-b border-neutral-800 pb-16">
          <p className="text-xs uppercase tracking-[0.3em] font-mono text-neutral-400 mb-4">Independent Fashion Label — Bengaluru, India</p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            WEAR YOUR EXPRESSION.
          </h1>
          <p className="text-neutral-400 text-lg sm:text-xl mt-6 max-w-2xl leading-relaxed">
            LYVEN was founded with one uncompromising mission: to bridge contemporary pop-culture and Indian fandom with heavyweight luxury streetwear tailoring.
          </p>
        </div>

        {/* Brand Narrative */}
        <div className="py-16 space-y-12 border-b border-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              The Architecture of an Oversized Silhouette
            </h2>
            <div className="text-neutral-400 space-y-4 text-sm leading-relaxed">
              <p>
                Too many brands sell &ldquo;oversized&rdquo; tees that are simply larger sizes of ordinary garments with stretched collars and sagging armholes. At LYVEN, our patterns are cut from ground zero.
              </p>
              <p>
                We engineered an exaggerated drop-shoulder drape, wider sleeves that taper cleanly at the elbow, and a tightened high-density ribbed collar that stays crisp and never frays after multiple washes.
              </p>
            </div>
          </div>
        </div>

        {/* Quality Pillars */}
        <div className="py-16 border-b border-neutral-800">
          <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 mb-8">Our Craftsmanship Standards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800">
              <Sparkles className="w-6 h-6 text-white mb-4" />
              <h4 className="text-base font-bold mb-2">240 GSM Combed Cotton</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Heavyweight French Terry jersey that provides structured volume without trapping heat in tropical Indian weather. Bio-washed for a buttery soft handfeel.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800">
              <Shield className="w-6 h-6 text-white mb-4" />
              <h4 className="text-base font-bold mb-2">High-Density Screen Prints</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Multi-layer plastisol and discharge pigment inks that breathe with the fabric, resisting cracks and peeling across 50+ wash cycles.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800">
              <Compass className="w-6 h-6 text-white mb-4" />
              <h4 className="text-base font-bold mb-2">Ethical Small-Batch Drops</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Produced in verified partner facilities with zero child labor, fair living wages, and precision single-needle edge stitching.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-16 text-center">
          <h3 className="text-2xl font-bold tracking-tight mb-4">Explore Our Launch Roster</h3>
          <p className="text-neutral-400 text-sm max-w-md mx-auto mb-8">
            Discover Design 01 Virat Kohli and Design 02 Marvel — engineered for statement comfort.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold text-xs uppercase tracking-widest rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Explore Catalogue
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
