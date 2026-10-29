import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useCartStore } from './useCartStore';

export interface UserSession {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'customer' | 'merchant' | 'courier' | 'admin';
  status: 'active' | 'pending' | 'suspended';
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserSession | null) => void;
  initializeAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user, isLoading: false });
        if (user) {
          useCartStore.getState().syncWithBackend().catch(() => {});
        }
      },

      initializeAuth: async () => {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const json = await res.json();
            if (json.data) {
              set({ user: json.data, isAuthenticated: true, isLoading: false });
              useCartStore.getState().syncWithBackend().catch(() => {});
              return;
            }
          }
        } catch {
          // Graceful fallback to cached user or unauthenticated
        }
        // If request failed and no cookie exists, mark unauthenticated
        if (typeof document !== 'undefined') {
          const match = document.cookie.match(/otlob_user=([^;]+)/);
          if (match) {
            try {
              const parsed = JSON.parse(decodeURIComponent(match[1]));
              set({ user: parsed, isAuthenticated: true, isLoading: false });
              return;
            } catch {}
          }
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false });
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }
      },
    }),
    {
      name: 'otlob_auth_session',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
