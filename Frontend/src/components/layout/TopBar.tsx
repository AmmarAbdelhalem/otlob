'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Phone, Mail, Truck, Globe, Moon, Sun } from 'lucide-react';
import { siteConfig } from '@/config/site.config';
import { Locale } from '@/lib/api/types';
import { getMessages } from '@/lib/i18n';
import { useUIStore } from '@/stores/useUIStore';

interface TopBarProps {
  locale: Locale;
}

export const TopBar: React.FC<TopBarProps> = ({ locale }) => {
  const t = getMessages(locale);
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, toggleDarkMode, themePreset, setThemePreset } = useUIStore();

  const toggleLanguage = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    const cleanPath = pathname.replace(/^\/(ar|en)/, '');
    router.push(`/${nextLocale}${cleanPath || ''}`);
  };

  return (
    <div className="w-full bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 hidden md:block">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left / Start: Contact and Free Delivery info */}
        <div className="flex items-center gap-6">
          <a
            href={`tel:${siteConfig.header.topBarContacts.phone}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold">{siteConfig.header.topBarContacts.phone}</span>
          </a>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Truck className="w-3.5 h-3.5 text-accent" />
            <span>{t.topBar.freeShippingPromo}</span>
          </div>
        </div>

        {/* Right / End: Switchers and links */}
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/order-tracking`}
            className="hover:text-white transition-colors"
          >
            {t.topBar.orderTracking}
          </Link>
          <span className="text-slate-700">|</span>

          {/* Theme Preset Selector */}
          <select
            value={themePreset}
            onChange={(e) => setThemePreset(e.target.value)}
            className="bg-slate-800 text-slate-300 rounded px-2 py-0.5 border border-slate-700 hover:border-slate-500 outline-none text-xs cursor-pointer"
            aria-label="Theme Preset"
          >
            <option value="default">Default Amber/Red</option>
            <option value="electric-blue">Electric Blue</option>
            <option value="emerald-speed">Emerald Speed</option>
          </select>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <span className="text-slate-700">|</span>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 font-semibold hover:text-white transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>{locale === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
