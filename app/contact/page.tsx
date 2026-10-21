'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    orderReference: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate fast submission feedback
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.3em] font-mono text-neutral-400 mb-2">Concierge &amp; Customer Care</p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">GET IN TOUCH</h1>
          <p className="text-neutral-400 text-sm mt-3">
            Have questions regarding sizes, order tracking, returns, or corporate orders? Our support team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Information & Channels */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider">Email Support</h3>
              </div>
              <p className="text-xs text-neutral-400 mb-2">For order inquiries, size questions, and returns:</p>
              <a href="mailto:support@lyven.in" className="text-sm font-mono text-white underline hover:text-neutral-300">
                support@lyven.in
              </a>
              <p className="text-[11px] text-neutral-500 mt-2">Typical response time: under 4 hours</p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider">WhatsApp Concierge</h3>
              </div>
              <p className="text-xs text-neutral-400 mb-2">Instant messaging for tracking and sizing assistance:</p>
              <a
                href="https://wa.me/916300107759"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-emerald-400 hover:text-emerald-300 font-bold"
              >
                +91 63001 07759 &rarr;
              </a>
              <p className="text-[11px] text-neutral-500 mt-2">Available Mon–Sat: 10:00 AM – 7:00 PM IST</p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider">Studio &amp; Warehouse</h3>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                LYVEN Apparel Private Limited<br />
                Indiranagar 100ft Road, Stage 1<br />
                Bengaluru, Karnataka 560038, India
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold">Message Received</h3>
                  <p className="text-sm text-neutral-400 max-w-md mx-auto">
                    Thank you for reaching out. A member of our support team will review your query and respond via email within 4 to 12 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', phone: '', orderReference: '', message: '' });
                    }}
                    className="mt-4 px-6 py-2.5 text-xs uppercase tracking-widest font-semibold bg-white text-black rounded-lg hover:bg-neutral-200"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-lg font-bold">Send Us a Direct Message</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                        Order Reference (Optional)
                      </label>
                      <input
                        type="text"
                        value={form.orderReference}
                        onChange={(e) => setForm({ ...form, orderReference: e.target.value.toUpperCase() })}
                        placeholder="e.g. LYV-K28X9P"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Please tell us how we can assist you..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black font-semibold text-xs uppercase tracking-widest rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      'Sending Message...'
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Inquiry
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
