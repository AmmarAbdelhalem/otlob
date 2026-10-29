'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Palette,
  Car,
  LayoutGrid,
  Columns,
  Eye,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { Locale, Product } from '@/lib/api/types';
import { siteConfig } from '@/config/site.config';
import { useGarageStore } from '@/stores/useGarageStore';
import { ProductCard } from '@/components/product/ProductCard';
import { mockProducts } from '@/lib/api/mock/data';

interface PlaygroundPageProps {
  params: Promise<{ locale: string }>;
}

export default function DevPlaygroundPage({ params }: PlaygroundPageProps) {
  const [locale, setLocale] = useState<Locale>('ar');
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [shopLayout, setShopLayout] = useState<'left-sidebar' | 'right-sidebar' | 'wide' | 'top-filters'>('left-sidebar');
  const [columnCount, setColumnCount] = useState<number>(4);
  const [cardVariant, setCardVariant] = useState<'grid' | 'list' | 'compact'>('grid');

  const { activeVehicle, setActiveVehicle } = useGarageStore();

  useEffect(() => {
    params.then((p) => {
      setLocale((p.locale === 'en' ? 'en' : 'ar') as Locale);
    });
  }, [params]);

  // Apply theme to document data-theme
  const handleThemeChange = (themeName: string) => {
    setCurrentTheme(themeName);
    document.documentElement.setAttribute('data-theme', themeName);
    if (themeName === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const sampleProducts: Product[] = mockProducts.slice(0, 6);

  const testVehicles = [
    { label: 'None (Guest / No Vehicle)', value: null },
    {
      label: 'Toyota Corolla 2020 (Matches Front Brake Pads)',
      value: {
        id: 'veh-toyota-1',
        userId: 'dev',
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
      },
    },
    {
      label: 'Hyundai Elantra HD 2018 (Matches Oil Filter)',
      value: {
        id: 'veh-hyundai-1',
        userId: 'dev',
        make: 'Hyundai',
        model: 'Elantra HD',
        year: 2018,
      },
    },
    {
      label: 'Fiat Tipo 2021 (Incompatible with Toyota/Hyundai)',
      value: {
        id: 'veh-fiat-1',
        userId: 'dev',
        make: 'Fiat',
        model: 'Tipo',
        year: 2021,
      },
    },
  ];

  return (
    <div className="py-8 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-bg-secondary to-accent/10 border border-primary/20 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary text-white">
              <Sparkles className="w-3.5 h-3.5" />
              Dev & Quality Assurance Sandbox
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-text-main">
              Partdo Storefront Architecture & Theme Playground
            </h1>
            <p className="text-xs sm:text-sm text-text-muted">
              Live interactive tester for theme tokens, vehicle fitment simulator, card variants, and catalog layouts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/shop?layout=${shopLayout}&cols=${columnCount}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-md transition-all"
            >
              <span>{locale === 'ar' ? 'عرض المتجر بالإعدادات الحالية' : 'Open Shop with Settings'}</span>
              <ExternalLink className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Control 1: Theme Presets */}
        <div className="p-5 rounded-2xl bg-bg-secondary/40 border border-border-color space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-text-main">
            <Palette className="w-4 h-4 text-primary" />
            <span>Theme Tokens Preset</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {['default', 'dark', 'auto-racing', 'clean-corporate'].map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => handleThemeChange(theme)}
                className={`py-2 px-3 rounded-xl border text-center font-bold capitalize transition-all ${
                  currentTheme === theme
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-border-color bg-bg-primary text-text-muted hover:border-text-main'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Control 2: Active Garage Vehicle Simulator */}
        <div className="p-5 rounded-2xl bg-bg-secondary/40 border border-border-color space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-text-main">
            <Car className="w-4 h-4 text-emerald-600" />
            <span>Vehicle Fitment Simulator</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {testVehicles.map((v, i) => {
              const isSelected = activeVehicle?.make === v.value?.make && activeVehicle?.model === v.value?.model;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveVehicle(v.value as any)}
                  className={`w-full py-2 px-2.5 rounded-lg border text-start truncate transition-all ${
                    (v.value === null && !activeVehicle) || isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold'
                      : 'border-border-color bg-bg-primary text-text-muted hover:border-text-muted'
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Control 3: Shop Layout Variants */}
        <div className="p-5 rounded-2xl bg-bg-secondary/40 border border-border-color space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-text-main">
            <LayoutGrid className="w-4 h-4 text-amber-500" />
            <span>Shop Layout Template</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(['left-sidebar', 'right-sidebar', 'wide', 'top-filters'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setShopLayout(l)}
                className={`py-2 px-2 rounded-xl border text-center font-medium transition-all ${
                  shopLayout === l
                    ? 'border-amber-500 bg-amber-500 text-white font-bold'
                    : 'border-border-color bg-bg-primary text-text-muted hover:border-text-main'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Control 4: Card View & Columns */}
        <div className="p-5 rounded-2xl bg-bg-secondary/40 border border-border-color space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-text-main">
            <Columns className="w-4 h-4 text-sky-500" />
            <span>Card Variant & Columns</span>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex gap-1.5">
              {(['grid', 'list', 'compact'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setCardVariant(v)}
                  className={`flex-1 py-1.5 rounded-lg border text-center font-bold capitalize transition-all ${
                    cardVariant === v
                      ? 'border-sky-500 bg-sky-500 text-white'
                      : 'border-border-color bg-bg-primary text-text-muted'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-1 pt-1">
              <span className="text-text-muted font-medium">Cols:</span>
              {[2, 3, 4, 5, 6].map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColumnCount(col)}
                  className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center transition-all ${
                    columnCount === col
                      ? 'border-primary bg-primary text-white'
                      : 'border-border-color bg-bg-primary text-text-muted'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active State HUD */}
      <div className="p-4 rounded-xl border border-border-color bg-bg-primary text-xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Active Theme:</span>
            <span className="font-bold text-primary font-mono">{currentTheme}</span>
          </div>
          <span className="text-border-color">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Active Garage Vehicle:</span>
            <span className="font-bold text-emerald-600 font-mono">
              {activeVehicle ? `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}` : 'None'}
            </span>
          </div>
          <span className="text-border-color">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted">Target Shop URL:</span>
            <span className="font-mono text-text-main font-semibold">
              /{locale}/shop?layout={shopLayout}&cols={columnCount}&view={cardVariant === 'list' ? 'list' : 'grid'}
            </span>
          </div>
        </div>

        <Link
          href={`/${locale}/product/BP-TY-COR-01`}
          className="text-primary hover:underline font-bold flex items-center gap-1"
        >
          <span>{locale === 'ar' ? 'معاينة صفحة تفاصيل المنتج (PDP)' : 'Preview PDP (Corolla Brake Pads)'}</span>
          <ExternalLink className="w-3.5 h-3.5 rtl:rotate-180" />
        </Link>
      </div>

      {/* Live Catalog Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <span>Live Card & Fitment Preview ({cardVariant} mode, {columnCount} columns)</span>
          </h2>
          <span className="text-xs text-text-muted">
            Notice how fitment badges instantly update according to the selected vehicle simulator above!
          </span>
        </div>

        <div
          className={
            cardVariant === 'list'
              ? 'space-y-4'
              : `grid gap-4 ${
                  columnCount === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : columnCount === 3
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                    : columnCount === 5
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
                    : columnCount === 6
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6'
                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
                }`
          }
        >
          {sampleProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              locale={locale}
              variant={cardVariant}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
