'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, ChevronRight, Flame, Sparkles, Percent } from 'lucide-react';
import { siteConfig } from '@/config/site.config';
import { Locale } from '@/lib/api/types';
import { getMessages, resolveLocalized } from '@/lib/i18n';

interface MegaMenuProps {
  locale: Locale;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ locale }) => {
  const t = getMessages(locale);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);

  const categories = siteConfig.menus.categories.items || [];
  const currentCategory = categories[activeCategoryIdx];

  return (
    <nav className="w-full bg-surface border-b border-surface-border text-xs hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left: "All Categories" Button with Dropdown Mega Panel */}
        <div className="relative">
          <button
            onMouseEnter={() => setIsCategoryOpen(true)}
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center gap-2.5 bg-primary text-white font-bold py-3 px-5 rounded-t-lg transition-colors cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">{t.common.allCategories}</span>
            <ChevronDown className="w-3.5 h-3.5 ms-1" />
          </button>

          {/* Mega Panel Dropdown */}
          {isCategoryOpen && (
            <div
              onMouseLeave={() => setIsCategoryOpen(false)}
              className="absolute start-0 top-full w-[720px] bg-surface rounded-b-xl shadow-2xl border border-surface-border grid grid-cols-12 z-50 overflow-hidden animate-fadeIn"
            >
              {/* Level 1: Categories List */}
              <div className="col-span-5 bg-surface-muted border-e border-surface-border py-2">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setActiveCategoryIdx(idx)}
                    className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      activeCategoryIdx === idx
                        ? 'bg-surface font-bold text-primary border-s-4 border-primary'
                        : 'text-text hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Link href={`/${locale}${cat.href}`} className="flex-1 truncate">
                      {resolveLocalized(cat.title, locale)}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted rtl-mirror" />
                  </div>
                ))}
              </div>

              {/* Level 2 & 3: Subcategories and Quick Shortcuts */}
              <div className="col-span-7 p-6 bg-surface flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-text border-b border-surface-border pb-2 mb-3">
                    {currentCategory && resolveLocalized(currentCategory.title, locale)}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {currentCategory?.children?.map((sub: any) => (
                      <Link
                        key={sub.id}
                        href={`/${locale}${sub.href}`}
                        className="text-xs text-text-muted hover:text-primary transition-colors block py-1 font-medium"
                      >
                        {resolveLocalized(sub.title, locale)}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Quick Promo Strip inside mega menu */}
                <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between text-[11px] text-text-muted">
                  <div className="flex items-center gap-1.5 text-danger font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>عروض وتخفيضات تصل إلى 30%</span>
                  </div>
                  <Link href={`/${locale}/shop?deals=true`} className="text-primary hover:underline font-bold">
                    عرض جميع الصفقات
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Main Nav Links */}
        <div className="flex items-center gap-6 font-semibold text-text">
          {siteConfig.menus.main.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}${item.href}`}
              className="py-3 hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <span>{resolveLocalized(item.title, locale)}</span>
              {item.badge && (
                <span className="bg-danger text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {resolveLocalized(item.badge.text, locale)}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Right: Quick Deals Link */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/shop?on_sale=true`}
            className="flex items-center gap-1.5 text-xs font-bold text-danger hover:opacity-80 transition-opacity"
          >
            <Percent className="w-3.5 h-3.5 text-danger animate-pulse" />
            <span>عروض اليوم الحصرية</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
