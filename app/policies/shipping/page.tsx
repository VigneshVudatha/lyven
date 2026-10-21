export const metadata = {
  title: 'Shipping & Delivery Policy — LYVEN',
  description: 'Learn about LYVEN domestic shipping timelines, shipping fees, COD terms, and courier partners.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-400 mb-2">Legal &amp; Fulfillment</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Shipping &amp; Delivery Policy</h1>
          <p className="text-xs text-neutral-500 font-mono mt-2">Effective Date: October 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-neutral-300 text-sm leading-relaxed space-y-6">
          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">1. Order Processing Time</h2>
            <p>
              All orders are processed within 24 to 48 business hours (excluding Sundays and national holidays) after payment verification. Once your package is dispatched from our fulfilment center in Bengaluru, you will receive an automated tracking SMS and email containing your unique courier AWB tracking number.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">2. Shipping Charges &amp; Free Shipping Threshold</h2>
            <p>
              We provide <strong>FREE standard delivery</strong> on all prepaid orders across India with cart value above ₹999. For orders below ₹999, a flat shipping charge of ₹50 is applied at checkout.
            </p>
            <p>
              For <strong>Cash on Delivery (COD)</strong> orders, an additional handling and cash-collection convenience fee of ₹40 applies.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">3. Estimated Delivery Timelines</h2>
            <ul className="list-disc pl-5 space-y-2 text-xs text-neutral-400">
              <li><strong>Metro Cities (Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Chennai, Kolkata):</strong> 2 to 4 business days.</li>
              <li><strong>Tier 2 &amp; Tier 3 Cities:</strong> 4 to 6 business days.</li>
              <li><strong>North-East &amp; Remote Pincodes:</strong> 5 to 8 business days.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">4. Logistics Partners</h2>
            <p>
              We partner exclusively with premier tier-1 express logistics providers including Blue Dart, Delhivery, DTDC, and Xpressbees to ensure timely delivery and GPS-tracked transit.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">5. Undelivered or Returned Shipments</h2>
            <p>
              Our courier partners will attempt delivery up to 3 times before returning the package to our warehouse (RTO). Please ensure accurate mobile numbers and complete street addresses with landmark details at checkout to avoid delivery failures.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
