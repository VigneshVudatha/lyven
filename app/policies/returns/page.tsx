export const metadata = {
  title: 'Returns & Exchange Policy — LYVEN',
  description: '7-day easy returns and size exchanges policy for unworn LYVEN garments with original tags intact.',
};

export default function ReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-400 mb-2">Customer Protection</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Returns &amp; Exchange Policy</h1>
          <p className="text-xs text-neutral-500 font-mono mt-2">Effective Date: October 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-neutral-300 text-sm leading-relaxed space-y-6">
          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">1. 7-Day Hassle-Free Returns &amp; Exchanges</h2>
            <p>
              We want you to love your LYVEN piece. If you are not satisfied with your purchase or require an alternate size, you may initiate a return or exchange request within <strong>7 days</strong> of confirmed delivery.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">2. Eligibility Criteria</h2>
            <p>To qualify for a return or exchange:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-neutral-400">
              <li>Garment must be in original unworn, unwashed, and unperfumed condition.</li>
              <li>All original brand tags, labels, and packaging must be attached and intact.</li>
              <li>Proof of purchase (Order Reference number or invoice) must be provided.</li>
              <li>Items showing signs of wear, stains, or tear will not be accepted.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">3. Reverse Pickup Process</h2>
            <p>
              Once your exchange or return is approved, we will arrange a reverse pickup from your shipping address via our courier partners. In rare cases where reverse pickup is unavailable for your specific pincode, we request you self-ship the product to our Bengaluru warehouse, and we will reimburse up to ₹100 towards shipping costs.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">4. Refunds Timelines</h2>
            <ul className="list-disc pl-5 space-y-2 text-xs text-neutral-400">
              <li><strong>Prepaid Orders (Cards/UPI/NetBanking):</strong> Refunds are credited directly back to the original source account within 5–7 banking days following warehouse inspection.</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> Refunds are transferred via direct Bank Account NEFT or UPI handle provided during the return request within 3–5 business days.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">5. Damaged or Defective Items</h2>
            <p>
              In the unlikely event that you receive a flawed or damaged garment, please notify us within 48 hours of delivery at <a href="mailto:support@lyven.in" className="underline hover:text-white">support@lyven.in</a> with photos of the defect. We will issue an immediate priority replacement at zero additional charge.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
