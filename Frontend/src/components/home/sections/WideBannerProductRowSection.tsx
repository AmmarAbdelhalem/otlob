'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { Locale, Product } from '@/lib/api/types';
import { ProductCard } from '@/components/product/ProductCard';
import { services } from '@/lib/api';

interface WideBannerProductRowProps {
  locale: Locale;
}

export const WideBannerProductRowSection: React.FC<WideBannerProductRowProps> = ({ locale }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    services.catalog.getFeaturedProducts(3).then(setProducts);
  }, []);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Wide Side Promo Banner */}
      <div className="lg:col-span-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white flex flex-col justify-between shadow-xl">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'اختيارات الخبراء' : 'Expert Picks'}</span>
          </span>

          <h3 className="text-2xl font-black leading-tight">
            {locale === 'ar' ? 'أعلى قطع الغيار تقييماً وموثوقية' : 'Top Rated Auto Parts with Warranty'}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {locale === 'ar'
              ? 'مفحوصة ومعتمدة من مراكز الخدمة المعتمدة في مصر، تناسب سيارات تويوتا ونيسان وهيونداي.'
              : 'Inspected and certified for maximum reliability and peak performance.'}
          </p>

          <ul className="space-y-2 text-xs text-slate-300 pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success shrink-0" />
              <span>{locale === 'ar' ? 'شهادة منشأ وضمان أصالة' : 'Certified Certificate of Origin'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success shrink-0" />
              <span>{locale === 'ar' ? 'توصيل خلال ساعات مع المندوب' : 'Fast Rep Delivery with Live GPS'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success shrink-0" />
              <span>{locale === 'ar' ? 'دفع عند الاستلام مع المعاينة' : 'Inspect before Pay on Delivery'}</span>
            </li>
          </ul>
        </div>

        <div className="pt-6">
          <Link
            href={`/${locale}/shop?featured=true`}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold text-center block transition-all shadow-md"
          >
            {locale === 'ar' ? 'عرض القطع المعتمدة' : 'View Certified Parts'}
          </Link>
        </div>
      </div>

      {/* Row of 3 Products */}
      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} variant="grid" />
        ))}
      </div>
    </section>
  );
};
