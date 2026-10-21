'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  pricePaise: number;
  fit: string;
  category: string;
  image: string;
  addedAt: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  getItemCount: () => number;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) {
            return state;
          }
          const newItem: WishlistItem = {
            id: product.id,
            slug: product.slug,
            name: product.name,
            pricePaise: product.pricePaise,
            fit: product.fit,
            category: product.category,
            image: product.images[0]?.url || '/products/virat-kohli-front.svg',
            addedAt: new Date().toISOString(),
          };
          return { items: [newItem, ...state.items] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      toggleItem: (product: Product) => {
        const { isInWishlist, addItem, removeItem } = get();
        if (isInWishlist(product.id)) {
          removeItem(product.id);
        } else {
          addItem(product);
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      getItemCount: () => {
        return get().items.length;
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'lyven-wishlist',
    }
  )
);
