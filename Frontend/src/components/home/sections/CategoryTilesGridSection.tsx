'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardBody, Chip } from '@heroui/react';
import { LayoutGrid, ArrowRight } from 'lucide-react';
import { Locale, Category } from '@/lib/api/types';
import { services } from '@/lib/api';
import { resolveLocalized } from '@/lib/i18n';

interface CategoryTilesGridProps {
  locale: Locale;
}

export const CategoryTilesGridSection: React.FC<CategoryTilesGridProps> = ({ locale }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/cms/categories');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const mapped: Category[] = json.data.map((c: any) => ({
            id: c.id,
            slug: c.slug,
            name: { ar: c.name_ar, en: c.name_en },
            icon: c.icon || 'settings',
            itemCount: c.products_count ?? 42,
            image: c.image
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${c.image}`
              : undefined,
          }));
          setCategories(mapped);
          return;
        }
      } catch {
        // Fallback
      }
      services.catalog.getCategories().then(setCategories);
    }
    loadCategories();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">
              {locale === 'ar' ? 'تصفح جميع أقسام قطع الغيار' : 'Browse All Part Categories'}
            </h3>
            <p className="text-xs text-text-muted">
              {locale === 'ar' ? 'فهرس شامل لجميع الأنظمة الميكانيكية والكهربائية' : 'Comprehensive catalog for all automotive systems'}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/shop`}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>{locale === 'ar' ? 'عرض الفهرس' : 'View Catalog'}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl-mirror" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            isPressable
            as={Link}
            href={`/${locale}/shop?category=${cat.slug}`}
            className="border border-surface-border hover:border-primary/50 transition-all group"
            shadow="sm"
          >
            <CardBody className="p-4 flex flex-col justify-between h-full min-h-[120px]">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-text group-hover:text-primary transition-colors text-start">
                  {resolveLocalized(cat.name, locale)}
                </h4>
                <Chip size="sm" variant="flat" color="default" className="text-xs text-text-muted">
                  {cat.itemCount || 35}+ {locale === 'ar' ? 'قطعة غيار' : 'Parts'}
                </Chip>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs text-primary font-bold">
                <span>{locale === 'ar' ? 'تصفح القسم' : 'Explore'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl-mirror group-hover:translate-x-1 transition-transform" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
};
