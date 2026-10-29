'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCartStore } from '@/stores/useCartStore';
import { useUIStore } from '@/stores/useUIStore';
import { ProductCard } from '@/components/product/ProductCard';
import { getMessages } from '@/lib/i18n';

interface WishlistViewProps {
  locale: Locale;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ locale }) => {
  const t = getMessages(locale);
  const { items, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { setMiniCartOpen } = useUIStore();

  const handleAddAllToCart = () => {
    items.forEach((p) => addItem(p, 1));
    setMiniCartOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <nav className="flex items-center gap-2 text-xs text-text-muted">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">
            {locale === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-text-main font-medium">{t.nav.wishlist}</span>
        </nav>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl font-black text-text-main flex items-center gap-3">
            <span>{locale === 'ar' ? 'قائمة الرغبات والقطع المحفوظة' : 'My Wishlist'}</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
              {items.length} {locale === 'ar' ? 'قطع' : 'items'}
            </span>
          </h1>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearWishlist}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{locale === 'ar' ? 'تفريغ القائمة' : 'Clear Wishlist'}</span>
              </button>

              <button
                type="button"
                onClick={handleAddAllToCart}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-md shadow-primary/20 transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{locale === 'ar' ? 'أضف الكل للسلة' : 'Add All to Cart'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-16 text-center space-y-6 max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-400 border border-rose-200 shadow-inner">
            <Heart className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-text-main">
              {locale === 'ar' ? 'قائمة أمنياتك فارغة' : 'Your Wishlist is Empty'}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              {locale === 'ar'
                ? 'احتفظ بقطع الغيار التي تهتم بها بالضغط على أيقونة القلب في أي صفحة منتج.'
                : 'Save spare parts you are interested in by clicking the heart icon on any product.'}
            </p>
          </div>
          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all"
          >
            <span>{locale === 'ar' ? 'استكشف قطع الغيار الآن' : 'Explore Auto Parts'}</span>
            {locale === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((prod) => (
            <ProductCard key={prod.id} product={prod} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
};
