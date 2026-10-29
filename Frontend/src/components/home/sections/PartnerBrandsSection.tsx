'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award } from 'lucide-react';
import { Locale, Brand } from '@/lib/api/types';
import { services } from '@/lib/api';

interface PartnerBrandsProps {
  locale: Locale;
}

export const PartnerBrandsSection: React.FC<PartnerBrandsProps> = ({ locale }) => {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    services.catalog.getBrands().then(setBrands);
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-surface-border pb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Award className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text">
            {locale === 'ar' ? 'الماركات والشركات المصنعة العالمية' : 'Global Manufacturer Brands'}
          </h3>
          <p className="text-xs text-text-muted">
            {locale === 'ar' ? 'نتعامل مع أكبر وأشهر العلامات التجارية الأصلية المعتمدة' : 'Official certified automotive manufacturing partners'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/${locale}/shop?brand=${b.slug}`}
            className="p-3.5 rounded-xl bg-surface border border-surface-border hover:border-primary/50 hover:shadow-md transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
          >
            <span className="font-black text-xs text-text tracking-wider group-hover:text-primary transition-colors">
              {b.name}
            </span>
            <span className="text-[10px] text-text-muted mt-0.5">{b.country}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};
