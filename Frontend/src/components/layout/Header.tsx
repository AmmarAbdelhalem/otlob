'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Input,
  Button,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Select,
  SelectItem,
  Spinner,
} from '@heroui/react';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  ChevronDown,
  Store,
  Truck,
  LayoutDashboard,
  LogOut,
  Car,
} from 'lucide-react';
import { siteConfig } from '@/config/site.config';
import { Locale, Product, Category } from '@/lib/api/types';
import { getMessages, formatMoney, resolveLocalized } from '@/lib/i18n';
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
  const { setMiniCartOpen, setMobileMenuOpen } = useUIStore();
  const { user, initializeAuth, logout } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAuth();
    // Live dynamic fetch of categories from Filament CMS
    services.catalog.getCategories().then((cats) => {
      if (Array.isArray(cats)) {
        setCategories(cats);
      }
    });
  }, [initializeAuth]);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await services.search.liveSearch(searchQuery, 5);
        setSuggestions(res.products);
      } finally {
        setIsSearching(false);
      }
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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    router.push(
      `/${locale}/shop?q=${encodeURIComponent(searchQuery.trim())}${
        selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''
      }`
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-black/85 backdrop-blur-md border-b border-[#262626] transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Mobile menu trigger + Logo */}
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => setMobileMenuOpen(true)}
            className="text-neutral-400 hover:text-white lg:hidden min-w-8 w-8 h-8"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-dark.svg"
              alt={siteConfig.brand.name[locale]}
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
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
            className="flex items-center rounded-xl border border-[#262626] bg-[#0a0a0a] focus-within:border-neutral-500 transition-all overflow-hidden"
          >
            {/* Category Select - Live CMS Powered */}
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="hidden xl:block bg-[#111111] text-[11px] font-medium px-3 py-2.5 border-e border-[#262626] outline-none text-neutral-300 cursor-pointer hover:bg-[#1a1a1a]"
              >
                <option value="">{t.common.allCategories}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {resolveLocalized(cat.name, locale)}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={t.common.searchPlaceholder}
              className="flex-1 px-4 py-2 text-xs text-white bg-transparent outline-none placeholder:text-neutral-500"
            />

            <Button
              type="submit"
              size="sm"
              variant="flat"
              className="rounded-none h-9 px-4 bg-white text-black hover:bg-neutral-200 font-bold text-xs"
              aria-label="Search"
            >
              {isSearching ? <Spinner size="sm" color="current" /> : <Search className="w-4 h-4" />}
            </Button>
          </form>

          {/* Suggestions Dropdown Overlay */}
          {isSearchFocused && (searchQuery.length >= 2 || suggestions.length > 0) && (
            <div className="absolute start-0 end-0 top-full mt-2 bg-[#0a0a0a] rounded-xl shadow-2xl border border-[#262626] overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                  <Spinner size="sm" color="white" />
                  <span>{t.common.loading}</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="divide-y divide-[#262626]">
                  <div className="px-3 py-2 bg-[#111111] text-[10px] font-bold text-neutral-400 uppercase font-mono">
                    {locale === 'ar' ? 'نتائج مقترحة من قاعدة البيانات' : 'Suggested Database Matches'}
                  </div>
                  {suggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/${locale}/product/${item.sku}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="p-3 flex items-center gap-3 hover:bg-[#141414] transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#171717] border border-[#262626] overflow-hidden shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnail || '/images/products/brake-pads.svg'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                        <span className="text-[11px] font-mono text-neutral-400">SKU: {item.sku}</span>
                      </div>
                      <span className="text-xs font-bold text-white font-mono shrink-0">
                        {formatMoney(item.price, locale)}
                      </span>
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full py-2.5 text-center text-xs font-semibold text-white hover:bg-[#141414] bg-[#0a0a0a] cursor-pointer transition-colors"
                  >
                    {locale === 'ar' ? `عرض جميع النتائج لـ "${searchQuery}"` : `View all results for "${searchQuery}"`}
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-neutral-400">{t.common.empty}</div>
              )}
            </div>
          )}
        </div>

        {/* User Actions (Wishlist, Account Dropdown, Cart) */}
        <div className="flex items-center gap-2">
          {/* Wishlist */}
          <Badge
            content={wishlistItems.length}
            isInvisible={wishlistItems.length === 0}
            shape="circle"
            color="primary"
            size="sm"
            classNames={{ badge: 'bg-white text-black font-bold text-[10px]' }}
          >
            <Button
              as={Link}
              href={`/${locale}/wishlist`}
              isIconOnly
              variant="light"
              size="sm"
              className="text-neutral-400 hover:text-white rounded-xl min-w-9 w-9 h-9 border border-transparent hover:border-[#262626]"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" />
            </Button>
          </Badge>

          {/* Account Dropdown */}
          {user ? (
            <Dropdown
              placement="bottom-end"
              classNames={{
                content: 'bg-[#0a0a0a] border border-[#262626] text-neutral-200 min-w-56',
              }}
            >
              <DropdownTrigger>
                <button
                  type="button"
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-neutral-200 hover:bg-[#141414] transition-colors cursor-pointer border border-[#262626]"
                  aria-label="User Menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs shrink-0">
                    {user.name.trim().charAt(0)}
                  </div>
                  <div className="hidden xl:block text-start text-xs leading-tight min-w-0">
                    <span className="font-bold text-white truncate block max-w-[90px]">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-neutral-400 block font-mono capitalize">
                      {user.role === 'merchant'
                        ? 'تاجر معتمد'
                        : user.role === 'courier'
                        ? 'مندوب'
                        : user.role === 'admin'
                        ? 'مدير المنصة'
                        : 'عميل'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:block" />
                </button>
              </DropdownTrigger>

              <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownSection showDivider>
                  <DropdownItem key="profile-header" isReadOnly className="opacity-100 cursor-default">
                    <span className="text-[10px] text-neutral-400 block font-mono">
                      {locale === 'ar' ? 'الحساب المسجل' : 'Signed in as'}
                    </span>
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-neutral-400 font-mono truncate">{user.phone || user.email}</p>
                  </DropdownItem>
                </DropdownSection>

                {user.role === 'merchant' ? (
                  <DropdownItem
                    key="vendor-dashboard"
                    startContent={<Store className="w-4 h-4 text-white" />}
                    as={Link}
                    href={`/${locale}/vendor/dashboard`}
                    className="text-white font-semibold"
                  >
                    {locale === 'ar' ? 'لوحة تحكم المتجر (Vendor)' : 'Vendor Dashboard'}
                  </DropdownItem>
                ) : null}

                {user.role === 'courier' ? (
                  <DropdownItem
                    key="courier-dashboard"
                    startContent={<Truck className="w-4 h-4 text-emerald-400" />}
                    as={Link}
                    href={`/${locale}/courier/dashboard`}
                    className="text-emerald-400 font-semibold"
                  >
                    {locale === 'ar' ? 'تطبيق المندوب (Courier)' : 'Courier Dashboard'}
                  </DropdownItem>
                ) : null}

                {user.role === 'admin' ? (
                  <DropdownItem
                    key="admin-filament"
                    startContent={<LayoutDashboard className="w-4 h-4 text-purple-400" />}
                    as="a"
                    href={
                      process.env.NEXT_PUBLIC_BACKEND_URL
                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin`
                        : 'http://localhost:8000/admin'
                    }
                    className="text-purple-400 font-semibold"
                  >
                    {locale === 'ar' ? 'لوحة تحكم الإدارة (Filament)' : 'Filament CMS Admin'}
                  </DropdownItem>
                ) : null}

                <DropdownItem
                  key="account-garage"
                  startContent={<Car className="w-4 h-4 text-neutral-400" />}
                  as={Link}
                  href={`/${locale}/account`}
                  className="text-neutral-300"
                >
                  {locale === 'ar' ? 'حسابي وجراج السيارات' : 'Account & Garage'}
                </DropdownItem>

                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<LogOut className="w-4 h-4 rtl:rotate-180" />}
                  onPress={() => logout()}
                  className="text-rose-400"
                >
                  {locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Button
              as={Link}
              href={`/${locale}/auth/login`}
              variant="flat"
              size="sm"
              className="bg-[#111111] hover:bg-[#1a1a1a] text-neutral-200 border border-[#262626] text-xs font-semibold px-3"
              startContent={<User className="w-4 h-4 text-neutral-400" />}
            >
              <span>{t.nav.login}</span>
            </Button>
          )}

          {/* Cart Trigger */}
          <Badge
            content={cart.itemCount}
            isInvisible={cart.itemCount === 0}
            shape="circle"
            color="primary"
            size="sm"
            classNames={{ badge: 'bg-white text-black font-bold text-[10px]' }}
          >
            <Button
              onPress={() => setMiniCartOpen(true)}
              variant="flat"
              size="sm"
              className="bg-[#111111] hover:bg-[#1a1a1a] text-white border border-[#262626] font-semibold text-xs px-3"
              startContent={<ShoppingCart className="w-4 h-4" />}
            >
              <span className="hidden sm:inline font-mono">{formatMoney(cart.totalAmount, locale)}</span>
            </Button>
          </Badge>
        </div>
      </div>
    </header>
  );
};
