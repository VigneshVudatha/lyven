'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Size } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotalPaise: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem: CartItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.variantId === newItem.variantId
          );

          if (existingIndex >= 0) {
            const updated = [...state.items];
            const newQty = Math.min(5, updated[existingIndex].quantity + newItem.quantity);
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: newQty,
            };
            return { items: updated };
          }

          return { items: [...state.items, { ...newItem, quantity: Math.min(5, Math.max(1, newItem.quantity)) }] };
        });
      },

      removeItem: (variantId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId: string, quantity: number) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotalPaise: () => {
        return get().items.reduce(
          (sum, item) => sum + item.pricePaise * item.quantity,
          0
        );
      },
    }),
    {
      name: 'lyven-cart',
    }
  )
);
