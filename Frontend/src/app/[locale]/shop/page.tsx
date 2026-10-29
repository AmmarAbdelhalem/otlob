import React from 'react';
import { Locale } from '@/lib/api/types';
import { services } from '@/lib/api';
import { ShopListing } from '@/components/shop/ShopListing';
import { siteConfig } from '@/config/site.config';
import { resolveLocalized } from '@/lib/i18n';

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;
  const resolvedSearchParams = await searchParams;

  const getString = (key: string): string | undefined => {
    const val = resolvedSearchParams[key];
    if (Array.isArray(val)) return val[0];
    return val;
  };

  const q = getString('q');
  const category = getString('category');
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

  // Fetch data in parallel
  const [categories, brands, vendors, searchResult] = await Promise.all([
    services.catalog.getCategories(),
    services.catalog.getBrands(),
    services.vendor.getVendors(),
    services.catalog.searchProducts({
      q,
      category,
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

  let categoryTitle: string | undefined = undefined;
  if (category) {
    const matchedCategory = categories.find((c) => c.slug === category);
    if (matchedCategory) {
      categoryTitle = resolveLocalized(matchedCategory.name, locale);
    }
  }

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
          activeCategory={category}
          categoryTitle={categoryTitle}
        />
      </div>
    </div>
  );
}
