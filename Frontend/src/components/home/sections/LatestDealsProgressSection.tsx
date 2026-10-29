'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, ArrowRight } from 'lucide-react';
import { Locale, Product } from '@/lib/api/types';
import { ProductCard } from '@/components/product/ProductCard';
import { services } from '@/lib/api';

interface LatestDealsProgressProps {
  locale: Locale;
}

export const LatestDealsProgressSection: React.FC<LatestDealsProgressProps> = ({ locale }) => {
  const [deals, setDeals] = useState<Product[]>([]);

  useEffect(() => {
    services.catalog.getDeals(4).then(setDeals);
  }, []);

  if (deals.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-red-950/20 via-surface to-surface rounded-3xl border border-danger/20 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center shadow-md shadow-danger/20">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-text">
              {locale === 'ar' ? 'صفقات اليوم مع عداد المخزون' : 'Deals with Stock Progress'}
            </h3>
            <p className="text-xs text-text-muted">
              {locale === 'ar' ? 'كميات محدودة وأسعار مخفضة قبل نفاد المخزون' : 'Limited stock available at promotional prices'}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/shop?deals=true`}
          className="text-xs font-bold text-danger hover:underline flex items-center gap-1"
        >
          <span>{locale === 'ar' ? 'جميع الصفقات' : 'All Deals'}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl-mirror" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {deals.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            locale={locale}
            variant="grid"
            showStockProgress={true}
          />
        ))}
      </div>
    </section>
  );
};
