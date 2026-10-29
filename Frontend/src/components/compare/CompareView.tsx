'use client';

import React from 'react';
import Link from 'next/link';
import { Repeat, ShoppingBag, Trash2, ArrowRight, ArrowLeft, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { useCompareStore } from '@/stores/useCompareStore';
import { useCartStore } from '@/stores/useCartStore';
import { useUIStore } from '@/stores/useUIStore';
import { formatMoney, getMessages } from '@/lib/i18n';

interface CompareViewProps {
  locale: Locale;
}

export const CompareView: React.FC<CompareViewProps> = ({ locale }) => {
  const t = getMessages(locale);
  const { items, removeItem, clearCompare } = useCompareStore();
  const { addItem } = useCartStore();
  const { setMiniCartOpen } = useUIStore();

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
    setMiniCartOpen(true);
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-6 max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
          <Repeat className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-text-main">
            {locale === 'ar' ? 'لا توجد قطع للمقارنة' : 'No Items to Compare'}
          </h2>
          <p className="text-xs sm:text-sm text-text-muted">
            {locale === 'ar'
              ? 'يمكنك إضافة حتى 4 قطع غيار لمقارنة المواصفات الفنية وأرقام الـ OEM والأسعار جنباً إلى جنب.'
              : 'Add up to 4 spare parts to compare technical specs, OEM numbers, and prices side-by-side.'}
          </p>
        </div>
        <Link
          href={`/${locale}/shop`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all"
        >
          <span>{locale === 'ar' ? 'تصفح المتجر الآن' : 'Browse Shop'}</span>
          {locale === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <nav className="flex items-center gap-2 text-xs text-text-muted">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">
            {locale === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-text-main font-medium">
            {locale === 'ar' ? 'مقارنة المواصفات' : 'Compare Parts'}
          </span>
        </nav>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl font-black text-text-main flex items-center gap-3">
            <span>{locale === 'ar' ? 'جدول مقارنة المواصفات الفنية' : 'Parts Comparison Table'}</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {items.length} / 4 {locale === 'ar' ? 'قطع' : 'parts'}
            </span>
          </h1>

          <button
            type="button"
            onClick={clearCompare}
            className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'مسح جدول المقارنة' : 'Clear Comparison'}</span>
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto border border-border-color rounded-2xl bg-bg-primary shadow-sm">
        <table className="w-full text-xs text-start border-collapse">
          <thead>
            <tr className="border-b border-border-color bg-bg-secondary/40">
              <th className="py-4 px-5 text-start w-48 text-text-muted font-bold">
                {locale === 'ar' ? 'القطعة / المنتج' : 'Part'}
              </th>
              {items.map((prod) => (
                <th key={prod.id} className="py-4 px-5 text-start min-w-[220px] align-top">
                  <div className="space-y-3">
                    <div className="relative aspect-square w-32 mx-auto rounded-xl bg-bg-secondary/60 p-2 border border-border-color">
                      <button
                        type="button"
                        onClick={() => removeItem(prod.id)}
                        className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 shadow-sm"
                        title={locale === 'ar' ? 'إزالة' : 'Remove'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <img src={prod.thumbnail} alt="" className="w-full h-full object-contain" />
                    </div>

                    <div className="space-y-1">
                      <Link
                        href={`/${locale}/product/${prod.sku}`}
                        className="font-extrabold text-sm text-text-main hover:text-primary transition-colors line-clamp-2"
                      >
                        {prod.name}
                      </Link>
                      <span className="text-base font-black text-primary font-mono block">
                        {formatMoney(prod.price, locale)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(prod)}
                      className="w-full h-9 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t.common.addToCart}</span>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border-color">
            {/* OEM Number */}
            <tr className="hover:bg-bg-secondary/20">
              <td className="py-3 px-5 font-bold text-text-muted bg-bg-secondary/20">
                {locale === 'ar' ? 'رقم OEM الأصلي' : 'Original OEM'}
              </td>
              {items.map((prod) => (
                <td key={prod.id} className="py-3 px-5 font-mono font-bold text-text-main">
                  {prod.oemNumber}
                </td>
              ))}
            </tr>

            {/* SKU */}
            <tr className="hover:bg-bg-secondary/20">
              <td className="py-3 px-5 font-bold text-text-muted bg-bg-secondary/20">
                {locale === 'ar' ? 'كود المخزن (SKU)' : 'SKU'}
              </td>
              {items.map((prod) => (
                <td key={prod.id} className="py-3 px-5 font-mono text-text-muted">
                  {prod.sku}
                </td>
              ))}
            </tr>

            {/* Brand */}
            <tr className="hover:bg-bg-secondary/20">
              <td className="py-3 px-5 font-bold text-text-muted bg-bg-secondary/20">
                {locale === 'ar' ? 'الماركة / الشركة المصنعة' : 'Brand / Manufacturer'}
              </td>
              {items.map((prod) => (
                <td key={prod.id} className="py-3 px-5 font-bold text-primary">
                  {prod.brand || 'Original OEM'}
                </td>
              ))}
            </tr>

            {/* Condition */}
            <tr className="hover:bg-bg-secondary/20">
              <td className="py-3 px-5 font-bold text-text-muted bg-bg-secondary/20">
                {locale === 'ar' ? 'حالة القطعة' : 'Condition'}
              </td>
              {items.map((prod) => (
                <td key={prod.id} className="py-3 px-5 font-medium capitalize text-text-main">
                  {prod.condition}
                </td>
              ))}
            </tr>

            {/* Weight */}
            <tr className="hover:bg-bg-secondary/20">
              <td className="py-3 px-5 font-bold text-text-muted bg-bg-secondary/20">
                {locale === 'ar' ? 'الوزن التقريبي' : 'Weight'}
              </td>
              {items.map((prod) => (
                <td key={prod.id} className="py-3 px-5 font-mono text-text-main">
                  {prod.weightKg} {locale === 'ar' ? 'كجم' : 'kg'}
                </td>
              ))}
            </tr>

            {/* Dimensions */}
            <tr className="hover:bg-bg-secondary/20">
              <td className="py-3 px-5 font-bold text-text-muted bg-bg-secondary/20">
                {locale === 'ar' ? 'الأبعاد (طول × عرض × ارتفاع)' : 'Dimensions (L × W × H)'}
              </td>
              {items.map((prod) => (
                <td key={prod.id} className="py-3 px-5 font-mono text-text-main">
                  {prod.dimensionsCm.length} × {prod.dimensionsCm.width} × {prod.dimensionsCm.height} cm
                </td>
              ))}
            </tr>

            {/* Stock */}
            <tr className="hover:bg-bg-secondary/20">
              <td className="py-3 px-5 font-bold text-text-muted bg-bg-secondary/20">
                {locale === 'ar' ? 'حالة التوفر' : 'Availability'}
              </td>
              {items.map((prod) => (
                <td key={prod.id} className="py-3 px-5">
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{locale === 'ar' ? 'متوفر للشحن الفوري' : 'In Stock'}</span>
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
