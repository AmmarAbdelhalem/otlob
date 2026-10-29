'use client';

import React, { useEffect, useState } from 'react';
import { Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Locale, Product } from '@/lib/api/types';
import { ProductCard } from '@/components/product/ProductCard';
import { services } from '@/lib/api';

interface TopOffersStripProps {
  locale: Locale;
}

export const TopOffersStripSection: React.FC<TopOffersStripProps> = ({ locale }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    services.catalog.getDeals(5).then(setProducts);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="bg-surface rounded-2xl border border-surface-border p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text">
              {locale === 'ar' ? 'أفضل عروض وتخفيضات اليوم' : 'Top Offers of the Day'}
            </h3>
            <p className="text-[11px] text-text-muted">
              {locale === 'ar' ? 'قطع مختارة بأعلى نسبة خصم متاحة لفترة محدودة' : 'Highest discounted parts available for limited time'}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/offers`}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>{locale === 'ar' ? 'صفحة كل العروض والكوبونات' : 'All Offers & Coupons'}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl-mirror" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} variant="compact" />
        ))}
      </div>
    </section>
  );
};
