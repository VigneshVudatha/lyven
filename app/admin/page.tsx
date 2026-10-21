'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import type { Order, DashboardStats } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, fulfilmentStatus: newStatus }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalRevenuePaise = (stats?.onlineRevenuePaise || 0) + (stats?.codRevenuePaise || 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">Executive Overview</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Business Metrics</h1>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Collected Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono tracking-tight">{formatINR(totalRevenuePaise)}</p>
          <p className="text-[11px] text-neutral-500 mt-1">Prepaid + Settled COD orders</p>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <p className="text-2xl font-black font-mono tracking-tight">{stats?.totalOrders || 0}</p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {stats?.paidCount || 0} Paid &bull; {stats?.unpaidCount || 0} Pending
          </p>
        </div>

        {/* Fulfillment Backlog */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">In Fulfillment</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono tracking-tight">
            {(stats?.processingOrders || 0) + (stats?.confirmedOrders || 0)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Require warehouse packing/dispatch</p>
        </div>

        {/* Pending COD Value */}
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Pending COD</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black font-mono tracking-tight">{formatINR(stats?.codPendingPaise || 0)}</p>
          <p className="text-[11px] text-neutral-500 mt-1">To be collected upon door delivery</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/orders"
          className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-600 transition-all group flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-sm tracking-wide group-hover:text-white transition-colors">Manage All Customer Orders</h3>
            <p className="text-xs text-neutral-400 mt-1">Filter, inspect items, dispatch with courier AWB numbers &amp; track payments</p>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
        </Link>

        <Link
          href="/admin/inventory"
          className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-600 transition-all group flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-sm tracking-wide group-hover:text-white transition-colors">Launch Inventory Matrix</h3>
            <p className="text-xs text-neutral-400 mt-1">Stock levels across sizes (S to XXL) for Virat Kohli &amp; Marvel oversized tees</p>
          </div>
          <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Recent Customer Transactions</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Showing latest incoming orders</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs uppercase tracking-wider text-neutral-400 hover:text-white font-mono"
          >
            View All ({orders.length}) &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/80 text-neutral-400 font-mono uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-6">Reference</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Items</th>
                <th className="py-3 px-6">Total</th>
                <th className="py-3 px-6">Payment</th>
                <th className="py-3 px-6">Fulfillment</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-white">
                    {order.orderRef}
                    <div className="text-[10px] text-neutral-500 font-normal">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-white">{order.customer.fullName}</p>
                    <p className="text-[11px] text-neutral-400">{order.customer.city}, {order.customer.state}</p>
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
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        order.fulfilmentStatus === 'DELIVERED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : order.fulfilmentStatus === 'SHIPPED'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : order.fulfilmentStatus === 'PROCESSING'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {order.fulfilmentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <select
                      value={order.fulfilmentStatus}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="bg-neutral-900 border border-neutral-700 text-[11px] rounded px-2 py-1 text-white focus:outline-none"
                    >
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
