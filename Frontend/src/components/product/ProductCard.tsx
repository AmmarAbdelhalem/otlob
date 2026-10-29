'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, RefreshCw, ShoppingCart, Eye, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { Locale, Product } from '@/lib/api/types';
import { formatMoney, getMessages, resolveLocalized } from '@/lib/i18n';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCompareStore } from '@/stores/useCompareStore';
import { useGarageStore } from '@/stores/useGarageStore';
import { useUIStore } from '@/stores/useUIStore';
import { siteConfig } from '@/config/site.config';

export interface ProductCardProps {
  product: Product;
  locale: Locale;
  variant?: 'grid' | 'list' | 'compact';
  showSku?: boolean;
  showAttributes?: boolean;
  showStockProgress?: boolean;
  showQuickView?: boolean;
  showCompare?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  locale,
  variant = 'grid',
  showSku = siteConfig.shop.card.showSku,
  showStockProgress = siteConfig.shop.card.showStockProgress,
  showQuickView = siteConfig.shop.card.showQuickView,
  showCompare = siteConfig.shop.card.showCompare,
}) => {
  const t = getMessages(locale);
  const { addItem: addToCart } = useCartStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToCompare, isInCompare } = useCompareStore();
  const { checkFitment, activeVehicle } = useGarageStore();
  const { openQuickView } = useUIStore();

  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  const fitmentStatus = checkFitment(product.compatibilities);

  // Stock Progress Calculation
  const totalStock = (product.availableStock || 20) + (product.soldCount || 10);
  const soldPercent = Math.min(100, Math.round(((product.soldCount || 10) / totalStock) * 100));

  // 1. Compact Variant (For top offers strips and dense sidebar widgets)
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-surface-border hover:shadow-md transition-all group">
        <div className="w-16 h-16 rounded-lg bg-slate-50 dark:bg-slate-800 shrink-0 p-1 flex items-center justify-center overflow-hidden border border-surface-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.thumbnail || '/images/products/brake-pads.svg'}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/${locale}/product/${product.sku}`}
            className="text-xs font-bold text-text truncate block hover:text-primary transition-colors"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-black text-primary">
              {formatMoney(product.price, locale)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-text-muted line-through">
                {formatMoney(product.originalPrice, locale)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => addToCart(product, 1)}
          className="p-2 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white transition-colors cursor-pointer shrink-0"
          title={t.common.addToCart}
          aria-label={t.common.addToCart}
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 2. List Variant (For Shop horizontal list view)
  if (variant === 'list') {
    return (
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-surface border border-surface-border hover:shadow-lg transition-all group">
        <div className="sm:w-56 h-48 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0 p-4 flex items-center justify-center overflow-hidden relative border border-surface-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.thumbnail || '/images/products/brake-pads.svg'}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
          />
          {product.discountPercentage && (
            <span className="absolute top-2 start-2 bg-danger text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              -{product.discountPercentage}%
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              {showSku && (
                <span className="text-[11px] font-mono text-text-muted">{product.sku}</span>
              )}
              {activeVehicle && fitmentStatus !== 'unknown' && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    fitmentStatus === 'fits'
                      ? 'bg-success/10 text-success'
                      : 'bg-danger/10 text-danger'
                  }`}
                >
                  {fitmentStatus === 'fits' ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      <span>{t.vehicleFinder.fitsYourVehicle}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      <span>{t.vehicleFinder.doesNotFit}</span>
                    </>
                  )}
                </span>
              )}
            </div>

            <Link
              href={`/${locale}/product/${product.sku}`}
              className="text-sm font-bold text-text hover:text-primary transition-colors block line-clamp-1"
            >
              {product.name}
            </Link>

            <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {product.merchant && (
              <span className="text-[11px] text-text-muted block">
                {t.common.soldBy}{' '}
                <span className="font-semibold text-text">{product.merchant.storeName}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-border mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-primary">
                {formatMoney(product.price, locale)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-text-muted line-through">
                  {formatMoney(product.originalPrice, locale)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {showQuickView && (
                <button
                  onClick={() => openQuickView(product)}
                  className="p-2 rounded-lg bg-surface-muted hover:bg-slate-200 dark:hover:bg-slate-700 text-text transition-colors cursor-pointer"
                  title={t.common.quickView}
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isFavorited
                    ? 'bg-primary text-white'
                    : 'bg-surface-muted hover:bg-slate-200 dark:hover:bg-slate-700 text-text'
                }`}
                title={t.common.wishlist}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => addToCart(product, 1)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t.common.addToCart}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Grid Variant (Default high-impact Partdo card layout)
  return (
    <div className="bg-surface rounded-2xl border border-surface-border hover:border-primary/40 hover:shadow-xl transition-all flex flex-col justify-between p-4 relative group">
      <div>
        {/* Top Badges and Wishlist button */}
        <div className="relative aspect-4/3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 mb-3 flex items-center justify-center overflow-hidden border border-surface-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.thumbnail || '/images/products/brake-pads.svg'}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges Left/Top */}
          <div className="absolute top-2 start-2 flex flex-col gap-1 items-start">
            {product.discountPercentage && (
              <span className="bg-danger text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                -{product.discountPercentage}%
              </span>
            )}
            {product.badges?.map((badge, idx) => (
              <span
                key={idx}
                className="bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs"
              >
                {resolveLocalized(badge.text, locale)}
              </span>
            ))}
          </div>

          {/* Floating Actions on Hover (Wishlist, Compare, Quick View) */}
          <div className="absolute top-2 end-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-1.5 rounded-full shadow-md transition-colors cursor-pointer ${
                isFavorited
                  ? 'bg-primary text-white'
                  : 'bg-surface hover:bg-slate-100 dark:hover:bg-slate-700 text-text'
              }`}
              title={t.common.wishlist}
              aria-label={t.common.wishlist}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>

            {showCompare && (
              <button
                onClick={() => addToCompare(product)}
                className={`p-1.5 rounded-full shadow-md transition-colors cursor-pointer ${
                  isCompared
                    ? 'bg-accent text-white'
                    : 'bg-surface hover:bg-slate-100 dark:hover:bg-slate-700 text-text'
                }`}
                title={t.common.compare}
                aria-label={t.common.compare}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            {showQuickView && (
              <button
                onClick={() => openQuickView(product)}
                className="p-1.5 rounded-full bg-surface hover:bg-slate-100 dark:hover:bg-slate-700 text-text shadow-md transition-colors cursor-pointer"
                title={t.common.quickView}
                aria-label={t.common.quickView}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Fitment Indicator Badge if Car Selected */}
        {activeVehicle && fitmentStatus !== 'unknown' && (
          <div
            className={`text-[10px] font-bold px-2 py-1 rounded-md mb-2 flex items-center gap-1 ${
              fitmentStatus === 'fits'
                ? 'bg-success/10 text-success'
                : 'bg-danger/10 text-danger'
            }`}
          >
            {fitmentStatus === 'fits' ? (
              <>
                <CheckCircle className="w-3 h-3 shrink-0" />
                <span className="truncate">{t.vehicleFinder.fitsYourVehicle}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span className="truncate">{t.vehicleFinder.doesNotFit}</span>
              </>
            )}
          </div>
        )}

        {/* SKU & Brand */}
        <div className="flex items-center justify-between text-[11px] text-text-muted mb-1 font-mono">
          {showSku && <span>{product.sku}</span>}
          {product.brand && <span className="font-semibold text-text">{product.brand}</span>}
        </div>

        {/* Product Title */}
        <Link
          href={`/${locale}/product/${product.sku}`}
          className="text-xs font-bold text-text hover:text-primary transition-colors block line-clamp-2 min-h-[32px] leading-tight"
        >
          {product.name}
        </Link>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 mt-1.5 text-accent">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(product.rating || 5)
                    ? 'fill-current text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-text-muted font-bold">
            ({product.reviewCount || 12})
          </span>
        </div>

        {/* Stock Progress Bar (Optional in config) */}
        {showStockProgress && (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px] text-text-muted font-semibold">
              <span>تم بيع: {product.soldCount || 14}</span>
              <span>المتاح: {product.availableStock || 22}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-primary rounded-full transition-all"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Price & Add to Cart Bottom Strip */}
      <div className="pt-3 border-t border-surface-border flex items-center justify-between mt-3">
        <div>
          {product.originalPrice && (
            <span className="text-[10px] text-text-muted line-through block leading-none">
              {formatMoney(product.originalPrice, locale)}
            </span>
          )}
          <span className="text-sm font-black text-primary leading-tight">
            {formatMoney(product.price, locale)}
          </span>
        </div>

        <button
          onClick={() => addToCart(product, 1)}
          className="px-3 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-102"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{t.common.addToCart}</span>
        </button>
      </div>
    </div>
  );
};
