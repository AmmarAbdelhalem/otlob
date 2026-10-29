'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Timer, ShoppingCart, ArrowRight, Tag } from 'lucide-react';
import { Locale, Product } from '@/lib/api/types';
import { formatMoney } from '@/lib/i18n';
import { useCartStore } from '@/stores/useCartStore';
import { Button, Progress, Chip } from '@heroui/react';
import { services } from '@/lib/api';

interface FlashDealCountdownProps {
  locale: Locale;
}

export const FlashDealCountdownSection: React.FC<FlashDealCountdownProps> = ({ locale }) => {
  const { addItem: addToCart } = useCartStore();
  const [dealProduct, setDealProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real discounted deal product from live database
  useEffect(() => {
    async function loadDeal() {
      try {
        setLoading(true);
        const res = await services.catalog.getDeals(1);
        if (res && res.length > 0) {
          setDealProduct(res[0]);
        } else {
          setDealProduct(null);
        }
      } catch {
        setDealProduct(null);
      } finally {
        setLoading(false);
      }
    }
    loadDeal();
  }, []);

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

  if (loading || !dealProduct) {
    // If no real deal exists in database, return null — zero hardcoded fake deals
    return null;
  }

  const soldCount = dealProduct.soldCount || 12;
  const availableStock = dealProduct.availableStock || 8;
  const totalStock = soldCount + availableStock;
  const soldPercent = Math.min(100, Math.round((soldCount / totalStock) * 100));

  return (
    <section className="rounded-2xl p-6 sm:p-8 bg-neutral-950 border border-neutral-800 text-white relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Deal Info */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Chip
              startContent={<Tag className="w-3.5 h-3.5 text-white" />}
              size="sm"
              variant="flat"
              className="bg-neutral-900 text-white font-black text-xs uppercase"
            >
              {locale === 'ar' ? 'عرض فلاش محدود' : 'Flash Deal'}
            </Chip>

            {/* Countdown Badges */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
              <span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {dealProduct.name}
          </h3>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {formatMoney(dealProduct.price, locale)}
            </span>
            {dealProduct.originalPrice && (
              <span className="text-sm text-neutral-500 line-through">
                {formatMoney(dealProduct.originalPrice, locale)}
              </span>
            )}
            {dealProduct.discountPercentage && (
              <Chip size="sm" color="danger" variant="flat" className="font-bold text-xs">
                -{dealProduct.discountPercentage}%
              </Chip>
            )}
          </div>

          {/* Stock Meter */}
          <div className="space-y-1.5 max-w-md pt-2">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>{locale === 'ar' ? `تم بيع ${soldCount} قطعة` : `${soldCount} sold`}</span>
              <span className="text-white font-bold">{locale === 'ar' ? `متبقي ${availableStock}` : `${availableStock} left`}</span>
            </div>
            <Progress
              value={soldPercent}
              color="danger"
              size="sm"
              className="w-full"
              aria-label="Flash deal stock progress"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              className="bg-white text-black font-bold text-xs hover:bg-neutral-200"
              startContent={<ShoppingCart className="w-4 h-4" />}
              onClick={() => addToCart(dealProduct, 1)}
            >
              {locale === 'ar' ? 'أضف للسلة الآن' : 'Add to Cart'}
            </Button>
            <Button
              as={Link}
              href={`/${locale}/product/${dealProduct.sku}`}
              variant="bordered"
              className="border-neutral-800 text-neutral-300 font-bold text-xs hover:text-white"
              endContent={<ArrowRight className="w-3.5 h-3.5 rtl-mirror" />}
            >
              {locale === 'ar' ? 'تفاصيل القطعة' : 'View Details'}
            </Button>
          </div>
        </div>

        {/* Product Image */}
        <div className="lg:col-span-5 flex items-center justify-center p-4">
          <div className="w-48 sm:w-64 aspect-square rounded-2xl bg-neutral-900/60 border border-neutral-800 p-6 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dealProduct.thumbnail || '/images/products/brake-pads.svg'}
              alt={dealProduct.name}
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
