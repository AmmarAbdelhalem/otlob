'use client';

import React from 'react';
import Link from 'next/link';
import { X, ShoppingCart, Star, CheckCircle, ShieldCheck, Truck, ArrowRight, Heart } from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { formatMoney, getMessages } from '@/lib/i18n';
import { useUIStore } from '@/stores/useUIStore';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';

interface QuickViewModalProps {
  locale: Locale;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ locale }) => {
  const t = getMessages(locale);
  const { isQuickViewOpen, quickViewProduct, closeQuickView } = useUIStore();
  const { addItem: addToCart } = useCartStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();

  if (!isQuickViewOpen || !quickViewProduct) return null;

  const isFavorited = isInWishlist(quickViewProduct.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl border border-surface-border overflow-hidden relative">
        <button
          onClick={closeQuickView}
          className="absolute top-4 end-4 z-10 p-2 rounded-full bg-surface-muted hover:bg-slate-200 dark:hover:bg-slate-700 text-text transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Product Image */}
          <div className="aspect-square rounded-xl bg-slate-50 dark:bg-slate-800 p-6 flex items-center justify-center border border-surface-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={quickViewProduct.thumbnail || '/images/products/brake-pads.svg'}
              alt={quickViewProduct.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                <span>SKU: {quickViewProduct.sku}</span>
                {quickViewProduct.oemNumber && <span>OEM: {quickViewProduct.oemNumber}</span>}
              </div>

              <h2 className="text-base font-bold text-text leading-snug">
                {quickViewProduct.name}
              </h2>

              <div className="flex items-center gap-1 text-accent">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3.5 h-3.5 fill-current text-amber-400" />
                ))}
                <span className="text-xs text-text-muted ms-1 font-bold">
                  ({quickViewProduct.reviewCount || 15} تقييم)
                </span>
              </div>

              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-xl font-black text-primary">
                  {formatMoney(quickViewProduct.price, locale)}
                </span>
                {quickViewProduct.originalPrice && (
                  <span className="text-xs text-text-muted line-through">
                    {formatMoney(quickViewProduct.originalPrice, locale)}
                  </span>
                )}
              </div>

              <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                {quickViewProduct.description}
              </p>

              <div className="space-y-1.5 pt-2 text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>متوفر للشحن الفوري والتسليم في نفس اليوم</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>ضمان استبدال واسترجاع لمدة 14 يوماً</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-surface-border">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    addToCart(quickViewProduct, 1);
                    closeQuickView();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t.common.addToCart}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(quickViewProduct)}
                  className={`p-3 rounded-xl border border-surface-border transition-colors cursor-pointer ${
                    isFavorited ? 'bg-primary text-white border-primary' : 'hover:bg-surface-muted text-text'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <Link
                href={`/${locale}/product/${quickViewProduct.sku}`}
                onClick={closeQuickView}
                className="w-full py-2.5 rounded-xl border border-surface-border hover:bg-surface-muted text-text text-center text-xs font-bold block transition-colors"
              >
                عرض الصفحة الكاملة للمنتج والمواصفات
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
