'use client';

import { useRef } from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatPriceINR } from '@/lib/utils';

export interface InvoiceOrderData {
  orderRef: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  customer?: {
    fullName: string;
    houseFlat: string;
    streetLocality: string;
    city: string;
    state: string;
    pinCode: string;
    mobile?: string;
    email?: string;
  };
  deliveryCity?: string;
  deliveryState?: string;
  deliveryPinCode?: string;
  items: {
    name: string;
    size: string;
    color?: string;
    sku?: string;
    quantity: number;
    unitPricePaise: number;
    totalPricePaise: number;
  }[];
  subtotalPaise: number;
  deliveryChargePaise: number;
  taxPaise: number;
  totalPaise: number;
  razorpayPaymentId?: string;
}

interface TaxInvoiceModalProps {
  order: InvoiceOrderData;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaxInvoiceModal({ order, isOpen, onClose }: TaxInvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const state = order.customer?.state || order.deliveryState || 'Karnataka';
  const isKarnataka = state.toLowerCase().includes('karnataka');

  // Apparel under ₹1000 is 5% GST (CGST 2.5% + SGST 2.5% or IGST 5%)
  // Prices are GST-inclusive in D2C e-commerce: Taxable = Total / 1.05
  const totalAmount = order.totalPaise / 100;
  const taxableBase = Math.round((totalAmount / 1.05) * 100) / 100;
  const totalGst = Math.round((totalAmount - taxableBase) * 100) / 100;
  const cgst = isKarnataka ? Math.round((totalGst / 2) * 100) / 100 : 0;
  const sgst = isKarnataka ? Math.round((totalGst / 2) * 100) / 100 : 0;
  const igst = !isKarnataka ? totalGst : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      {/* Container */}
      <div className="relative bg-white text-neutral-900 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-full">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-100 border-b border-neutral-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-neutral-500">Official GST Invoice</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={12} /> Verified
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div ref={invoiceRef} className="p-6 sm:p-10 font-sans print:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-black pb-6">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-black">LYVEN</h2>
              <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-semibold mt-0.5">
                Heavyweight Streetwear Label
              </p>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                LYVEN Apparel India Pvt. Ltd.<br />
                100 Feet Road, Indiranagar, Bengaluru, Karnataka — 560038<br />
                GSTIN: <span className="font-mono font-bold text-neutral-900">29AAACL1928K1Z3</span><br />
                CIN: U18101KA2026PTC109823<br />
                Email: support@lyven.in · Web: www.lyven.in
              </p>
            </div>
            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 bg-black text-white text-[11px] font-mono uppercase tracking-widest font-bold mb-2">
                Tax Invoice
              </span>
              <p className="text-xs text-neutral-600">
                Invoice No: <span className="font-mono font-bold text-black">{order.orderRef}</span>
              </p>
              <p className="text-xs text-neutral-600">
                Invoice Date: <span className="font-bold text-neutral-800">{invoiceDate}</span>
              </p>
              <p className="text-xs text-neutral-600">
                Place of Supply: <span className="font-bold text-neutral-800">{state} (State Code: 29)</span>
              </p>
            </div>
          </div>

          {/* Customer / Shipping Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-neutral-200 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block mb-1">
                Billed & Shipped To:
              </span>
              <p className="font-bold text-sm text-neutral-900">
                {order.customer?.fullName || 'Valued Customer'}
              </p>
              <p className="text-neutral-600 mt-1 leading-relaxed">
                {order.customer?.houseFlat && `${order.customer.houseFlat}, `}
                {order.customer?.streetLocality && `${order.customer.streetLocality}, `}
                <br />
                {order.customer?.city || order.deliveryCity},{' '}
                {order.customer?.state || order.deliveryState} —{' '}
                <span className="font-mono font-bold">{order.customer?.pinCode || order.deliveryPinCode}</span>
                <br />
                India
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block mb-1">
                Payment Information:
              </span>
              <p className="text-neutral-700">
                Payment Mode:{' '}
                <span className="font-bold text-neutral-900">
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid Online (Razorpay UPI/Cards)'}
                </span>
              </p>
              <p className="text-neutral-700">
                Payment Status:{' '}
                <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-green-700' : 'text-amber-700'}`}>
                  {order.paymentStatus}
                </span>
              </p>
              {order.razorpayPaymentId && (
                <p className="text-neutral-500 font-mono text-[11px] mt-0.5">
                  Txn ID: {order.razorpayPaymentId}
                </p>
              )}
            </div>
          </div>

          {/* Goods Table */}
          <div className="py-6">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-neutral-900 text-left">
                  <th className="py-2.5 font-bold uppercase tracking-wider text-[10px]">#</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-[10px]">Description & Fabric Specs</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-[10px]">HSN Code</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-center">Size</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-center">Qty</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-right">Rate</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-3 font-mono text-neutral-500">{idx + 1}</td>
                    <td className="py-3 pr-4">
                      <p className="font-bold text-neutral-900">{item.name}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        240 GSM Combed French Terry Cotton · Boxy Oversized Drop-Shoulder Fit
                      </p>
                    </td>
                    <td className="py-3 font-mono text-neutral-600">61091000</td>
                    <td className="py-3 text-center font-bold text-neutral-800">{item.size}</td>
                    <td className="py-3 text-center font-mono font-bold text-neutral-800">{item.quantity}</td>
                    <td className="py-3 text-right font-mono text-neutral-700">
                      ₹{(item.unitPricePaise / 100).toFixed(2)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-neutral-900">
                      ₹{(item.totalPricePaise / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Calculation & Summary */}
          <div className="border-t-2 border-neutral-900 pt-4 flex flex-col sm:flex-row justify-between gap-6 text-xs">
            <div className="max-w-xs space-y-1 text-neutral-600">
              <p className="font-bold text-neutral-900">GST Breakdown (5% Rate on Knitted Cotton Garments):</p>
              {isKarnataka ? (
                <>
                  <p className="flex justify-between">
                    <span>CGST (2.5%):</span>
                    <span className="font-mono font-semibold text-neutral-900">₹{cgst.toFixed(2)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>SGST (2.5%):</span>
                    <span className="font-mono font-semibold text-neutral-900">₹{sgst.toFixed(2)}</span>
                  </p>
                </>
              ) : (
                <p className="flex justify-between">
                  <span>IGST (5.0%):</span>
                  <span className="font-mono font-semibold text-neutral-900">₹{igst.toFixed(2)}</span>
                </p>
              )}
              <p className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-200">
                HSN 61091000 applies to cotton knitted/crocheted T-shirts. All taxes inclusive in retail selling price.
              </p>
            </div>

            <div className="sm:w-64 space-y-2">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal (Gross):</span>
                <span className="font-mono font-semibold">₹{(order.subtotalPaise / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping & Handling:</span>
                <span className="font-mono font-semibold">
                  {order.deliveryChargePaise > 0 ? `₹${(order.deliveryChargePaise / 100).toFixed(2)}` : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between border-t-2 border-neutral-900 pt-2 text-sm font-bold text-neutral-900">
                <span>Total Amount:</span>
                <span className="font-mono text-base">₹{(order.totalPaise / 100).toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-neutral-500 text-right">
                (Indian Rupees {order.totalPaise / 100} Only)
              </p>
            </div>
          </div>

          {/* Footer & Compliance Notice */}
          <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-neutral-500 gap-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-neutral-700" />
              <span>Authentic LYVEN Merchandise · 7-Day Exchange Under Return Policy</span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-neutral-700">For LYVEN Apparel India Pvt. Ltd.</p>
              <p className="text-[10px] text-neutral-400">Computer generated invoice. No physical signature required.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
