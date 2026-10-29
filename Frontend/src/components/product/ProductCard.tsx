'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardBody, Button, Chip, Progress, Tooltip } from '@heroui/react';
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
      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all group">
        <div className="w-16 h-16 rounded-lg bg-neutral-900 shrink-0 p-1 flex items-center justify-center overflow-hidden border border-neutral-800/80">
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
            className="text-xs font-bold text-white truncate block hover:text-neutral-300 transition-colors"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-black text-white">
              {formatMoney(product.price, locale)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-neutral-500 line-through">
                {formatMoney(product.originalPrice, locale)}
              </span>
            )}
          </div>
        </div>
        <Button
          isIconOnly
          size="sm"
          onClick={() => addToCart(product, 1)}
          className="bg-white text-black font-bold hover:bg-neutral-200"
          title={t.common.addToCart}
          aria-label={t.common.addToCart}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  // 2. List Variant (For Shop horizontal list view)
  if (variant === 'list') {
    return (
      <Card className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all">
        <CardBody className="p-4 sm:p-5 flex flex-col sm:flex-row gap-5">
          <div className="sm:w-56 h-48 rounded-xl bg-neutral-900 shrink-0 p-4 flex items-center justify-center overflow-hidden relative border border-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.thumbnail || '/images/products/brake-pads.svg'}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-105 transition-transform"
            />
            {product.discountPercentage && (
              <Chip
                size="sm"
                color="danger"
                variant="solid"
                className="absolute top-2 start-2 text-[10px] font-black h-5"
              >
                -{product.discountPercentage}%
              </Chip>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                {showSku && (
                  <span className="text-[11px] font-mono text-neutral-400">{product.sku}</span>
                )}
                {activeVehicle && fitmentStatus !== 'unknown' && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color={fitmentStatus === 'fits' ? 'success' : 'danger'}
                    startContent={
                      fitmentStatus === 'fits' ? (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                      )
                    }
                    className="text-[10px] font-bold"
                  >
                    {fitmentStatus === 'fits' ? t.vehicleFinder.fitsYourVehicle : t.vehicleFinder.doesNotFit}
                  </Chip>
                )}
              </div>

              <Link
                href={`/${locale}/product/${product.sku}`}
                className="text-sm font-bold text-white hover:text-neutral-300 transition-colors block line-clamp-1"
              >
                {product.name}
              </Link>

              {product.description && (
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              )}

              {product.merchant && (
                <span className="text-[11px] text-neutral-500 block">
                  {t.common.soldBy}{' '}
                  <span className="font-semibold text-neutral-300">{product.merchant.storeName}</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-black text-white">
                  {formatMoney(product.price, locale)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-neutral-500 line-through">
                    {formatMoney(product.originalPrice, locale)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {showQuickView && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="bordered"
                    className="border-neutral-800 text-neutral-300 hover:text-white"
                    onClick={() => openQuickView(product)}
                    title={t.common.quickView}
                    aria-label={t.common.quickView}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  isIconOnly
                  size="sm"
                  variant={isFavorited ? 'solid' : 'bordered'}
                  className={isFavorited ? 'bg-rose-500 text-white' : 'border-neutral-800 text-neutral-300'}
                  onClick={() => toggleWishlist(product)}
                  title={t.common.wishlist}
                  aria-label={t.common.wishlist}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  className="bg-white text-black font-bold text-xs hover:bg-neutral-200"
                  startContent={<ShoppingCart className="w-4 h-4" />}
                  onClick={() => addToCart(product, 1)}
                >
                  {t.common.addToCart}
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // 3. Grid Variant (Default Vercel Minimalist Dark Card)
  return (
    <Card className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all p-4 flex flex-col justify-between group">
      <div>
        {/* Top Badges and Media */}
        <div className="relative aspect-4/3 rounded-xl bg-neutral-900/80 p-4 mb-3 flex items-center justify-center overflow-hidden border border-neutral-800/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.thumbnail || '/images/products/brake-pads.svg'}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges Left/Top */}
          <div className="absolute top-2 start-2 flex flex-col gap-1 items-start">
            {product.discountPercentage && (
              <Chip size="sm" color="danger" variant="solid" className="text-[9px] font-black h-4 px-1">
                -{product.discountPercentage}%
              </Chip>
            )}
            {product.badges?.map((badge, idx) => (
              <Chip key={idx} size="sm" variant="flat" className="text-[9px] font-black h-4 bg-white/20 text-white">
                {resolveLocalized(badge.text, locale)}
              </Chip>
            ))}
          </div>

          {/* Floating Actions on Hover */}
          <div className="absolute top-2 end-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Tooltip content={t.common.wishlist} placement="left">
              <Button
                isIconOnly
                size="sm"
                className={`rounded-full shadow-md w-7 h-7 min-w-7 ${
                  isFavorited ? 'bg-rose-500 text-white' : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-700'
                }`}
                onClick={() => toggleWishlist(product)}
                aria-label={t.common.wishlist}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
            </Tooltip>

            {showCompare && (
              <Tooltip content={t.common.compare} placement="left">
                <Button
                  isIconOnly
                  size="sm"
                  className={`rounded-full shadow-md w-7 h-7 min-w-7 ${
                    isCompared ? 'bg-amber-500 text-black' : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-700'
                  }`}
                  onClick={() => addToCompare(product)}
                  aria-label={t.common.compare}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </Tooltip>
            )}

            {showQuickView && (
              <Tooltip content={t.common.quickView} placement="left">
                <Button
                  isIconOnly
                  size="sm"
                  className="rounded-full shadow-md w-7 h-7 min-w-7 bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-700"
                  onClick={() => openQuickView(product)}
                  aria-label={t.common.quickView}
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Fitment Indicator Badge if Car Selected */}
        {activeVehicle && fitmentStatus !== 'unknown' && (
          <div
            className={`text-[10px] font-bold px-2 py-1 rounded-md mb-2 flex items-center gap-1.5 ${
              fitmentStatus === 'fits'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
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
        <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1 font-mono">
          {showSku && <span>{product.sku}</span>}
          {product.brand && <span className="font-semibold text-neutral-300">{product.brand}</span>}
        </div>

        {/* Product Title */}
        <Link
          href={`/${locale}/product/${product.sku}`}
          className="text-xs font-bold text-white hover:text-neutral-300 transition-colors block line-clamp-2 min-h-[32px] leading-tight"
        >
          {product.name}
        </Link>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${
                  star <= Math.round(product.rating || 5)
                    ? 'fill-current text-amber-400'
                    : 'text-neutral-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-neutral-500 font-bold">
            ({product.reviewCount || 12})
          </span>
        </div>

        {/* Stock Progress Bar */}
        {showStockProgress && (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px] text-neutral-400 font-semibold">
              <span>{locale === 'ar' ? `مباع: ${product.soldCount || 14}` : `Sold: ${product.soldCount || 14}`}</span>
              <span className="text-neutral-300">{locale === 'ar' ? `المتاح: ${product.availableStock || 22}` : `Stock: ${product.availableStock || 22}`}</span>
            </div>
            <Progress
              value={soldPercent}
              size="sm"
              color={soldPercent > 80 ? 'danger' : 'default'}
              className="w-full"
              aria-label="Stock progress"
            />
          </div>
        )}
      </div>

      {/* Price & Add to Cart Bottom Strip */}
      <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between mt-3">
        <div>
          {product.originalPrice && (
            <span className="text-[10px] text-neutral-500 line-through block leading-none">
              {formatMoney(product.originalPrice, locale)}
            </span>
          )}
          <span className="text-sm font-black text-white leading-tight">
            {formatMoney(product.price, locale)}
          </span>
        </div>

        <Button
          size="sm"
          className="bg-white text-black hover:bg-neutral-200 font-bold text-xs"
          startContent={<ShoppingCart className="w-3.5 h-3.5" />}
          onClick={() => addToCart(product, 1)}
        >
          {t.common.addToCart}
        </Button>
      </div>
    </Card>
  );
};
