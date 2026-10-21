export const metadata = {
  title: 'Terms & Conditions — LYVEN',
  description: 'Terms of service and sale conditions governing transactions on the LYVEN digital platform.',
};

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-400 mb-2">Terms of Service</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms &amp; Conditions</h1>
          <p className="text-xs text-neutral-500 font-mono mt-2">Last Updated: October 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-neutral-300 text-sm leading-relaxed space-y-6">
          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">1. Agreement to Terms</h2>
            <p>
              By accessing or purchasing from LYVEN (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;), you agree to be bound by these Terms &amp; Conditions and applicable laws of India. If you do not agree, please do not use this platform.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">2. Product Accuracy &amp; Pricing</h2>
            <p>
              We strive to display garment colors, graphics, and fabric textures as accurately as possible. However, actual colors may vary slightly depending on monitor calibrations and lighting conditions. All prices listed on LYVEN are denominated in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST).
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">3. Order Acceptance &amp; Inventory</h2>
            <p>
              We reserve the right to refuse or cancel any order for reasons including stock shortages, inaccurate pricing due to typographical errors, or suspicious fraud alerts. In such events, any charged amount will be promptly refunded to the original payment method.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">4. Intellectual Property</h2>
            <p>
              All trademarks, logos, graphic compositions, photography, and text content featured on LYVEN are the exclusive intellectual property of LYVEN Apparel Private Limited or used with appropriate artistic licensing. Unauthorized reproduction, resale, or distribution is strictly prohibited.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">5. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
