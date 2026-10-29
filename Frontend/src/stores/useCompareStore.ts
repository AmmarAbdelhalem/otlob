import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../lib/api/types';

interface CompareState {
  items: Product[];
  addItem: (product: Product) => boolean;
  removeItem: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  toggleCompare: (product: Product) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product) => {
        const { items } = get();
        if (items.some((p) => p.id === product.id)) return false;
        if (items.length >= 4) {
          // Limit to max 4 products for comparative table
          return false;
        }
        set({ items: [...items, product] });
        return true;
      },
      removeItem: (productId: string) => {
        set({ items: get().items.filter((p) => p.id !== productId) });
      },
      isInCompare: (productId: string) => {
        return get().items.some((p) => p.id === productId);
      },
      toggleCompare: (product: Product) => {
        const inCompare = get().isInCompare(product.id);
        if (inCompare) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
      clearCompare: () => set({ items: [] }),
    }),
    {
      name: 'otlob_compare_storage',
    }
  )
);
