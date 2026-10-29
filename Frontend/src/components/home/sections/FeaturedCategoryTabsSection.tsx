'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Chip } from '@heroui/react';
import { Layers, ArrowRight } from 'lucide-react';
import { Locale, Product, Category } from '@/lib/api/types';
import { ProductCard } from '@/components/product/ProductCard';
import { services } from '@/lib/api';
import { resolveLocalized } from '@/lib/i18n';

interface FeaturedCategoryTabsProps {
  locale: Locale;
}

export const FeaturedCategoryTabsSection: React.FC<FeaturedCategoryTabsProps> = ({ locale }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    setLoading(true);
    const filter = activeTab === 'all' ? {} : { category: activeTab };
    services.catalog.searchProducts(filter).then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  }, [activeTab]);

  return (
    <section className="space-y-5">
      {/* Header and Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">
              {locale === 'ar' ? 'قطع الغيار حسب الأقسام' : 'Featured Parts by Category'}
            </h3>
            <p className="text-xs text-text-muted">
              {locale === 'ar' ? 'تصفح أحدث القطع المتوفرة مع ضمان التوافق' : 'Browse latest available parts with fitment guarantee'}
            </p>
          </div>
        </div>

        {/* Category Tabs Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Button
            size="sm"
            variant={activeTab === 'all' ? 'solid' : 'bordered'}
            color={activeTab === 'all' ? 'primary' : 'default'}
            onClick={() => setActiveTab('all')}
            className="font-bold text-xs shrink-0"
          >
            {locale === 'ar' ? 'الكل' : 'All'}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={activeTab === cat.slug ? 'solid' : 'bordered'}
              color={activeTab === cat.slug ? 'primary' : 'default'}
              onClick={() => setActiveTab(cat.slug)}
              className="font-bold text-xs shrink-0"
            >
              {resolveLocalized(cat.name, locale)}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-surface-muted border border-surface-border" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-xs text-text-muted">
          {locale === 'ar' ? 'لا توجد قطع معروضة في هذا القسم حالياً.' : 'No parts found in this category.'}
        </div>
      )}

      {/* View All Button */}
      <div className="text-center pt-2">
        <Button
          as={Link}
          href={`/${locale}/shop`}
          color="primary"
          variant="flat"
          radius="lg"
          className="font-bold text-xs"
          endContent={<ArrowRight className="w-3.5 h-3.5 rtl-mirror" />}
        >
          {locale === 'ar' ? 'استعراض كافة قطع الغيار المتوفرة' : 'View All Available Auto Parts'}
        </Button>
      </div>
    </section>
  );
};
