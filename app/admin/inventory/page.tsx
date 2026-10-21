'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, AlertTriangle, CheckCircle, RefreshCw, Save } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import type { Product, ProductVariant } from '@/types';

interface InventoryItem {
  product: Product;
  variants: ProductVariant[];
  totalStock: number;
  lowStockVariants: ProductVariant[];
}

export default function AdminInventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/admin/inventory');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setInventory(data.data);
        const inputs: Record<string, number> = {};
        data.data.forEach((item: InventoryItem) => {
          item.variants.forEach((v) => {
            inputs[v.id] = v.quantity;
          });
        });
        setStockInputs(inputs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (variantId: string, val: string) => {
    const num = parseInt(val, 10);
    setStockInputs((prev) => ({
      ...prev,
      [variantId]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSaveVariant = async (variantId: string) => {
    const qty = stockInputs[variantId];
    setUpdating(variantId);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          quantity: qty,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Stock updated to ${qty} units`);
        setTimeout(() => setSuccessMsg(null), 3000);
        await fetchInventory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">Warehouse Stock</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Inventory Matrix</h1>
          <p className="text-xs text-neutral-400 mt-1">Live stock controller for the launch catalogue</p>
        </div>

        <button
          onClick={fetchInventory}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs uppercase tracking-wider text-neutral-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stock
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-800 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-300 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Inventory Cards by Product */}
      <div className="space-y-8">
        {inventory.map((item) => (
          <div key={item.product.id} className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden">
            {/* Product header */}
            <div className="p-6 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/40">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Launch Item</span>
                <h2 className="text-lg font-bold text-white">{item.product.name}</h2>
                <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                  Price: {formatINR(item.product.pricePaise)} &bull; Silhouette: {item.product.fit}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[11px] text-neutral-400">Total Units in Stock</p>
                  <p className="text-xl font-bold font-mono text-white">{item.totalStock}</p>
                </div>
              </div>
            </div>

            {/* Variants table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900/80 text-neutral-400 font-mono uppercase text-[10px] tracking-wider border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-6">SKU</th>
                    <th className="py-3 px-6">Size</th>
                    <th className="py-3 px-6">Color</th>
                    <th className="py-3 px-6">Current Stock</th>
                    <th className="py-3 px-6">Status Indicator</th>
                    <th className="py-3 px-6 text-right">Update Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono">
                  {item.variants.map((v) => {
                    const isLow = v.quantity <= 5 && v.quantity > 0;
                    const isOut = v.quantity === 0;

                    return (
                      <tr key={v.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-4 px-6 font-bold text-white">{v.sku}</td>
                        <td className="py-4 px-6 font-bold text-base">{v.size}</td>
                        <td className="py-4 px-6 text-neutral-300 font-sans">{v.color}</td>
                        <td className="py-4 px-6">
                          <input
                            type="number"
                            min="0"
                            value={stockInputs[v.id] ?? v.quantity}
                            onChange={(e) => handleStockChange(v.id, e.target.value)}
                            className="w-24 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white text-center focus:outline-none focus:border-white font-mono"
                          />
                        </td>
                        <td className="py-4 px-6">
                          {isOut ? (
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock ({v.quantity})
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                              Optimal ({v.quantity})
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleSaveVariant(v.id)}
                            disabled={updating === v.id || stockInputs[v.id] === v.quantity}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-semibold text-[11px] rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Save className="w-3 h-3" />
                            {updating === v.id ? 'Saving...' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
