'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  X,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Car,
} from 'lucide-react';
import { Locale, Product, Category, Brand, Vendor } from '@/lib/api/types';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { formatMoney, getMessages, resolveLocalized } from '@/lib/i18n';
import { siteConfig } from '@/config/site.config';
import { useGarageStore } from '@/stores/useGarageStore';

interface ShopListingProps {
  locale: Locale;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  vendors: Vendor[];
  totalResults: number;
  currentPage: number;
  lastPage: number;
  activeCategory?: string;
  categoryTitle?: string;
}

export const ShopListing: React.FC<ShopListingProps> = ({
  locale,
  products,
  categories,
  brands,
  vendors,
  totalResults,
  currentPage,
  lastPage,
  activeCategory,
  categoryTitle,
}) => {
  const t = getMessages(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeVehicle } = useGarageStore();

  // Config-driven layout options
  const defaultLayout = siteConfig.shop.layout; // 'left-sidebar' | 'right-sidebar' | 'wide' | 'top-filters'
  const defaultCols = siteConfig.shop.columns; // 2 - 6
  const defaultView = siteConfig.shop.view; // 'grid' | 'list'

  // Query params override for dev / playground
  const layout = (searchParams.get('layout') as any) || defaultLayout;
  const cols = parseInt(searchParams.get('cols') || String(defaultCols), 10);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (searchParams.get('view') as any) || defaultView
  );

  // Filters State from URL
  const selectedMake = searchParams.get('make') || '';
  const selectedModel = searchParams.get('model') || '';
  const selectedYear = searchParams.get('year') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const selectedCondition = searchParams.get('condition') || '';
  const selectedSort = searchParams.get('sortBy') || 'popularity';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const onSale = searchParams.get('on_sale') === 'true';

  const [isMobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Price filter input state
  const [priceRange, setPriceRange] = useState({
    min: minPrice,
    max: maxPrice,
  });

  const updateFilter = (key: string, value: string | null) => {
    updateFilters({ [key]: value });
  };

  const updateFilters = (batch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(batch).forEach(([key, val]) => {
      if (val !== null && val !== '') {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    params.set('page', '1');
    router.push(`/${locale}/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(`/${locale}/shop`);
  };

  const isFitmentActive = Boolean(
    selectedMake &&
      selectedMake.toLowerCase() === activeVehicle?.make?.toLowerCase() &&
      selectedModel &&
      selectedModel.toLowerCase() === activeVehicle?.model?.toLowerCase()
  );

  // Grid column class mapping
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  }[cols] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  const filterSidebarContent = (
    <div className="space-y-6 text-xs">
      {/* Active Vehicle Fitment Filter */}
      {activeVehicle && (
        <div className={`p-4 rounded-xl border space-y-2 transition-all ${
          isFitmentActive
            ? 'bg-primary/10 border-primary ring-1 ring-primary/30'
            : 'bg-primary/5 border-primary/20'
        }`}>
          <div className="flex items-center justify-between text-primary font-bold">
            <span className="flex items-center gap-1.5">
              <Car className="w-4 h-4" />
              <span>سيارتك الحالية</span>
            </span>
            {isFitmentActive && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px]">
                مُفعّل
              </span>
            )}
          </div>
          <p className="font-bold text-text text-sm">
            {activeVehicle.make} {activeVehicle.model} ({activeVehicle.year})
          </p>
          <button
            onClick={() => {
              if (isFitmentActive) {
                updateFilters({
                  make: null,
                  model: null,
                  year: null,
                  compatible_only: null,
                });
              } else {
                updateFilters({
                  make: activeVehicle.make,
                  model: activeVehicle.model,
                  year: String(activeVehicle.year),
                  compatible_only: 'true',
                });
              }
            }}
            className={`w-full py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              isFitmentActive
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs'
                : 'bg-primary hover:bg-primary-hover text-white shadow-xs'
            }`}
          >
            {isFitmentActive ? (
              <span>إلغاء تصفية التوافق</span>
            ) : (
              <span>تصفية بالقطع المتوافقة فقط</span>
            )}
          </button>
        </div>
      )}

      {/* Categories Tree */}
      <div className="space-y-2 border-b border-surface-border pb-5">
        <h4 className="font-bold text-text text-sm uppercase tracking-wide">
          {locale === 'ar' ? 'الأقسام الرئيسية' : 'Categories'}
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter('category', null)}
            className={`w-full text-start py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
              !activeCategory ? 'bg-primary/10 text-primary font-bold' : 'text-text-muted hover:text-text'
            }`}
          >
            {locale === 'ar' ? 'جميع الأقسام' : 'All Categories'}
          </button>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-0.5">
              <button
                onClick={() => updateFilter('category', cat.slug)}
                className={`w-full text-start py-1.5 px-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                  activeCategory === cat.slug
                    ? 'bg-primary text-white font-bold'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                <span>{resolveLocalized(cat.name, locale)}</span>
                <span className="text-[10px] opacity-75">({cat.itemCount || 18})</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Brands Filter */}
      <div className="space-y-2 border-b border-surface-border pb-5">
        <h4 className="font-bold text-text text-sm uppercase tracking-wide">
          {locale === 'ar' ? 'الماركة المصنعة' : 'Brands'}
        </h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {brands.map((b) => (
            <label
              key={b.id}
              className="flex items-center gap-2 cursor-pointer py-1 px-1 text-text-muted hover:text-text"
            >
              <input
                type="radio"
                name="brand_filter"
                checked={selectedBrand === b.slug}
                onChange={() => updateFilter('brand', selectedBrand === b.slug ? null : b.slug)}
                className="accent-primary cursor-pointer"
              />
              <span className="font-medium text-text">{b.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 border-b border-surface-border pb-5">
        <h4 className="font-bold text-text text-sm uppercase tracking-wide">
          {locale === 'ar' ? 'نطاق السعر (ج.م)' : 'Price Range (EGP)'}
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="من"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="w-full text-xs px-2.5 py-2 rounded-lg bg-surface border border-surface-border text-text outline-none focus:border-primary"
          />
          <span className="text-text-muted">-</span>
          <input
            type="number"
            placeholder="إلى"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="w-full text-xs px-2.5 py-2 rounded-lg bg-surface border border-surface-border text-text outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={() => {
            updateFilter('minPrice', priceRange.min || null);
            updateFilter('maxPrice', priceRange.max || null);
          }}
          className="w-full py-2 rounded-lg bg-surface-muted hover:bg-slate-200 dark:hover:bg-slate-800 text-text font-bold text-xs transition-colors cursor-pointer"
        >
          {locale === 'ar' ? 'تطبيق السعر' : 'Apply Price'}
        </button>
      </div>

      {/* Condition Filter (New / Used / Refurbished) */}
      <div className="space-y-2 border-b border-surface-border pb-5">
        <h4 className="font-bold text-text text-sm uppercase tracking-wide">
          {locale === 'ar' ? 'حالة القطعة' : 'Condition'}
        </h4>
        <div className="space-y-1.5">
          {[
            { id: 'new', label: locale === 'ar' ? 'جديد أصلي / تجاري' : 'New' },
            { id: 'used', label: locale === 'ar' ? 'استيراد مستعمل' : 'Used' },
            { id: 'refurbished', label: locale === 'ar' ? 'مجدد بالضمان' : 'Refurbished' },
          ].map((cond) => (
            <label key={cond.id} className="flex items-center gap-2 cursor-pointer text-text-muted hover:text-text">
              <input
                type="radio"
                name="cond_filter"
                checked={selectedCondition === cond.id}
                onChange={() => updateFilter('condition', selectedCondition === cond.id ? null : cond.id)}
                className="accent-primary cursor-pointer"
              />
              <span>{cond.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear All Button */}
      <button
        onClick={clearAllFilters}
        className="w-full py-2.5 rounded-xl border border-surface-border hover:bg-danger hover:text-white hover:border-danger text-text-muted text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{locale === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset All Filters'}</span>
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-text-muted">
        <Link href={`/${locale}`} className="hover:text-primary transition-colors">
          {t.nav.home}
        </Link>
        <span>/</span>
        <Link href={`/${locale}/shop`} className="hover:text-primary transition-colors">
          {t.nav.shop}
        </Link>
        {categoryTitle && (
          <>
            <span>/</span>
            <span className="font-bold text-text">{categoryTitle}</span>
          </>
        )}
      </nav>

      {/* Shop Control Toolbar */}
      <div className="bg-surface rounded-2xl border border-surface-border p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-text">
            {categoryTitle || (locale === 'ar' ? 'متجر قطع الغيار' : 'Auto Parts Catalog')}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            عرض {products.length} من أصل {totalResults} {t.common.results}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-2 rounded-xl bg-surface-muted border border-surface-border text-xs font-bold flex items-center gap-1.5 text-text cursor-pointer"
          >
            <Filter className="w-4 h-4 text-primary" />
            <span>{t.common.filter}</span>
          </button>

          {/* Sort Select */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-text-muted hidden sm:inline">{t.common.sort}:</span>
            <select
              value={selectedSort}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="bg-surface-muted text-xs font-bold text-text px-3 py-2 rounded-xl border border-surface-border outline-none focus:border-primary cursor-pointer"
            >
              <option value="popularity">الأكثر مبيعاً وشهرة</option>
              <option value="newest">أحدث القطع المضافة</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="rating">الأعلى تقييماً</option>
            </select>
          </div>

          {/* View Toggle (Grid / List) */}
          <div className="flex items-center border border-surface-border rounded-xl p-0.5 bg-surface-muted">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-surface text-primary shadow-xs' : 'text-text-muted hover:text-text'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-surface text-primary shadow-xs' : 'text-text-muted hover:text-text'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(selectedBrand || selectedCondition || selectedMake || onSale) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-text-muted font-bold">الفلاتر المطبقة:</span>
          {selectedMake && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
              السيارة: {selectedMake} {selectedModel}
              <button onClick={() => { updateFilter('make', null); updateFilter('model', null); updateFilter('year', null); }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {selectedBrand && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
              الماركة: {selectedBrand}
              <button onClick={() => updateFilter('brand', null)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {selectedCondition && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
              الحالة: {selectedCondition}
              <button onClick={() => updateFilter('condition', null)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-danger hover:underline ms-2 cursor-pointer"
          >
            {t.common.clearAll}
          </button>
        </div>
      )}

      {/* Main Shop Layout Grid */}
      <div className={`grid grid-cols-1 ${layout !== 'wide' ? 'lg:grid-cols-12' : ''} gap-8 items-start`}>
        {/* Left Sidebar (or Right Sidebar in RTL if configured) */}
        {layout !== 'wide' && (
          <aside className={`hidden lg:block lg:col-span-3 bg-surface rounded-2xl border border-surface-border p-5 shadow-xs sticky top-24 ${
            layout === 'right-sidebar' ? 'order-last' : ''
          }`}>
            {filterSidebarContent}
          </aside>
        )}

        {/* Products Grid / List Column */}
        <div className={layout !== 'wide' ? 'lg:col-span-9 space-y-6' : 'space-y-6'}>
          {products.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-2xl border border-surface-border p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-text-muted">
                <Filter className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="text-base font-bold text-text">لم نعثر على أي قطع تطابق بحثك</h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                جرب تغيير فلاتر الماركة، أو اختيار موديل سيارة مختلف، أو مسح الفلاتر للبحث في كامل الكتالوج.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                مسح جميع الفلاتر
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className={`grid ${colClass} gap-4`}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} variant="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} variant="list" />
              ))}
            </div>
          )}

          {/* Pagination Strip (Pages and Load-More) */}
          {lastPage > 1 && (
            <div className="pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-text-muted">
                صفحة {currentPage} من أصل {lastPage}
              </span>

              <div className="flex items-center gap-1.5">
                {[...Array(lastPage)].map((_, idx) => {
                  const pNum = idx + 1;
                  const isCurrent = pNum === currentPage;
                  return (
                    <button
                      key={pNum}
                      onClick={() => updateFilter('page', String(pNum))}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-surface border border-surface-border text-text hover:bg-surface-muted'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden animate-fadeIn">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />
          <div className="absolute inset-y-0 end-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-surface shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-slideIn">
              <div className="flex items-center justify-between border-b border-surface-border pb-4 mb-4">
                <h3 className="font-bold text-base text-text">تصفية قطع الغيار</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded text-text-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterSidebarContent}
            </div>
          </div>
        </div>
      )}

      <QuickViewModal locale={locale} />
    </div>
  );
};
