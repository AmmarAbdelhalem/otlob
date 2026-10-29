'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Palette,
  X,
  Sun,
  Moon,
  Laptop,
  Check,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Languages,
} from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { useUIStore } from '@/stores/useUIStore';

interface ThemeCustomizerDrawerProps {
  locale: Locale;
}

const PRESETS = [
  {
    id: 'default',
    nameAr: 'سباق السيارات الافتراضي',
    nameEn: 'Racing Amber (Default)',
    primaryColor: '#e53e3e',
    accentColor: '#f59e0b',
  },
  {
    id: 'electric-blue',
    nameAr: 'أزرق كهربائي تقني',
    nameEn: 'Electric Blue Tech',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
  },
  {
    id: 'emerald-speed',
    nameAr: 'أخضر سباقات بريطاني',
    nameEn: 'Emerald Speed Green',
    primaryColor: '#059669',
    accentColor: '#10b981',
  },
  {
    id: 'monochrome-luxe',
    nameAr: 'أسود وبلاتينيوم فاخر',
    nameEn: 'Monochrome Luxe',
    primaryColor: '#18181b',
    accentColor: '#71717a',
  },
];

const RADIUS_OPTIONS = [
  { id: 'none', label: '0' },
  { id: 'sm', label: '4px' },
  { id: 'md', label: '8px' },
  { id: 'lg', label: '12px' },
  { id: 'full', label: 'Pill' },
];

export const ThemeCustomizerDrawer: React.FC<ThemeCustomizerDrawerProps> = ({ locale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState('default');
  const [activeRadius, setActiveRadius] = useState('md');
  const [activeMode, setActiveMode] = useState<'light' | 'dark' | 'system'>('system');

  const { isDarkMode, toggleDarkMode } = useUIStore();
  const pathname = usePathname();
  const router = useRouter();

  // Load stored preferences on mount
  useEffect(() => {
    const savedPreset = localStorage.getItem('otlob_theme_preset') || 'default';
    const savedRadius = localStorage.getItem('otlob_theme_radius') || 'md';
    const savedMode = (localStorage.getItem('otlob_theme_mode') as any) || 'system';

    setActivePreset(savedPreset);
    setActiveRadius(savedRadius);
    setActiveMode(savedMode);

    applyPreset(savedPreset);
    applyRadius(savedRadius);
    applyMode(savedMode);
  }, []);

  const applyPreset = (presetId: string) => {
    setActivePreset(presetId);
    document.documentElement.setAttribute('data-preset', presetId);
    localStorage.setItem('otlob_theme_preset', presetId);
  };

  const applyRadius = (radiusId: string) => {
    setActiveRadius(radiusId);
    document.documentElement.setAttribute('data-radius', radiusId);
    localStorage.setItem('otlob_theme_radius', radiusId);
  };

  const applyMode = (mode: 'light' | 'dark' | 'system') => {
    setActiveMode(mode);
    localStorage.setItem('otlob_theme_mode', mode);

    let isDark = false;
    if (mode === 'dark') {
      isDark = true;
    } else if (mode === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
    }
  };

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  const resetDefaults = () => {
    applyPreset('default');
    applyRadius('md');
    applyMode('system');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 end-5 z-40 w-12 h-12 rounded-full bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group border-2 border-white/40"
        title={locale === 'ar' ? 'تخصيص المظهر والثيم' : 'Customize Theme'}
      >
        <Palette className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          <aside className="absolute inset-y-0 end-0 max-w-sm w-full bg-bg-primary border-s border-border-color shadow-2xl flex flex-col z-10 animate-in slide-in-from-end duration-300">
            {/* Header */}
            <div className="p-5 border-b border-border-color flex items-center justify-between bg-bg-secondary/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-text-main">
                    {locale === 'ar' ? 'لوحة تخصيص المظهر' : 'Live Theme Customizer'}
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    {locale === 'ar' ? 'التحكم الفوري في الرموز والألوان' : 'Real-time design token controls'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controls Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* Presets Grid */}
              <div className="space-y-3">
                <span className="font-bold text-text-main block">
                  {locale === 'ar' ? 'حزمة الألوان (Theme Presets):' : 'Color Presets:'}
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  {PRESETS.map((p) => {
                    const isSelected = activePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p.id)}
                        className={`p-3 rounded-xl border-2 text-start transition-all relative ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-xs'
                            : 'border-border-color bg-bg-secondary/30 hover:border-text-muted'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: p.primaryColor }}
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: p.accentColor }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-text-main block line-clamp-1">
                          {locale === 'ar' ? p.nameAr : p.nameEn}
                        </span>

                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-primary absolute top-2.5 end-2.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dark Mode Switcher */}
              <div className="space-y-3">
                <span className="font-bold text-text-main block">
                  {locale === 'ar' ? 'وضع السطوع (Appearance):' : 'Appearance Mode:'}
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'light', labelAr: 'نهاري', labelEn: 'Light', icon: Sun },
                    { id: 'dark', labelAr: 'ليلي', labelEn: 'Dark', icon: Moon },
                    { id: 'system', labelAr: 'تلقائي', labelEn: 'System', icon: Laptop },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = activeMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => applyMode(m.id as any)}
                        className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-xs'
                            : 'border-border-color bg-bg-secondary/30 text-text-muted hover:border-text-main'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{locale === 'ar' ? m.labelAr : m.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Border Radius Presets */}
              <div className="space-y-3">
                <span className="font-bold text-text-main block">
                  {locale === 'ar' ? 'استدارة الحواف (Border Radius):' : 'Corner Rounding:'}
                </span>

                <div className="flex gap-2">
                  {RADIUS_OPTIONS.map((r) => {
                    const isSelected = activeRadius === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => applyRadius(r.id)}
                        className={`flex-1 py-1.5 rounded-lg border text-center font-bold text-xs transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-xs'
                            : 'border-border-color bg-bg-secondary/30 text-text-muted hover:border-text-main'
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Locale / Direction Switcher */}
              <div className="space-y-3">
                <span className="font-bold text-text-main block">
                  {locale === 'ar' ? 'اللغة والاتجاه (Language / RTL):' : 'Language & Direction:'}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => switchLocale('ar')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                      locale === 'ar'
                        ? 'border-primary bg-primary text-white'
                        : 'border-border-color bg-bg-secondary/30 text-text-muted hover:border-text-main'
                    }`}
                  >
                    <span>العربية (RTL)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => switchLocale('en')}
                    className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                      locale === 'en'
                        ? 'border-primary bg-primary text-white'
                        : 'border-border-color bg-bg-secondary/30 text-text-muted hover:border-text-main'
                    }`}
                  >
                    <span>English (LTR)</span>
                  </button>
                </div>
              </div>

              {/* Dev Sandbox Link */}
              <div className="pt-3 border-t border-border-color space-y-2">
                <Link
                  href={`/${locale}/dev/playground`}
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary hover:bg-bg-secondary/80 border border-border-color font-bold text-text-main flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>{locale === 'ar' ? 'فتح لوحة الاختبارات (Playground)' : 'Open Dev Playground'}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>

                <button
                  type="button"
                  onClick={resetDefaults}
                  className="w-full py-2 px-3 text-[11px] text-text-muted hover:text-rose-500 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{locale === 'ar' ? 'استعادة الإعدادات الافتراضية' : 'Reset to Defaults'}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
