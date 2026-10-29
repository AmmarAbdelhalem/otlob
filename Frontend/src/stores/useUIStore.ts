import { create } from 'zustand';
import { Product } from '../lib/api/types';

interface UIState {
  isMiniCartOpen: boolean;
  setMiniCartOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isVehicleFinderOpen: boolean;
  setVehicleFinderOpen: (open: boolean) => void;
  openGarageModal: () => void;
  isQuickViewOpen: boolean;
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  themePreset: string;
  setThemePreset: (preset: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMiniCartOpen: false,
  setMiniCartOpen: (open) => set({ isMiniCartOpen: open }),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  isVehicleFinderOpen: false,
  setVehicleFinderOpen: (open) => set({ isVehicleFinderOpen: open }),
  openGarageModal: () => set({ isVehicleFinderOpen: true }),
  isQuickViewOpen: false,
  quickViewProduct: null,
  openQuickView: (product) => set({ isQuickViewOpen: true, quickViewProduct: product }),
  closeQuickView: () => set({ isQuickViewOpen: false, quickViewProduct: null }),
  themePreset: 'default',
  setThemePreset: (preset) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-preset', preset);
    }
    set({ themePreset: preset });
  },
  isDarkMode: false,
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode;
      if (typeof document !== 'undefined') {
        if (next) {
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
          document.documentElement.classList.remove('dark');
        }
      }
      return { isDarkMode: next };
    }),
}));
