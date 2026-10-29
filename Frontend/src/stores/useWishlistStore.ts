import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../lib/api/types';

interface WishlistState {
  items: Product[];
  toggleItem: (product: Product) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product: Product) => {
        const { items } = get();
        const exists = items.some((p) => p.id === product.id);
        if (exists) {
          set({ items: items.filter((p) => p.id !== product.id) });
        } else {
          set({ items: [...items, product] });
        }
      },
      toggleWishlist: (product: Product) => {
        get().toggleItem(product);
      },
      isInWishlist: (productId: string) => {
        return get().items.some((p) => p.id === productId);
      },
      removeItem: (productId: string) => {
        set({ items: get().items.filter((p) => p.id !== productId) });
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'otlob_wishlist_storage',
    }
  )
);
