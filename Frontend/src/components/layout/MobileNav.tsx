'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Car, Heart, ShoppingBag, X, Store, ChevronRight } from 'lucide-react';
import { siteConfig } from '@/config/site.config';
import { Locale } from '@/lib/api/types';
import { getMessages, resolveLocalized } from '@/lib/i18n';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useUIStore } from '@/stores/useUIStore';

interface MobileNavProps {
  locale: Locale;
}

export const MobileNav: React.FC<MobileNavProps> = ({ locale }) => {
  const t = getMessages(locale);
  const pathname = usePathname();
  const { cart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const {
    isMobileMenuOpen,
    setMobileMenuOpen,
    setVehicleFinderOpen,
    setMiniCartOpen,
  } = useUIStore();

  const [activeTab, setActiveTab] = useState<'main' | 'categories'>('main');
  const [isSearchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  const categories = siteConfig.menus.categories.items || [];

  return (
    <>
      {/* 1. Sticky Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 start-0 end-0 z-40 bg-surface/95 backdrop-blur-md border-t border-surface-border py-2 px-3 flex items-center justify-around shadow-lg">
        {/* Shop / Home */}
        <Link
          href={`/${locale}`}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname === `/${locale}` ? 'text-primary font-bold' : 'text-text-muted hover:text-text'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{t.nav.home}</span>
        </Link>

        {/* Search Overlay Trigger */}
        <button
          onClick={() => setSearchOverlayOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-text-muted hover:text-text transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span>بحث</span>
        </button>

        {/* Vehicle Finder Trigger */}
        <button
          onClick={() => setVehicleFinderOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-text-muted hover:text-text transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center -mt-4 shadow-md">
            <Car className="w-4 h-4" />
          </div>
          <span>سيارتي</span>
        </button>

        {/* Wishlist */}
        <Link
          href={`/${locale}/wishlist`}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-text-muted hover:text-text relative transition-colors"
        >
          <Heart className="w-5 h-5" />
          {wishlistItems.length > 0 && (
            <span className="absolute -top-1 end-2 w-3.5 h-3.5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
              {wishlistItems.length}
            </span>
          )}
          <span>{t.nav.wishlist}</span>
        </Link>

        {/* Cart Drawer Trigger */}
        <button
          onClick={() => setMiniCartOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-text-muted hover:text-text relative transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5" />
          {cart.itemCount > 0 && (
            <span className="absolute -top-1 end-2 w-3.5 h-3.5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
              {cart.itemCount}
            </span>
          )}
          <span>{t.nav.cart}</span>
        </button>
      </div>

      {/* 2. Off-Canvas Drawer with Main / Category Tabs */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden animate-fadeIn">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 start-0 max-w-full flex pr-10">
            <div className="w-screen max-w-xs bg-surface border-e border-surface-border shadow-2xl flex flex-col justify-between animate-slideIn">
              {/* Drawer Top */}
              <div>
                <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-muted">
                  <span className="font-bold text-sm text-text">القائمة</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded text-text-muted hover:text-text"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 border-b border-surface-border text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('main')}
                    className={`py-3 text-center border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'main'
                        ? 'border-primary text-primary bg-surface'
                        : 'border-transparent text-text-muted bg-surface-muted'
                    }`}
                  >
                    القائمة الرئيسية
                  </button>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className={`py-3 text-center border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'categories'
                        ? 'border-primary text-primary bg-surface'
                        : 'border-transparent text-text-muted bg-surface-muted'
                    }`}
                  >
                    أقسام قطع الغيار
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-4 space-y-1">
                  {activeTab === 'main' ? (
                    <>
                      {siteConfig.menus.main.map((item) => (
                        <Link
                          key={item.id}
                          href={`/${locale}${item.href}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-2.5 px-3 rounded-lg text-xs font-semibold text-text hover:bg-surface-muted transition-colors"
                        >
                          <span>{resolveLocalized(item.title, locale)}</span>
                          <ChevronRight className="w-4 h-4 text-text-muted rtl-mirror" />
                        </Link>
                      ))}
                    </>
                  ) : (
                    <>
                      {categories.map((cat: any) => (
                        <div key={cat.id} className="border-b border-surface-border py-2">
                          <Link
                            href={`/${locale}${cat.href}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block font-bold text-xs text-text mb-1"
                          >
                            {resolveLocalized(cat.title, locale)}
                          </Link>
                          <div className="space-y-1 ps-3">
                            {cat.children?.map((sub: any) => (
                              <Link
                                key={sub.id}
                                href={`/${locale}${sub.href}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-xs text-text-muted hover:text-primary py-1"
                              >
                                • {resolveLocalized(sub.title, locale)}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Drawer Bottom */}
              <div className="p-4 border-t border-surface-border bg-surface-muted text-xs space-y-2">
                <Link
                  href={`/${locale}/order-tracking`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-bold text-text hover:text-primary"
                >
                  تتبع حالة طلبك
                </Link>
                <p className="text-text-muted text-[11px]">الخط الساخن: 19876</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Full-screen Search Overlay for Mobile */}
      {isSearchOverlayOpen && (
        <div className="fixed inset-0 z-50 bg-surface flex flex-col p-4 animate-fadeIn">
          <div className="flex items-center gap-2 pb-4 border-b border-surface-border">
            <input
              type="text"
              autoFocus
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              placeholder={t.common.searchPlaceholder}
              className="flex-1 text-sm px-3 py-2.5 rounded-lg bg-surface-muted border border-surface-border text-text outline-none focus:border-primary"
            />
            <button
              onClick={() => setSearchOverlayOpen(false)}
              className="p-2 text-text font-bold text-xs cursor-pointer"
            >
              إلغاء
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <p className="text-xs text-text-muted">
              اكتب اسم القطعة، الموديل، كود الشاسيه VIN، أو رقم OEM للبحث السريع...
            </p>
          </div>
        </div>
      )}
    </>
  );
};
