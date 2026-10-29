'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Heart, ShoppingCart, User, Menu, ChevronDown, Check, ArrowRight, Store, Truck, LayoutDashboard, LogOut } from 'lucide-react';
import { siteConfig } from '@/config/site.config';
import { Locale, Product } from '@/lib/api/types';
import { getMessages, formatMoney } from '@/lib/i18n';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { VehicleFinder } from './VehicleFinder';
import { services } from '@/lib/api';

interface HeaderProps {
  locale: Locale;
}

export const Header: React.FC<HeaderProps> = ({ locale }) => {
  const t = getMessages(locale);
  const router = useRouter();
  const { cart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { setMiniCartOpen, setMobileMenuOpen, isDarkMode } = useUIStore();
  const { user, initializeAuth, logout } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await services.search.liveSearch(searchQuery, 5);
      setSuggestions(res.products);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    router.push(
      `/${locale}/shop?q=${encodeURIComponent(searchQuery.trim())}${
        selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''
      }`
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-surface-border shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        {/* Mobile menu trigger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted lg:hidden cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isDarkMode ? '/images/logo-dark.svg' : '/images/logo-light.svg'}
              alt={siteConfig.brand.name[locale]}
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Vehicle Finder Widget */}
        <div className="hidden lg:block">
          <VehicleFinder locale={locale} />
        </div>

        {/* Search Bar with Category Dropdown & Suggestions */}
        <div ref={searchContainerRef} className="flex-1 max-w-2xl relative hidden md:block">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center rounded-xl border-2 border-primary/20 focus-within:border-primary bg-surface transition-all overflow-hidden shadow-xs"
          >
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="hidden xl:block bg-surface-muted text-xs font-semibold px-3 py-2.5 border-e border-surface-border outline-none text-text cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <option value="">{t.common.allCategories}</option>
              <option value="brakes">الفرامل (Brakes)</option>
              <option value="engine">المحرك (Engine)</option>
              <option value="suspension">العفشة (Suspension)</option>
              <option value="electrical">الكهرباء (Electrical)</option>
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={t.common.searchPlaceholder}
              className="flex-1 px-4 py-2.5 text-xs text-text bg-transparent outline-none"
            />

            <button
              type="submit"
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Suggestions Dropdown Overlay */}
          {isSearchFocused && (searchQuery.length >= 2 || suggestions.length > 0) && (
            <div className="absolute start-0 end-0 top-full mt-1.5 bg-surface rounded-xl shadow-2xl border border-surface-border overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-text-muted">{t.common.loading}</div>
              ) : suggestions.length > 0 ? (
                <div className="divide-y divide-surface-border">
                  <div className="px-3 py-2 bg-surface-muted text-[11px] font-bold text-text-muted uppercase">
                    نتائج مقترحة
                  </div>
                  {suggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/${locale}/product/${item.sku}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="p-3 flex items-center gap-3 hover:bg-surface-muted transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnail || '/images/products/brake-pads.svg'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-text truncate">{item.name}</p>
                        <span className="text-[11px] font-mono text-text-muted">{item.sku}</span>
                      </div>
                      <span className="text-xs font-bold text-primary shrink-0">
                        {formatMoney(item.price, locale)}
                      </span>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 text-center text-xs font-bold text-primary hover:underline bg-surface-muted cursor-pointer"
                  >
                    عرض جميع النتائج لـ &ldquo;{searchQuery}&rdquo;
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-text-muted">{t.common.empty}</div>
              )}
            </div>
          )}
        </div>

        {/* User Actions (Wishlist, Account, Cart) */}
        <div className="flex items-center gap-3">
          {/* Wishlist */}
          <Link
            href={`/${locale}/wishlist`}
            className="relative p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistItems.length > 0 && (
              <span className="absolute top-1 end-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Account & Role Switcher */}
          {user ? (
            <div className="relative group">
              <button
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-text hover:bg-surface-muted transition-colors cursor-pointer border border-border-color"
                aria-label="User Menu"
              >
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name.trim().charAt(0)}
                </div>
                <div className="hidden xl:block text-start text-xs leading-tight min-w-0">
                  <span className="font-bold text-text truncate block max-w-[100px]">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-primary block font-medium capitalize">
                    {user.role === 'merchant'
                      ? 'تاجر معتمد'
                      : user.role === 'courier'
                      ? 'مندوب'
                      : user.role === 'admin'
                      ? 'مدير'
                      : 'عميل'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute end-0 top-full mt-1.5 w-60 bg-surface rounded-2xl shadow-2xl border border-surface-border p-2 hidden group-hover:block group-focus-within:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3 py-2 border-b border-surface-border mb-1">
                  <span className="text-[10px] text-text-muted block">الحساب المسجل</span>
                  <p className="text-xs font-bold text-text truncate">{user.name}</p>
                  <p className="text-[11px] text-text-muted font-mono truncate">{user.phone || user.email}</p>
                </div>

                {/* Vendor Dashboard Switch */}
                {user.role === 'merchant' && (
                  <Link
                    href={`/${locale}/vendor/dashboard`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors my-1"
                  >
                    <Store className="w-4 h-4 shrink-0" />
                    <span>لوحة تحكم المتجر (Vendor)</span>
                  </Link>
                )}

                {/* Courier Dashboard Switch */}
                {user.role === 'courier' && (
                  <Link
                    href={`/${locale}/courier/dashboard`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-colors my-1"
                  >
                    <Truck className="w-4 h-4 shrink-0" />
                    <span>تطبيق المندوب (Courier)</span>
                  </Link>
                )}

                {/* Backend Filament / Livewire Admin Portal */}
                {user.role === 'admin' && (
                  <a
                    href={process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin` : 'http://localhost:8000/admin'}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 transition-colors my-1"
                  >
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span>لوحة تحكم الإدارة (Filament CMS)</span>
                  </a>
                )}

                <Link
                  href={`/${locale}/account`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-text hover:bg-surface-muted transition-colors"
                >
                  <User className="w-4 h-4 text-text-muted shrink-0" />
                  <span>{locale === 'ar' ? 'حسابي وجراج السيارات' : 'Account & Garage'}</span>
                </Link>

                <div className="border-t border-surface-border mt-1 pt-1">
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-start"
                  >
                    <LogOut className="w-4 h-4 shrink-0 rtl:rotate-180" />
                    <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href={`/${locale}/auth/login`}
              className="flex items-center gap-2 p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-muted transition-colors"
              aria-label="Sign In"
            >
              <User className="w-5 h-5" />
              <div className="hidden xl:block text-start text-xs leading-tight">
                <span className="text-text-muted block text-[10px]">{t.nav.account}</span>
                <span className="font-bold text-text">{t.nav.login}</span>
              </div>
            </Link>
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setMiniCartOpen(true)}
            className="flex items-center gap-2.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-xl transition-colors cursor-pointer group"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1.5 -end-1.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-start text-xs leading-tight">
              <span className="text-text-muted block text-[10px]">{t.nav.cart}</span>
              <span className="font-black text-text">{formatMoney(cart.totalAmount, locale)}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
