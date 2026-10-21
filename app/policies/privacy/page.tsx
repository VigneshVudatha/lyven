export const metadata = {
  title: 'Privacy Policy — LYVEN',
  description: 'How LYVEN collects, uses, and safeguards personal information of our customers and visitors.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-400 mb-2">Data Protection</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-neutral-500 font-mono mt-2">Last Updated: October 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-neutral-300 text-sm leading-relaxed space-y-6">
          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">1. Information We Collect</h2>
            <p>
              When you purchase or browse on LYVEN, we collect essential information required to fulfill your orders and offer personalized support:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-400">
              <li>Customer contact details: Full name, shipping address, mobile phone number, and email address.</li>
              <li>Order details: Item sizes, order quantities, transaction reference numbers.</li>
              <li>Device and log information: IP address, browser type, and operating system for security and fraud prevention.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">2. Payment Security &amp; Data Storage</h2>
            <p>
              We <strong>NEVER</strong> store, log, or process sensitive payment credentials such as credit/debit card numbers, CVV codes, or net banking passwords on our servers. All transactions are securely routed through PCI-DSS Level 1 compliant gateway partner <strong>Razorpay</strong> via end-to-end TLS 1.3 encryption.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">3. How We Use Information</h2>
            <p>Your personal data is used solely for:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-400">
              <li>Processing transactions and dispatching shipments to your designated address.</li>
              <li>Delivering automated shipping status updates via SMS, WhatsApp, and email.</li>
              <li>Preventing fraudulent orders and bot abuse.</li>
              <li>Improving catalog performance and customer experience.</li>
            </ul>
            <p className="text-xs text-neutral-400 font-medium">We do not sell, rent, or trade your personal information to third-party advertisers or broker networks.</p>
          </section>

          <section className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">4. Contact &amp; Grievance Officer</h2>
            <p>
              For questions regarding our privacy practices, data deletion requests, or grievances under the Information Technology Act 2000, please reach our Grievance Officer at <a href="mailto:grievance@lyven.in" className="underline hover:text-white">grievance@lyven.in</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
