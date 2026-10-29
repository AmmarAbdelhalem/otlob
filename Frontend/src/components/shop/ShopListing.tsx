'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Pagination,
  Accordion,
  AccordionItem,
  Chip,
  Button,
  ButtonGroup,
  Input,
  Select,
  SelectItem,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@heroui/react';
import {
  Filter,
  Grid3X3,
  List,
  RotateCcw,
  Car,
  SlidersHorizontal,
} from 'lucide-react';
import { Locale, Product, Category, Brand, Vendor } from '@/lib/api/types';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { getMessages, resolveLocalized } from '@/lib/i18n';
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

  const defaultLayout = siteConfig.shop.layout;
  const defaultCols = siteConfig.shop.columns;
  const defaultView = siteConfig.shop.view;

  const layout = (searchParams.get('layout') as any) || defaultLayout;
  const cols = parseInt(searchParams.get('cols') || String(defaultCols), 10);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (searchParams.get('view') as any) || defaultView
  );

  const selectedMake = searchParams.get('make') || '';
  const selectedModel = searchParams.get('model') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const selectedCondition = searchParams.get('condition') || '';
  const selectedSort = searchParams.get('sortBy') || 'popularity';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const onSale = searchParams.get('on_sale') === 'true';

  const [isMobileFilterOpen, setMobileFilterOpen] = useState(false);
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

  const colClass =
    {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
    }[cols] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  const filterSidebarContent = (
    <div className="space-y-4 text-xs">
      {/* Active Vehicle Fitment Filter */}
      {activeVehicle && (
        <div
          className={`p-4 rounded-xl border space-y-2 transition-all ${
            isFitmentActive
              ? 'bg-[#141414] border-white/30 ring-1 ring-white/20'
              : 'bg-[#0a0a0a] border-[#262626]'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-200 font-bold">
            <span className="flex items-center gap-1.5">
              <Car className="w-4 h-4 text-white" />
              <span>{locale === 'ar' ? 'سيارتك المحددة' : 'Active Vehicle'}</span>
            </span>
            {isFitmentActive && (
              <Chip size="sm" color="success" variant="flat" className="font-mono text-[10px]">
                {locale === 'ar' ? 'مُفعّل' : 'Active'}
              </Chip>
            )}
          </div>
          <p className="font-bold text-white text-xs font-mono">
            {activeVehicle.make} {activeVehicle.model} ({activeVehicle.year})
          </p>
          <Button
            size="sm"
            onPress={() => {
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
            className={`w-full text-xs font-bold ${
              isFitmentActive
                ? 'bg-[#1f1f1f] text-rose-400 hover:bg-[#262626] border border-rose-500/20'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {isFitmentActive
              ? locale === 'ar' ? 'إلغاء تصفية التوافق' : 'Clear Vehicle Filter'
              : locale === 'ar' ? 'تصفية بالقطع المتوافقة فقط' : 'Filter Compatible Only'}
          </Button>
        </div>
      )}

      {/* Accordion Filter Groups */}
      <Accordion
        selectionMode="multiple"
        defaultExpandedKeys={['categories', 'price', 'brands']}
        className="px-0"
        itemClasses={{
          base: 'py-0 border-b border-[#262626]',
          title: 'text-xs font-bold text-white uppercase font-mono tracking-wider',
          trigger: 'py-3 text-neutral-300 hover:text-white',
          content: 'pb-4 pt-1',
        }}
      >
        {/* Categories Group */}
        <AccordionItem
          key="categories"
          aria-label={locale === 'ar' ? 'الأقسام الرئيسية' : 'Categories'}
          title={locale === 'ar' ? 'الأقسام الرئيسية' : 'Categories'}
        >
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => updateFilter('category', null)}
              className={`w-full text-start py-1.5 px-2 rounded-lg text-xs transition-colors cursor-pointer ${
                !activeCategory
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              {locale === 'ar' ? 'جميع الأقسام' : 'All Categories'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateFilter('category', cat.slug)}
                className={`w-full text-start py-1.5 px-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                  activeCategory === cat.slug
                    ? 'bg-white text-black font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                <span>{resolveLocalized(cat.name, locale)}</span>
                <span className="text-[10px] font-mono opacity-60">({cat.itemCount || 18})</span>
              </button>
            ))}
          </div>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem
          key="price"
          aria-label={locale === 'ar' ? 'نطاق السعر' : 'Price Range'}
          title={locale === 'ar' ? 'نطاق السعر (ج.م)' : 'Price Range (EGP)'}
        >
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Input
                size="sm"
                variant="bordered"
                type="number"
                placeholder={locale === 'ar' ? 'من' : 'Min'}
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                classNames={{
                  inputWrapper: 'border-[#262626] bg-[#111111] hover:border-neutral-600',
                  input: 'text-xs font-mono',
                }}
              />
              <span className="text-neutral-600">-</span>
              <Input
                size="sm"
                variant="bordered"
                type="number"
                placeholder={locale === 'ar' ? 'إلى' : 'Max'}
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                classNames={{
                  inputWrapper: 'border-[#262626] bg-[#111111] hover:border-neutral-600',
                  input: 'text-xs font-mono',
                }}
              />
            </div>
            <Button
              size="sm"
              variant="flat"
              onPress={() => {
                updateFilter('minPrice', priceRange.min || null);
                updateFilter('maxPrice', priceRange.max || null);
              }}
              className="w-full bg-[#171717] hover:bg-[#262626] text-white border border-[#262626] text-xs font-semibold"
            >
              {locale === 'ar' ? 'تطبيق السعر' : 'Apply Price'}
            </Button>
          </div>
        </AccordionItem>

        {/* Brands */}
        <AccordionItem
          key="brands"
          aria-label={locale === 'ar' ? 'الماركة المصنعة' : 'Brands'}
          title={locale === 'ar' ? 'الماركة المصنعة' : 'Brands'}
        >
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {brands.map((b) => {
              const isChecked = selectedBrand === b.slug;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => updateFilter('brand', isChecked ? null : b.slug)}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-white text-black font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                  }`}
                >
                  <span>{b.name}</span>
                  {isChecked && <span className="text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        </AccordionItem>

        {/* Condition */}
        <AccordionItem
          key="condition"
          aria-label={locale === 'ar' ? 'حالة القطعة' : 'Condition'}
          title={locale === 'ar' ? 'حالة القطعة' : 'Condition'}
        >
          <div className="space-y-1">
            {[
              { id: 'new', label: locale === 'ar' ? 'جديد أصلي / تجاري' : 'Brand New' },
              { id: 'used', label: locale === 'ar' ? 'استيراد مستعمل' : 'Used Imported' },
              { id: 'refurbished', label: locale === 'ar' ? 'مجدد بالضمان' : 'Refurbished' },
            ].map((cond) => {
              const isChecked = selectedCondition === cond.id;
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => updateFilter('condition', isChecked ? null : cond.id)}
                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-white text-black font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                  }`}
                >
                  <span>{cond.label}</span>
                  {isChecked && <span className="text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        </AccordionItem>
      </Accordion>

      {/* Clear All Button */}
      <Button
        variant="flat"
        size="sm"
        onPress={clearAllFilters}
        className="w-full bg-[#111111] hover:bg-rose-950/30 text-neutral-400 hover:text-rose-400 border border-[#262626] hover:border-rose-500/30 text-xs font-semibold"
        startContent={<RotateCcw className="w-3.5 h-3.5" />}
      >
        {locale === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset All Filters'}
      </Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
        <Link href={`/${locale}`} className="hover:text-white transition-colors">
          {t.nav.home}
        </Link>
        <span>/</span>
        <Link href={`/${locale}/shop`} className="hover:text-white transition-colors">
          {t.nav.shop}
        </Link>
        {categoryTitle && (
          <>
            <span>/</span>
            <span className="font-bold text-white">{categoryTitle}</span>
          </>
        )}
      </nav>

      {/* Shop Control Toolbar */}
      <div className="bg-[#0a0a0a] rounded-2xl border border-[#262626] p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {categoryTitle || (locale === 'ar' ? 'متجر قطع الغيار' : 'Auto Parts Catalog')}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5 font-mono">
            {locale === 'ar'
              ? `عرض ${products.length} من أصل ${totalResults} نتيجة`
              : `Showing ${products.length} of ${totalResults} results`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <Button
            size="sm"
            variant="flat"
            onPress={() => setMobileFilterOpen(true)}
            className="lg:hidden bg-[#171717] hover:bg-[#262626] text-white border border-[#262626] text-xs font-semibold"
            startContent={<Filter className="w-4 h-4 text-white" />}
          >
            {t.common.filter}
          </Button>

          {/* Sort Select */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 hidden sm:inline">{t.common.sort}:</span>
            <select
              value={selectedSort}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="bg-[#111111] text-xs font-semibold text-white px-3 py-2 rounded-xl border border-[#262626] outline-none hover:border-neutral-600 cursor-pointer"
            >
              <option value="popularity">الأكثر مبيعاً وشهرة</option>
              <option value="newest">أحدث القطع المضافة</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="rating">الأعلى تقييماً</option>
            </select>
          </div>

          {/* View Toggle (Grid / List) */}
          <ButtonGroup size="sm" variant="flat" className="border border-[#262626] rounded-xl overflow-hidden bg-[#111111]">
            <Button
              isIconOnly
              onPress={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white bg-transparent'}
              aria-label="Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              isIconOnly
              onPress={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white bg-transparent'}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(selectedBrand || selectedCondition || selectedMake || onSale) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-400 font-mono">
            {locale === 'ar' ? 'الفلاتر النشطة:' : 'Active Filters:'}
          </span>
          {selectedMake && (
            <Chip
              onClose={() => {
                updateFilter('make', null);
                updateFilter('model', null);
                updateFilter('year', null);
              }}
              variant="flat"
              className="bg-[#171717] border border-[#262626] text-white font-mono text-xs"
            >
              {selectedMake} {selectedModel}
            </Chip>
          )}
          {selectedBrand && (
            <Chip
              onClose={() => updateFilter('brand', null)}
              variant="flat"
              className="bg-[#171717] border border-[#262626] text-white font-mono text-xs"
            >
              {selectedBrand}
            </Chip>
          )}
          {selectedCondition && (
            <Chip
              onClose={() => updateFilter('condition', null)}
              variant="flat"
              className="bg-[#171717] border border-[#262626] text-white font-mono text-xs"
            >
              {selectedCondition}
            </Chip>
          )}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-neutral-400 hover:text-rose-400 underline ms-2 cursor-pointer transition-colors"
          >
            {t.common.clearAll}
          </button>
        </div>
      )}

      {/* Main Shop Layout Grid */}
      <div className={`grid grid-cols-1 ${layout !== 'wide' ? 'lg:grid-cols-12' : ''} gap-8 items-start`}>
        {/* Left Sidebar */}
        {layout !== 'wide' && (
          <aside
            className={`hidden lg:block lg:col-span-3 bg-[#0a0a0a] rounded-2xl border border-[#262626] p-5 shadow-sm sticky top-20 ${
              layout === 'right-sidebar' ? 'order-last' : ''
            }`}
          >
            {filterSidebarContent}
          </aside>
        )}

        {/* Products Grid / List Column */}
        <div className={layout !== 'wide' ? 'lg:col-span-9 space-y-6' : 'space-y-6'}>
          {products.length === 0 ? (
            <div className="text-center py-20 bg-[#0a0a0a] rounded-2xl border border-[#262626] p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-[#262626] flex items-center justify-center mx-auto text-neutral-500">
                <SlidersHorizontal className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="text-base font-bold text-white">
                {locale === 'ar' ? 'لم نعثر على أي قطع تطابق بحثك' : 'No matching auto parts found'}
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                {locale === 'ar'
                  ? 'جرب تغيير فلاتر الماركة، أو اختيار موديل سيارة مختلف، أو مسح الفلاتر للبحث في كامل الكتالوج.'
                  : 'Try modifying your search criteria or resetting filters to search across the entire catalog.'}
              </p>
              <Button
                onPress={clearAllFilters}
                className="bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors"
              >
                {locale === 'ar' ? 'مسح جميع الفلاتر' : 'Reset All Filters'}
              </Button>
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

          {/* Hero UI Pagination */}
          {lastPage > 1 && (
            <div className="pt-6 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-neutral-400 font-mono">
                {locale === 'ar'
                  ? `صفحة ${currentPage} من أصل ${lastPage}`
                  : `Page ${currentPage} of ${lastPage}`}
              </span>

              <Pagination
                total={lastPage}
                page={currentPage}
                onChange={(page) => updateFilter('page', String(page))}
                showControls
                variant="flat"
                classNames={{
                  wrapper: 'gap-1',
                  item: 'bg-[#111111] text-neutral-300 border border-[#262626] font-mono text-xs',
                  cursor: 'bg-white text-black font-bold font-mono',
                  prev: 'bg-[#111111] text-white border border-[#262626]',
                  next: 'bg-[#111111] text-white border border-[#262626]',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={isMobileFilterOpen}
        onOpenChange={(open) => setMobileFilterOpen(open)}
        placement={locale === 'ar' ? 'left' : 'right'}
        size="sm"
        backdrop="blur"
        classNames={{
          backdrop: 'bg-black/80 backdrop-blur-sm',
          base: 'bg-[#0a0a0a] border-x border-[#262626] text-[#ededed] shadow-2xl',
          header: 'border-b border-[#262626] p-4 bg-[#0a0a0a]',
          body: 'p-5 bg-[#000000]',
        }}
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerHeader>
                <h3 className="font-bold text-base text-white">
                  {locale === 'ar' ? 'تصفية قطع الغيار' : 'Filter Parts'}
                </h3>
              </DrawerHeader>
              <DrawerBody>
                {filterSidebarContent}
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <QuickViewModal locale={locale} />
    </div>
  );
};
