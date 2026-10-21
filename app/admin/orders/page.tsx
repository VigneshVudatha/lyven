'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import type { Order, FulfilmentStatus, PaymentStatus } from '@/types';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit fields for selected order
  const [editStatus, setEditStatus] = useState<FulfilmentStatus>('CONFIRMED');
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [editCourier, setEditCourier] = useState('');
  const [editTrackingId, setEditTrackingId] = useState('');
  const [editTrackingUrl, setEditTrackingUrl] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrderDrawer = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.fulfilmentStatus);
    setEditPaymentStatus(order.paymentStatus);
    setEditCourier(order.courierName || '');
    setEditTrackingId(order.trackingId || '');
    setEditTrackingUrl(order.trackingUrl || '');
    setEditNotes(order.notes || '');
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          fulfilmentStatus: editStatus,
          paymentStatus: editPaymentStatus,
          courierName: editCourier,
          trackingId: editTrackingId,
          trackingUrl: editTrackingUrl,
          notes: editNotes,
        }),
      });

      if (res.ok) {
        await fetchOrders();
        // Update local active state
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                fulfilmentStatus: editStatus,
                paymentStatus: editPaymentStatus,
                courierName: editCourier,
                trackingId: editTrackingId,
                trackingUrl: editTrackingUrl,
                notes: editNotes,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderRef.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.mobile.includes(search) ||
      o.customer.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || o.fulfilmentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">Fulfillment Center</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Order Management</h1>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs uppercase tracking-wider text-neutral-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload Orders
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order Ref, Customer, Phone, City..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-white text-black font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 text-neutral-400 font-mono uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-6">Reference</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Items &amp; Quantities</th>
                <th className="py-3 px-6">Total Amount</th>
                <th className="py-3 px-6">Payment Mode</th>
                <th className="py-3 px-6">Dispatch State</th>
                <th className="py-3 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs font-mono">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => openOrderDrawer(order)}
                    className="hover:bg-neutral-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-white">
                      {order.orderRef}
                      <span className="block text-[10px] text-neutral-500 font-normal">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-white">{order.customer.fullName}</p>
                      <p className="text-[11px] text-neutral-400">{order.customer.mobile}</p>
                    </td>
                    <td className="py-4 px-6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-[11px] text-neutral-300">
                          {item.quantity}&times; {item.name} ({item.size})
                        </div>
                      ))}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold">{formatINR(order.totalPaise)}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {order.paymentMethod} &bull; {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full ${
                          order.fulfilmentStatus === 'DELIVERED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : order.fulfilmentStatus === 'SHIPPED'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : order.fulfilmentStatus === 'PROCESSING'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : order.fulfilmentStatus === 'CANCELLED'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {order.fulfilmentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <ChevronRight className="w-4 h-4 text-neutral-500 inline-block" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal / Flyout */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-neutral-900 border-l border-neutral-800 h-full overflow-y-auto p-6 sm:p-8 space-y-6 animate-slideLeft">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Order Profile</span>
                <h3 className="text-xl font-bold font-mono">{selectedOrder.orderRef}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {/* Customer Details */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400">Delivery Recipient</h4>
              <p className="text-sm font-bold text-white">{selectedOrder.customer.fullName}</p>
              <div className="text-xs text-neutral-300 space-y-1">
                <p>{selectedOrder.customer.houseFlat}, {selectedOrder.customer.streetLocality}</p>
                <p>{selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.pinCode}</p>
                <p className="font-mono text-neutral-400 pt-1">Phone: +91 {selectedOrder.customer.mobile}</p>
                {selectedOrder.customer.email && (
                  <p className="font-mono text-neutral-400">Email: {selectedOrder.customer.email}</p>
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400">Order Items</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-neutral-800/40 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-neutral-400 font-mono text-[11px]">
                        SKU: {item.sku} &bull; Size: {item.size} &bull; Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-mono font-bold text-white">{formatINR(item.totalPricePaise)}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-neutral-800 flex justify-between text-xs font-bold">
                <span>Grand Total</span>
                <span className="font-mono text-base">{formatINR(selectedOrder.totalPaise)}</span>
              </div>
            </div>

            {/* Status & Fulfillment Controls */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400">Operations &amp; Dispatch Controls</h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">Fulfillment Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as FulfilmentStatus)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">Payment Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">Logistics Carrier Name</label>
                <input
                  type="text"
                  value={editCourier}
                  onChange={(e) => setEditCourier(e.target.value)}
                  placeholder="e.g. BlueDart Express / Delhivery"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white placeholder-neutral-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">Air Waybill / Tracking Number (AWB)</label>
                <input
                  type="text"
                  value={editTrackingId}
                  onChange={(e) => setEditTrackingId(e.target.value)}
                  placeholder="e.g. BD123456789IN"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white placeholder-neutral-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">Tracking Portal URL</label>
                <input
                  type="url"
                  value={editTrackingUrl}
                  onChange={(e) => setEditTrackingUrl(e.target.value)}
                  placeholder="https://www.bluedart.com/..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white placeholder-neutral-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">Internal Admin Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Packing instructions or customer communication log..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white placeholder-neutral-600"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveOrder}
                  disabled={saving}
                  className="w-full py-2.5 bg-white text-black font-semibold text-xs uppercase tracking-widest rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Order Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
