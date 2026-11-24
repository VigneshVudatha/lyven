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
  Shield,
  Trash2,
  AlertTriangle,
  Archive,
  Check,
  MoreVertical,
  Eye,
  RotateCcw,
  ShieldAlert,
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
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active three-dot row menu state
  const [activeMenuOrderId, setActiveMenuOrderId] = useState<string | null>(null);

  // Deletion & Archival modal state
  const [deleteModalOrder, setDeleteModalOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState(false);

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
    setActiveMenuOrderId(null);
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    setActionMsg(null);

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

      const data = await res.json();
      if (res.ok && data.success) {
        setActionMsg({ type: 'success', text: `Order ${selectedOrder.orderRef} updated successfully` });
        await fetchOrders();
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
      } else {
        setActionMsg({ type: 'error', text: data.error || 'Failed to update order' });
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err?.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveOrder = async (orderId: string, archive: boolean) => {
    setActionMsg(null);
    setActiveMenuOrderId(null);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, isArchived: archive }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMsg({
          type: 'success',
          text: archive
            ? `Order safely archived. It is now hidden from active order lists.`
            : `Order successfully restored to active orders.`,
        });
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, isArchived: archive } : null));
        }
        if (deleteModalOrder && deleteModalOrder.id === orderId) {
          setDeleteModalOrder(null);
        }
      } else {
        setActionMsg({ type: 'error', text: data.error || 'Failed to update archive status' });
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err?.message || 'Failed to update archive status' });
    }
  };

  const handleToggleTestTag = async (orderId: string, isTest: boolean) => {
    setActionMsg(null);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, isTest }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMsg({
          type: 'success',
          text: isTest
            ? `Order marked as Test Order.`
            : `Order untagged. Protected as a Live Customer Order.`,
        });
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, isTest } : null));
        }
      } else {
        setActionMsg({ type: 'error', text: data.error || 'Failed to toggle test tag' });
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err?.message || 'Failed to toggle test tag' });
    }
  };

  const handleDeleteOrder = async (orderId: string, hardDelete: boolean) => {
    setDeletingOrder(true);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/admin/orders?orderId=${encodeURIComponent(orderId)}&hardDelete=${hardDelete}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMsg({
          type: 'success',
          text: data.message,
        });
        setDeleteModalOrder(null);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(null);
        }
        await fetchOrders();
      } else {
        setActionMsg({
          type: 'error',
          text: data.error || 'Delete request could not be completed.',
        });
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err?.message || 'Delete operation error' });
    } finally {
      setDeletingOrder(false);
    }
  };

  // Filter orders according to search and active tab
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderRef.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.mobile.includes(search) ||
      o.customer.city.toLowerCase().includes(search.toLowerCase());

    let matchesStatus = false;
    if (statusFilter === 'ARCHIVED') {
      matchesStatus = Boolean(o.isArchived);
    } else {
      // Archived orders disappear from all active order lists
      if (o.isArchived) return false;

      if (statusFilter === 'ALL') {
        matchesStatus = true;
      } else if (statusFilter === 'LIVE ORDERS') {
        matchesStatus = !o.isTest;
      } else if (statusFilter === 'TEST ORDERS') {
        matchesStatus = Boolean(o.isTest);
      } else {
        matchesStatus = o.fulfilmentStatus === statusFilter;
      }
    }

    return matchesSearch && matchesStatus;
  });

  const activeOrders = orders.filter((o) => !o.isArchived);
  const archivedOrders = orders.filter((o) => o.isArchived);
  const testOrderCount = activeOrders.filter((o) => o.isTest).length;
  const liveOrderCount = activeOrders.length - testOrderCount;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C9A45C]">
            Fulfillment Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Order Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-neutral-400 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{liveOrderCount} Live</span>
            <span className="text-neutral-600">|</span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{testOrderCount} Test</span>
            <span className="text-neutral-600">|</span>
            <span className="inline-block w-2 h-2 rounded-full bg-neutral-500"></span>
            <span>{archivedOrders.length} Archived</span>
          </div>

          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Orders
          </button>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMsg && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between animate-fadeIn ${
            actionMsg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              : 'bg-red-950/60 border-red-800 text-red-200'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button
            onClick={() => setActionMsg(null)}
            className="text-white/80 hover:text-white uppercase font-bold text-[10px] ml-4 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

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

        {/* Status Filters including ARCHIVED */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {[
            'ALL',
            'LIVE ORDERS',
            'TEST ORDERS',
            'CONFIRMED',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED',
            'ARCHIVED',
          ].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setActiveMenuOrderId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-white text-black font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {st === 'ARCHIVED'
                ? `ARCHIVED (${archivedOrders.length})`
                : st === 'TEST ORDERS'
                ? `TEST (${testOrderCount})`
                : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 text-neutral-400 font-mono uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-6">Reference &amp; Type</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Items &amp; Quantities</th>
                <th className="py-3 px-6">Total Amount</th>
                <th className="py-3 px-6">Payment Mode</th>
                <th className="py-3 px-6">Dispatch State</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs font-mono">
                    {statusFilter === 'ARCHIVED'
                      ? 'No archived orders found.'
                      : 'No orders match your filter criteria.'}
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
                      <div className="flex items-center gap-2">
                        <span>{order.orderRef}</span>
                        {order.isArchived && (
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                            Archived
                          </span>
                        )}
                        {order.isTest ? (
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Test Order
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Live
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] text-neutral-500 font-normal mt-0.5">
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

                    {/* Three-Dot Actions Menu */}
                    <td className="py-4 px-6 text-right relative">
                      <div className="inline-block text-left" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuOrderId((prev) => (prev === order.id ? null : order.id))
                          }
                          aria-label={`Actions for order ${order.orderRef}`}
                          className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white inline-flex items-center justify-center transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuOrderId === order.id && (
                          <>
                            {/* Backdrop to close on outside click */}
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setActiveMenuOrderId(null)}
                            />

                            <div className="absolute right-6 mt-1 z-30 w-44 bg-[#0B0B0D] border border-neutral-800 rounded-xl shadow-2xl py-1 text-left animate-fadeIn">
                              <button
                                type="button"
                                onClick={() => openOrderDrawer(order)}
                                className="w-full px-3.5 py-2 text-xs text-neutral-200 hover:bg-neutral-900 hover:text-white flex items-center gap-2.5 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-neutral-400" />
                                View Order
                              </button>

                              <button
                                type="button"
                                onClick={() => handleArchiveOrder(order.id, !order.isArchived)}
                                className="w-full px-3.5 py-2 text-xs text-neutral-200 hover:bg-neutral-900 hover:text-white flex items-center gap-2.5 transition-colors"
                              >
                                {order.isArchived ? (
                                  <>
                                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                                    Restore Order
                                  </>
                                ) : (
                                  <>
                                    <Archive className="w-3.5 h-3.5 text-amber-400" />
                                    Archive Order
                                  </>
                                )}
                              </button>

                              <div className="border-t border-neutral-800/80 my-1" />

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuOrderId(null);
                                  setDeleteModalOrder(order);
                                }}
                                className="w-full px-3.5 py-2 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 flex items-center gap-2.5 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                Delete Order
                              </button>
                            </div>
                          </>
                        )}
                      </div>
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A45C]">
                  Order Profile
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-xl font-bold font-mono text-white">{selectedOrder.orderRef}</h3>
                  {selectedOrder.isArchived && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
                      Archived
                    </span>
                  )}
                  {selectedOrder.isTest ? (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      Test Order
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      Live Customer
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {/* Archived Order Notice Banner */}
            {selectedOrder.isArchived && (
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Archive className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    This order is <strong>Archived</strong>. It is hidden from active order views.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleArchiveOrder(selectedOrder.id, false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  Restore to Active
                </button>
              </div>
            )}

            {/* Test vs Live Status Banner & Toggling */}
            {selectedOrder.isTest ? (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Identified as a <strong>Test Order</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleTestTag(selectedOrder.id, false)}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-[10px] font-mono uppercase text-neutral-300 hover:text-white self-start sm:self-auto shrink-0"
                >
                  Untag Test
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Shield className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="text-neutral-300">
                    Live Customer Order. Payment &amp; delivery records preserved.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleTestTag(selectedOrder.id, true)}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-[10px] font-mono uppercase text-neutral-400 hover:text-amber-300 self-start sm:self-auto shrink-0"
                  title="Tag order as test order if placed for verification"
                >
                  Tag as Test
                </button>
              </div>
            )}

            {/* Customer Details */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400">
                Delivery Recipient
              </h4>
              <p className="text-sm font-bold text-white">{selectedOrder.customer.fullName}</p>
              <div className="text-xs text-neutral-300 space-y-1">
                <p>
                  {selectedOrder.customer.houseFlat}, {selectedOrder.customer.streetLocality}
                </p>
                <p>
                  {selectedOrder.customer.city}, {selectedOrder.customer.state} -{' '}
                  {selectedOrder.customer.pinCode}
                </p>
                <p className="font-mono text-neutral-400 pt-1">
                  Phone: +91 {selectedOrder.customer.mobile}
                </p>
                {selectedOrder.customer.email && (
                  <p className="font-mono text-neutral-400">Email: {selectedOrder.customer.email}</p>
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400">
                Order Items ({selectedOrder.items.reduce((s, i) => s + i.quantity, 0)} Units)
              </h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs pb-2 border-b border-neutral-800/40 last:border-0 last:pb-0"
                  >
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
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400">
                Operations &amp; Dispatch Controls
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                    Fulfillment Status
                  </label>
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
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                    Payment Status
                  </label>
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
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  Logistics Carrier Name
                </label>
                <input
                  type="text"
                  value={editCourier}
                  onChange={(e) => setEditCourier(e.target.value)}
                  placeholder="e.g. BlueDart Express / Delhivery"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white placeholder-neutral-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  Air Waybill / Tracking Number (AWB)
                </label>
                <input
                  type="text"
                  value={editTrackingId}
                  onChange={(e) => setEditTrackingId(e.target.value)}
                  placeholder="e.g. BD123456789IN"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white placeholder-neutral-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  Tracking Portal URL
                </label>
                <input
                  type="url"
                  value={editTrackingUrl}
                  onChange={(e) => setEditTrackingUrl(e.target.value)}
                  placeholder="https://www.bluedart.com/..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white placeholder-neutral-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  Internal Admin Notes
                </label>
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

            {/* Quick Actions (Archive / Restore / Delete) */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400">
                Order History &amp; Actions
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleArchiveOrder(selectedOrder.id, !selectedOrder.isArchived)}
                  className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  {selectedOrder.isArchived ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                      Restore Order
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                      Archive Order
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteModalOrder(selectedOrder)}
                  className="flex-1 py-2 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Delete or Archive Order */}
      {deleteModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0B0B0D] border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Order Action: {deleteModalOrder.orderRef}
                </h3>
                <span className="text-[10px] font-mono uppercase text-neutral-400">
                  Customer: {deleteModalOrder.customer.fullName}
                </span>
              </div>
            </div>

            {/* Order Summary Details */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-neutral-400 font-mono text-[11px]">
                <div>
                  <span className="text-neutral-500 uppercase block text-[9px]">Reference</span>
                  <span className="text-white font-bold">{deleteModalOrder.orderRef}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase block text-[9px]">Customer Name</span>
                  <span className="text-white font-bold">{deleteModalOrder.customer.fullName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase block text-[9px]">Payment Status</span>
                  <span
                    className={`font-bold uppercase ${
                      deleteModalOrder.paymentStatus === 'PAID'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {deleteModalOrder.paymentStatus} ({deleteModalOrder.paymentMethod})
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase block text-[9px]">Total Amount</span>
                  <span className="text-white font-bold">{formatINR(deleteModalOrder.totalPaise)}</span>
                </div>
              </div>
            </div>

            {/* Explanation & Eligibility Notice */}
            {deleteModalOrder.paymentStatus === 'PAID' ||
            deleteModalOrder.paymentStatus === 'REFUNDED' ||
            Boolean(deleteModalOrder.razorpayPaymentId) ? (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Statutory Financial Audit Protection</span>
                </div>
                <p className="text-neutral-300 leading-relaxed text-[11px]">
                  This order contains confirmed payment records (Payment Status:{' '}
                  <strong className="text-white">{deleteModalOrder.paymentStatus}</strong>). Indian GST
                  regulations, statutory accounting standards, and payment gateway rules mandate
                  retaining all completed monetary transaction records. Permanent deletion is
                  blocked to prevent data loss.
                </p>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  You can safely <strong className="text-white">Archive</strong> this order. Archiving
                  removes it from active operational views while preserving all financial, tax, and
                  customer records intact.
                </p>
              </div>
            ) : !deleteModalOrder.isTest && deleteModalOrder.fulfilmentStatus !== 'CANCELLED' ? (
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Shield className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Active Customer Order Record</span>
                </div>
                <p className="text-neutral-300 leading-relaxed text-[11px]">
                  This is an active customer order (Fulfillment Status:{' '}
                  <strong className="text-white">{deleteModalOrder.fulfilmentStatus}</strong>).
                  Customer order history and fulfillment records must be preserved for delivery proof
                  and dispute defense. Permanent deletion cannot be performed on active customer
                  orders.
                </p>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Please use <strong className="text-white">Archive</strong> instead to safely hide this
                  order from active lists.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-red-300 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>Test / Unpaid Order Notice</span>
                </div>
                <p className="text-neutral-300 leading-relaxed text-[11px]">
                  This order has no verified customer monetary liability. Permanent deletion will
                  remove this record from the database. This action cannot be undone.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOrder(null)}
                disabled={deletingOrder}
                className="w-full sm:w-auto px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleArchiveOrder(deleteModalOrder.id, true)}
                disabled={deletingOrder}
                className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <Archive className="w-3.5 h-3.5 text-amber-400" />
                Archive Order (Safe)
              </button>

              {/* Only show permanent delete button if not a paid or active live customer order */}
              {!(
                deleteModalOrder.paymentStatus === 'PAID' ||
                deleteModalOrder.paymentStatus === 'REFUNDED' ||
                Boolean(deleteModalOrder.razorpayPaymentId) ||
                (!deleteModalOrder.isTest && deleteModalOrder.fulfilmentStatus !== 'CANCELLED')
              ) && (
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(deleteModalOrder.id, true)}
                  disabled={deletingOrder}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deletingOrder ? 'Deleting...' : 'Permanently Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
