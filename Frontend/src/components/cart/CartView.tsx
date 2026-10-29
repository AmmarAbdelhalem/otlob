'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Input,
  Chip,
  Divider,
} from '@heroui/react';
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
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const res = await applyCoupon(inputCoupon);
      if (res.success) {
        setCouponSuccess(res.message);
        setCouponError(null);
        setInputCoupon('');
      } else {
        setCouponError(res.message);
        setCouponSuccess(null);
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess(null);
    setCouponError(null);
  };

  if (cart.items.length === 0) {
    return (
      <div className="py-24 text-center space-y-6 max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-[#0a0a0a] border border-[#262626] flex items-center justify-center text-neutral-500 shadow-inner">
          <ShoppingBag className="w-12 h-12 opacity-50" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {locale === 'ar' ? 'سلة مشترياتك فارغة' : 'Your Shopping Cart is Empty'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            {locale === 'ar'
              ? 'لم تقم بإضافة أي قطع غيار حتى الآن. استعرض كتالوج المنتجات المتوافقة مع سيارتك.'
              : 'You have not added any spare parts yet. Explore catalog parts matching your car.'}
          </p>
        </div>
        <Button
          as={Link}
          href={`/${locale}/shop`}
          className="bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors px-6 py-5 shadow-sm"
          endContent={locale === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        >
          {locale === 'ar' ? 'تصفح قطع الغيار الآن' : 'Browse Auto Parts Now'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <nav className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
          <Link href={`/${locale}`} className="hover:text-white transition-colors">
            {locale === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-white font-medium">{t.nav.cart}</span>
        </nav>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <span>{t.cart.title}</span>
            <Chip size="sm" variant="flat" className="bg-[#171717] text-white border border-[#262626] font-mono">
              {cart.itemCount} {locale === 'ar' ? 'قطع' : 'items'}
            </Chip>
          </h1>
          <Button
            size="sm"
            variant="light"
            onPress={clearCart}
            className="text-neutral-400 hover:text-rose-400 text-xs font-semibold"
            startContent={<Trash2 className="w-3.5 h-3.5" />}
          >
            {t.cart.clearCart}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Vendor Packages (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {cart.vendorGroups.map((group) => (
            <Card
              key={group.merchantId}
              className="border border-[#262626] bg-[#0a0a0a] shadow-sm rounded-2xl overflow-hidden"
            >
              {/* Vendor Package Header */}
              <CardHeader className="p-4 bg-[#111111] border-b border-[#262626] flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#171717] border border-[#262626] text-white flex items-center justify-center font-bold">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white">
                      {locale === 'ar' ? 'شحنة من تاجر:' : 'Shipment from:'}{' '}
                      <span className="text-neutral-300 font-normal">{group.merchantName}</span>
                    </span>
                    <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5 font-mono">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>{group.estimatedDeliveryEta}</span>
                    </p>
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-neutral-400 text-xs font-mono">
                    {locale === 'ar' ? 'رسوم التوصيل:' : 'Delivery:'}{' '}
                    <strong className="text-white font-bold">
                      {formatMoney(group.estimatedDeliveryFee, locale)}
                    </strong>
                  </span>
                </div>
              </CardHeader>

              {/* Items List in this vendor package */}
              <CardBody className="p-0 divide-y divide-[#262626]">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex items-center gap-4 flex-wrap sm:flex-nowrap"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl bg-[#141414] border border-[#262626] p-2 flex-shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.thumbnail || '/images/products/brake-pads.svg'}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <Link
                        href={`/${locale}/product/${item.product.sku}`}
                        className="font-bold text-sm text-white hover:underline transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono flex-wrap">
                        <span>SKU: {item.product.sku}</span>
                        {item.product.oemNumber && (
                          <>
                            <span>•</span>
                            <span>OEM: {item.product.oemNumber}</span>
                          </>
                        )}
                        {item.product.brand && (
                          <>
                            <span>•</span>
                            <span className="text-white font-sans font-semibold">
                              {item.product.brand}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 font-mono">
                        <span>{formatMoney(item.unitPrice, locale)}</span>
                        <span className="opacity-60"> / {locale === 'ar' ? 'قطعة' : 'unit'}</span>
                      </div>
                    </div>

                    {/* Quantity Stepper & Price */}
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end justify-between w-full sm:w-auto">
                      <div className="flex items-center border border-[#262626] rounded-xl bg-[#111111] h-8">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 min-w-7 text-neutral-300 hover:text-white"
                          isDisabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <span className="px-2 font-mono font-bold text-xs min-w-[28px] text-center text-white">
                          {item.quantity}
                        </span>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 min-w-7 text-neutral-300 hover:text-white"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="text-end">
                        <span className="text-base font-extrabold text-white block font-mono">
                          {formatMoney(item.totalPrice, locale)}
                        </span>
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => removeItem(item.productId)}
                          className="text-xs text-neutral-500 hover:text-rose-400 h-auto p-0 min-w-0"
                          startContent={<Trash2 className="w-3 h-3" />}
                        >
                          {locale === 'ar' ? 'حذف' : 'Remove'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>

              {/* Package Subtotal Footer */}
              <CardFooter className="p-3.5 bg-[#111111] border-t border-[#262626] flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>{locale === 'ar' ? 'إجمالي هذه الشحنة:' : 'Package Subtotal:'}</span>
                <span className="font-bold text-white text-sm">
                  {formatMoney(group.subtotal + group.estimatedDeliveryFee, locale)}
                </span>
              </CardFooter>
            </Card>
          ))}

          {/* Continue Shopping Link */}
          <div className="flex items-center justify-between pt-2">
            <Button
              as={Link}
              href={`/${locale}/shop`}
              variant="light"
              size="sm"
              className="text-neutral-400 hover:text-white text-xs font-semibold p-0"
              startContent={locale === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            >
              <span>{t.cart.continueShopping}</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-[#262626] bg-[#0a0a0a] shadow-sm rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs border-b border-[#262626] pb-5 text-neutral-400 font-mono">
              <div className="flex justify-between">
                <span>{t.cart.subtotal}</span>
                <span className="font-bold text-white">
                  {formatMoney(cart.subtotal, locale)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <span>{t.cart.deliveryFee}</span>
                  <span className="text-[10px] opacity-60">
                    ({cart.vendorGroups.length} {locale === 'ar' ? 'شحنات تجار' : 'packages'})
                  </span>
                </span>
                <span className="font-bold text-white">
                  {formatMoney(cart.totalDeliveryFee, locale)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>{t.cart.serviceFee}</span>
                <span className="font-bold text-white">
                  {formatMoney(cart.platformServiceFee, locale)}
                </span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>
                    {locale === 'ar' ? `خصم الكوبون (${discountPercentage}%)` : `Coupon Discount (${discountPercentage}%)`}
                  </span>
                  <span>
                    -{formatMoney(cart.discountAmount, locale)}
                  </span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-sm font-bold text-white block">{t.cart.total}</span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {locale === 'ar' ? 'شامل ضريبة القيمة المضافة 14%' : 'Includes 14% VAT'}
                </span>
              </div>
              <span className="text-2xl font-black text-white font-mono">
                {formatMoney(cart.totalAmount, locale)}
              </span>
            </div>

            {/* Coupon Code Section */}
            <div className="pt-2">
              {couponCode ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Tag className="w-4 h-4" />
                    <span>
                      {locale === 'ar' ? 'الكوبون المفعل:' : 'Active Coupon:'}{' '}
                      <strong className="font-mono">{couponCode}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-rose-400 hover:underline font-bold text-xs cursor-pointer"
                  >
                    {locale === 'ar' ? 'إلغاء' : 'Remove'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      size="sm"
                      variant="bordered"
                      placeholder={t.cart.couponPlaceholder}
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      classNames={{
                        inputWrapper: 'border-[#262626] bg-[#111111] hover:border-neutral-600',
                        input: 'text-xs uppercase font-mono',
                      }}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="flat"
                      isLoading={isApplyingCoupon}
                      className="bg-[#171717] hover:bg-[#262626] text-white border border-[#262626] text-xs font-semibold px-4"
                    >
                      {t.cart.applyCoupon}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{couponError}</span>
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{couponSuccess}</span>
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Checkout Action Button */}
            <Button
              as={Link}
              href={`/${locale}/checkout`}
              className="w-full bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors py-6 shadow-sm"
              endContent={locale === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            >
              <span>{t.cart.checkout}</span>
            </Button>
          </Card>

          {/* Guarantees Box */}
          <div className="p-4 rounded-xl border border-[#262626] bg-[#0a0a0a] space-y-3 text-xs text-neutral-400">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-white flex-shrink-0" />
              <span>
                {locale === 'ar'
                  ? 'قطع أصلية ومضمونة 100% مع حق المعاينة عند الاستلام'
                  : '100% genuine parts with inspection on delivery'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
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
