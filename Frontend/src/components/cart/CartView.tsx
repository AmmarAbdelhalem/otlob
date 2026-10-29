'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Tag,
  Store,
  ChevronRight,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { useCartStore } from '@/stores/useCartStore';
import { formatMoney, getMessages } from '@/lib/i18n';

interface CartViewProps {
  locale: Locale;
}

export const CartView: React.FC<CartViewProps> = ({ locale }) => {
  const t = getMessages(locale);
  const router = useRouter();

  const {
    cart,
    couponCode,
    discountPercentage,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCartStore();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    const res = await applyCoupon(inputCoupon);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponError(null);
      setInputCoupon('');
    } else {
      setCouponError(res.message);
      setCouponSuccess(null);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess(null);
    setCouponError(null);
  };

  if (cart.items.length === 0) {
    return (
      <div className="py-16 text-center space-y-6 max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-bg-secondary flex items-center justify-center text-text-muted border border-border-color shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-text-main">
            {locale === 'ar' ? 'سلة مشترياتك فارغة' : 'Your Shopping Cart is Empty'}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            {locale === 'ar'
              ? 'لم تقم بإضافة أي قطع غيار حتى الآن. استعرض كتالوج المنتجات المتوافقة مع سيارتك.'
              : 'You have not added any spare parts yet. Explore catalog parts matching your car.'}
          </p>
        </div>
        <Link
          href={`/${locale}/shop`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all"
        >
          <span>{locale === 'ar' ? 'تصفح قطع الغيار الآن' : 'Browse Auto Parts Now'}</span>
          {locale === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <nav className="flex items-center gap-2 text-xs text-text-muted">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">
            {locale === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-text-main font-medium">{t.nav.cart}</span>
        </nav>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl font-black text-text-main flex items-center gap-3">
            <span>{t.cart.title}</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {cart.itemCount} {locale === 'ar' ? 'قطع' : 'items'}
            </span>
          </h1>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.cart.clearCart}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Vendor Packages (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {cart.vendorGroups.map((group, groupIdx) => (
            <div
              key={group.merchantId}
              className="rounded-2xl border border-border-color bg-bg-primary overflow-hidden shadow-sm"
            >
              {/* Vendor Package Header */}
              <div className="p-4 bg-bg-secondary/50 border-b border-border-color flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-text-main">
                      {locale === 'ar' ? 'شحنة من تاجر:' : 'Shipment from:'}{' '}
                      <span className="text-primary">{group.merchantName}</span>
                    </span>
                    <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>{group.estimatedDeliveryEta}</span>
                    </p>
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-text-muted">
                    {locale === 'ar' ? 'رسوم التوصيل:' : 'Delivery:'}{' '}
                    <strong className="text-text-main font-bold">
                      {formatMoney(group.estimatedDeliveryFee, locale)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Items List in this vendor package */}
              <div className="divide-y divide-border-color">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex items-center gap-4 flex-wrap sm:flex-nowrap"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl bg-bg-secondary/40 border border-border-color p-2 flex-shrink-0">
                      <img
                        src={item.product.thumbnail}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <Link
                        href={`/${locale}/product/${item.product.sku}`}
                        className="font-bold text-sm text-text-main hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-text-muted font-mono flex-wrap">
                        <span>SKU: {item.product.sku}</span>
                        <span>•</span>
                        <span>OEM: {item.product.oemNumber}</span>
                        {item.product.brand && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-sans font-semibold">
                              {item.product.brand}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-text-muted">
                        <span>{formatMoney(item.unitPrice, locale)}</span>
                        <span className="text-text-muted/60"> / {locale === 'ar' ? 'قطعة' : 'unit'}</span>
                      </div>
                    </div>

                    {/* Quantity Stepper & Price */}
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end justify-between w-full sm:w-auto">
                      <div className="flex items-center border border-border-color rounded-xl bg-bg-secondary h-9">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 text-text-muted hover:text-text-main transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 font-mono font-bold text-xs min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2.5 text-text-muted hover:text-text-main transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-end">
                        <span className="text-base font-extrabold text-text-main block">
                          {formatMoney(item.totalPrice, locale)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-xs text-rose-500 hover:text-rose-700 transition-colors inline-flex items-center gap-1 mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{locale === 'ar' ? 'حذف' : 'Remove'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Package Subtotal Footer */}
              <div className="p-3.5 bg-bg-secondary/20 border-t border-border-color flex items-center justify-between text-xs text-text-muted">
                <span>{locale === 'ar' ? 'إجمالي هذه الشحنة:' : 'Package Subtotal:'}</span>
                <span className="font-bold text-text-main text-sm">
                  {formatMoney(group.subtotal + group.estimatedDeliveryFee, locale)}
                </span>
              </div>
            </div>
          ))}

          {/* Continue Shopping Link */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href={`/${locale}/shop`}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
            >
              {locale === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t.cart.continueShopping}</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Summary Box */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-secondary/30 space-y-5 shadow-sm">
            <h2 className="text-lg font-black text-text-main">
              {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs border-b border-border-color pb-5">
              <div className="flex justify-between text-text-muted">
                <span>{t.cart.subtotal}</span>
                <span className="font-mono font-bold text-text-main">
                  {formatMoney(cart.subtotal, locale)}
                </span>
              </div>

              <div className="flex justify-between text-text-muted">
                <span className="flex items-center gap-1">
                  <span>{t.cart.deliveryFee}</span>
                  <span className="text-[10px] text-text-muted/70">
                    ({cart.vendorGroups.length} {locale === 'ar' ? 'شحنات تجار' : 'packages'})
                  </span>
                </span>
                <span className="font-mono font-bold text-text-main">
                  {formatMoney(cart.totalDeliveryFee, locale)}
                </span>
              </div>

              <div className="flex justify-between text-text-muted">
                <span>{t.cart.serviceFee}</span>
                <span className="font-mono font-bold text-text-main">
                  {formatMoney(cart.platformServiceFee, locale)}
                </span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>
                    {locale === 'ar' ? `خصم الكوبون (${discountPercentage}%)` : `Coupon Discount (${discountPercentage}%)`}
                  </span>
                  <span className="font-mono">
                    -{formatMoney(cart.discountAmount, locale)}
                  </span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-sm font-bold text-text-main block">{t.cart.total}</span>
                <span className="text-[11px] text-text-muted">
                  {locale === 'ar' ? 'شامل ضريبة القيمة المضافة 14%' : 'Includes 14% VAT'}
                </span>
              </div>
              <span className="text-2xl font-black text-primary font-mono">
                {formatMoney(cart.totalAmount, locale)}
              </span>
            </div>

            {/* Coupon Code Section */}
            <div className="pt-2">
              {couponCode ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <Tag className="w-4 h-4" />
                    <span>
                      {locale === 'ar' ? 'الكوبون المفعل:' : 'Active Coupon:'}{' '}
                      <strong className="font-mono">{couponCode}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-rose-500 hover:text-rose-700 font-bold text-xs"
                  >
                    {locale === 'ar' ? 'إلغاء' : 'Remove'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={locale === 'ar' ? 'كود الخصم (جرب: OTLOB10)' : 'Coupon code (try: OTLOB10)'}
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-border-color bg-bg-primary uppercase font-mono focus:outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-bg-secondary text-text-main font-bold text-xs hover:bg-primary hover:text-white border border-border-color transition-colors"
                    >
                      {t.cart.applyCoupon}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{couponError}</span>
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{couponSuccess}</span>
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Checkout Action Button */}
            <Link
              href={`/${locale}/checkout`}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{t.cart.checkout}</span>
              {locale === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>

          {/* Guarantees Box */}
          <div className="p-4 rounded-xl border border-border-color bg-bg-primary space-y-3 text-xs text-text-muted">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
              <span>
                {locale === 'ar'
                  ? 'قطع أصلية ومضمونة 100% مع حق المعاينة عند الاستلام'
                  : '100% genuine parts with inspection on delivery'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                {locale === 'ar'
                  ? 'توصيل سريع وتتبع لحظي لمندوب الشحن على الخريطة'
                  : 'Express delivery with live map courier tracking'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
