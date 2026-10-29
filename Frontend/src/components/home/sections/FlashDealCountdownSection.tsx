'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timer, ShoppingCart, ArrowRight } from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { formatMoney } from '@/lib/i18n';
import { useCartStore } from '@/stores/useCartStore';

interface FlashDealCountdownProps {
  locale: Locale;
}

export const FlashDealCountdownSection: React.FC<FlashDealCountdownProps> = ({ locale }) => {
  const { addItem: addToCart } = useCartStore();

  // 12-hour countdown
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProduct = {
    id: 'prod-flash-01',
    merchantId: 'e4a2d810-72bd-4b95-a249-16ec6f2e0861',
    name: 'طقم تيل فرامل سيراميك أمامي أصلي - تويوتا كورولا (2014 - 2022)',
    sku: 'BP-TY-COR-01',
    oemNumber: '04465-02220',
    description: 'عرض فلاش خاص لمدة 24 ساعة فقط! تيل فرامل عالي الجودة مضاد للحرارة مع طقم مسامير وشحم نحاسي هدية.',
    price: 850,
    originalPrice: 1250,
    discountPercentage: 32,
    stockQuantity: 9,
    availableStock: 9,
    soldCount: 41,
    weightKg: 1.8,
    dimensionsCm: { length: 15, width: 10, height: 6 },
    condition: 'new' as const,
    isActive: true,
    images: ['/images/products/brake-pads.svg'],
    thumbnail: '/images/products/brake-pads.svg',
    categorySlug: 'brakes',
    brand: 'Brembo',
    compatibilities: [
      { id: 'c-1', productId: 'prod-flash-01', make: 'Toyota', model: 'Corolla', yearFrom: 2014, yearTo: 2022 },
    ],
  };

  return (
    <section className="bg-surface rounded-3xl border-2 border-danger/30 p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute -end-20 -top-20 w-80 h-80 rounded-full bg-danger/5 blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left / Start Content with Countdown Timer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-danger text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <Timer className="w-4 h-4" />
              <span>{locale === 'ar' ? 'عرض الفلاش السريع' : 'Flash Sale'}</span>
            </span>
            <span className="text-xs text-text-muted font-bold">
              {locale === 'ar' ? 'ينتهي العرض خلال:' : 'Offer Ends In:'}
            </span>
          </div>

          <h3 className="text-xl sm:text-3xl font-black text-text leading-tight">
            {flashProduct.name}
          </h3>

          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {flashProduct.description}
          </p>

          {/* Countdown Boxes */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-surface-muted border border-surface-border flex flex-col items-center justify-center shadow-xs">
              <span className="text-xl font-black text-text font-mono">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-text-muted uppercase font-bold">ساعة</span>
            </div>
            <span className="text-xl font-bold text-text-muted">:</span>
            <div className="w-16 h-16 rounded-2xl bg-surface-muted border border-surface-border flex flex-col items-center justify-center shadow-xs">
              <span className="text-xl font-black text-text font-mono">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-text-muted uppercase font-bold">دقيقة</span>
            </div>
            <span className="text-xl font-bold text-text-muted">:</span>
            <div className="w-16 h-16 rounded-2xl bg-surface-muted border border-surface-border flex flex-col items-center justify-center shadow-xs">
              <span className="text-xl font-black text-danger font-mono animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-text-muted uppercase font-bold">ثانية</span>
            </div>
          </div>

          {/* Prices & CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-surface-border">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-danger">
                {formatMoney(flashProduct.price, locale)}
              </span>
              <span className="text-sm text-text-muted line-through">
                {formatMoney(flashProduct.originalPrice, locale)}
              </span>
            </div>

            <button
              onClick={() => addToCart(flashProduct, 1)}
              className="px-6 py-3 rounded-xl bg-danger hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-danger/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{locale === 'ar' ? 'اطلب الآن قبل انتهاء الوقت' : 'Claim Flash Deal'}</span>
            </button>
          </div>
        </div>

        {/* Right Product Image Showcase */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm aspect-4/3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-6 flex items-center justify-center border border-surface-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={flashProduct.thumbnail}
              alt={flashProduct.name}
              className="w-full h-auto max-h-56 object-contain drop-shadow-xl"
            />
            <span className="absolute top-3 end-3 bg-danger text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
              وفر {flashProduct.discountPercentage}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
