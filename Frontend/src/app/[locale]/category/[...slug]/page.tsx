import React from 'react';
import { Locale } from '@/lib/api/types';
import { services } from '@/lib/api';
import { ShopListing } from '@/components/shop/ShopListing';
import { siteConfig } from '@/config/site.config';
import { resolveLocalized } from '@/lib/i18n';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;
  const resolvedSearchParams = await searchParams;

  if (!slug || slug.length === 0) {
    notFound();
  }

  const categorySlug = slug[slug.length - 1];

  const getString = (key: string): string | undefined => {
    const val = resolvedSearchParams[key];
    if (Array.isArray(val)) return val[0];
    return val;
  };

  const q = getString('q');
  const brand = getString('brand');
  const vendor = getString('vendor');
  const make = getString('make');
  const model = getString('model');
  const yearStr = getString('year');
  const condition = getString('condition');
  const minPriceStr = getString('minPrice');
  const maxPriceStr = getString('maxPrice');
  const sortByStr = getString('sortBy');
  const pageStr = getString('page');

  const page = pageStr ? parseInt(pageStr, 10) : 1;
  const minPrice = minPriceStr ? parseFloat(minPriceStr) : undefined;
  const maxPrice = maxPriceStr ? parseFloat(maxPriceStr) : undefined;
  const year = yearStr ? parseInt(yearStr, 10) : undefined;
  const sortBy = (sortByStr as any) || 'popularity';

  const [categories, brands, vendors, matchedCategory, searchResult] = await Promise.all([
    services.catalog.getCategories(),
    services.catalog.getBrands(),
    services.vendor.getVendors(),
    services.catalog.getCategoryBySlug(categorySlug),
    services.catalog.searchProducts({
      q,
      category: categorySlug,
      brand,
      vendor,
      make,
      model,
      year,
      condition,
      minPrice,
      maxPrice,
      sortBy,
      page,
      perPage: siteConfig.shop.perPage || 12,
    }),
  ]);

  const categoryTitle = matchedCategory ? resolveLocalized(matchedCategory.name, locale) : categorySlug;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ShopListing
          locale={locale}
          products={searchResult.data}
          categories={categories}
          brands={brands}
          vendors={vendors}
          totalResults={searchResult.meta.total}
          currentPage={searchResult.meta.currentPage}
          lastPage={searchResult.meta.lastPage}
          activeCategory={categorySlug}
          categoryTitle={categoryTitle}
        />
      </div>
    </div>
  );
}
