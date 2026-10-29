'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  MapPin,
  ChevronRight,
  AlertCircle,
  Store,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Locale, PaymentType } from '@/lib/api/types';
import { useCartStore } from '@/stores/useCartStore';
import { formatMoney, getMessages } from '@/lib/i18n';
import { services } from '@/lib/api';

interface CheckoutViewProps {
  locale: Locale;
}

const EGYPTIAN_GOVERNORATES = [
  { id: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { id: 'giza', nameAr: 'الجيزة', nameEn: 'Giza', lat: 30.0131, lng: 31.2089 },
  { id: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria', lat: 31.2001, lng: 29.9187 },
  { id: 'qalyubia', nameAr: 'القليوبية', nameEn: 'Qalyubia', lat: 30.3292, lng: 31.2168 },
  { id: 'sharqia', nameAr: 'الشرقية', nameEn: 'Sharqia', lat: 30.5877, lng: 31.502 },
  { id: 'dakahlia', nameAr: 'الدقهلية', nameEn: 'Dakahlia', lat: 31.0409, lng: 31.3785 },
];

export const CheckoutView: React.FC<CheckoutViewProps> = ({ locale }) => {
  const t = getMessages(locale);
  const router = useRouter();
  const { cart, clearCart } = useCartStore();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [selectedGov, setSelectedGov] = useState('cairo');
  const [addressLine, setAddressLine] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('cod');

  // Interactive Map Preset State
  const [currentCoords, setCurrentCoords] = useState({
    lat: 30.0444,
    lng: 31.2357,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate Egyptian phone number
  const isValidEgyptianPhone = (num: string) => {
    const clean = num.trim().replace(/[\s-]/g, '');
    return /^01[0125][0-9]{8}$/.test(clean);
  };

  const handleGovChange = (govId: string) => {
    setSelectedGov(govId);
    const found = EGYPTIAN_GOVERNORATES.find((g) => g.id === govId);
    if (found) {
      setCurrentCoords({ lat: found.lat, lng: found.lng });
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage(locale === 'ar' ? 'يرجى إدخال الاسم بالكامل' : 'Please enter full name');
      return;
    }

    if (!isValidEgyptianPhone(phone)) {
      setErrorMessage(
        locale === 'ar'
          ? 'يرجى إدخال رقم هاتف محمول مصري صحيح مكون من 11 رقم (مثال: 01012345678)'
          : 'Please enter a valid 11-digit Egyptian phone number (e.g. 01012345678)'
      );
      return;
    }

    if (!addressLine.trim()) {
      setErrorMessage(locale === 'ar' ? 'يرجى كتابة عنوان التوصيل بالتفصيل' : 'Please provide detailed delivery address');
      return;
    }

    try {
      setLoading(true);

      const items = cart.items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      }));

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map((it) => ({
            product_id: it.productId,
            quantity: it.quantity,
          })),
          delivery_lat: currentCoords.lat,
          delivery_lng: currentCoords.lng,
          payment_type: paymentType,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        if (res.status === 401) {
          router.push(`/${locale}/auth/login?redirect=/${locale}/checkout`);
          return;
        }
        throw new Error(
          result.message ||
            (locale === 'ar'
              ? 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.'
              : 'Error placing order. Please retry.')
        );
      }

      // Clear the local cart
      clearCart();

      const orderCode = result.data?.order_code || result.data?.orderCode;

      // Navigate to tracking
      router.push(`/${locale}/order-tracking?code=${orderCode}`);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (locale === 'ar' ? 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.' : 'Error placing order. Please retry.')
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-text-main">
          {locale === 'ar' ? 'لا توجد عناصر في السلة لإتمام الشراء' : 'No items in cart to checkout'}
        </h2>
        <Link
          href={`/${locale}/shop`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover"
        >
          {locale === 'ar' ? 'العودة للمتجر' : 'Return to Shop'}
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
          <Link href={`/${locale}/cart`} className="hover:text-primary transition-colors">
            {t.nav.cart}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-text-main font-medium">
            {locale === 'ar' ? 'إتمام الشراء وتأكيد الطلب' : 'Checkout'}
          </span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-black text-text-main">
          {locale === 'ar' ? 'إتمام الطلب وتفاصيل التوصيل' : 'Checkout & Delivery Details'}
        </h1>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Delivery Address, Contact Info & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer & Workshop Contact Information */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-primary space-y-5 shadow-sm">
            <h2 className="text-base font-bold text-text-main flex items-center gap-2 border-b border-border-color pb-3">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center">
                1
              </span>
              <span>{locale === 'ar' ? 'بيانات المستلم والاتصال' : 'Recipient & Contact Info'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-text-main block">
                  {locale === 'ar' ? 'الاسم بالكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={locale === 'ar' ? 'مثال: محمد أحمد إبراهيم' : 'e.g. Mohamed Ahmed Ibrahim'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-color bg-bg-secondary/20 focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-main block">
                  {locale === 'ar' ? 'رقم الهاتف المحمول (مصر) *' : 'Egyptian Mobile Number *'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-color bg-bg-secondary/20 font-mono focus:outline-none focus:border-primary text-xs text-start"
                  dir="ltr"
                />
                <span className="text-[10px] text-text-muted">
                  {locale === 'ar' ? 'سنرسل كود التحقق وموقع المندوب عبر هذا الرقم' : 'We will send OTP and tracking via this number'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-main block">
                  {locale === 'ar' ? 'رقم هاتف إضافي / واتساب (اختياري)' : 'Secondary / WhatsApp Phone (Optional)'}
                </label>
                <input
                  type="tel"
                  placeholder="01187654321"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-color bg-bg-secondary/20 font-mono focus:outline-none focus:border-primary text-xs text-start"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Location & GPS Pin Simulation */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-primary space-y-5 shadow-sm">
            <h2 className="text-base font-bold text-text-main flex items-center gap-2 border-b border-border-color pb-3">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center">
                2
              </span>
              <span>{locale === 'ar' ? 'عنوان التوصيل أو الورشة' : 'Delivery Address & Location'}</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-text-main block">
                    {locale === 'ar' ? 'المحافظة *' : 'Governorate *'}
                  </label>
                  <select
                    value={selectedGov}
                    onChange={(e) => handleGovChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-color bg-bg-secondary/20 focus:outline-none focus:border-primary text-xs"
                  >
                    {EGYPTIAN_GOVERNORATES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {locale === 'ar' ? g.nameAr : g.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-text-main block">
                    {locale === 'ar' ? 'اسم الورشة أو مركز الخدمة (اختياري)' : 'Workshop / Service Center Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={locale === 'ar' ? 'مثال: ورشة الأمل للميكانيكا' : 'e.g. Al-Amal Auto Care'}
                    value={workshopName}
                    onChange={(e) => setWorkshopName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-color bg-bg-secondary/20 focus:outline-none focus:border-primary text-xs"
                  >
                  </input>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-text-main block">
                  {locale === 'ar' ? 'العنوان بالتفصيل مع أقرب علامة مميزة *' : 'Detailed Address & Nearby Landmark *'}
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder={
                    locale === 'ar'
                      ? 'مثال: شارع التحرير، عمارة 18 الدور الأرضي، بجوار صيدلية العزبي ومحطة مترو الدقي'
                      : 'e.g. 18 Tahrir St, Ground floor, next to El-Ezaby Pharmacy, Dokki'
                  }
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-color bg-bg-secondary/20 focus:outline-none focus:border-primary text-xs"
                />
              </div>

              {/* GPS Coordinates Simulation Pin */}
              <div className="p-3.5 rounded-xl bg-bg-secondary/40 border border-border-color space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-main flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    {locale === 'ar' ? 'إحداثيات موقع التسليم (GPS):' : 'Delivery GPS Coordinates:'}
                  </span>
                  <span className="font-mono text-text-muted text-[11px]">
                    {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap text-[11px]">
                  <span className="text-text-muted self-center">
                    {locale === 'ar' ? 'تحديد سريع للمنطقة:' : 'Quick Select:'}
                  </span>
                  {[
                    { label: 'وسط البلد', lat: 30.0444, lng: 31.2357 },
                    { label: 'مدينة نصر', lat: 30.0561, lng: 31.3444 },
                    { label: 'المهندسين', lat: 30.0601, lng: 31.2014 },
                    { label: 'المعادي', lat: 29.9602, lng: 31.2569 },
                    { label: 'الإسكندرية', lat: 31.2001, lng: 29.9187 },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentCoords({ lat: p.lat, lng: p.lng })}
                      className="px-2.5 py-1 rounded-lg border border-border-color bg-bg-primary hover:border-primary text-text-main font-medium transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method Selection */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-primary space-y-5 shadow-sm">
            <h2 className="text-base font-bold text-text-main flex items-center gap-2 border-b border-border-color pb-3">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center">
                3
              </span>
              <span>{locale === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</span>
            </h2>

            <div className="space-y-3">
              {/* Option 1: Cash on Delivery */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentType === 'cod'
                    ? 'border-primary bg-primary/5'
                    : 'border-border-color bg-bg-secondary/20 hover:border-text-muted'
                }`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="cod"
                  checked={paymentType === 'cod'}
                  onChange={() => setPaymentType('cod')}
                  className="mt-1 text-primary focus:ring-primary"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-xs text-text-main">
                      {locale === 'ar' ? 'الدفع نقداً عند الاستلام (COD)' : 'Cash on Delivery (COD)'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {locale === 'ar' ? 'الأكثر شيوعاً' : 'Popular'}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    {locale === 'ar'
                      ? 'ادفع نقداً لمندوب الشحن بعد معاينة القطع في يدك والتأكد من مطابقة أرقام الـ OEM.'
                      : 'Pay cash to the courier upon delivery and parts inspection.'}
                  </p>
                </div>
              </label>

              {/* Option 2: Credit / Debit Card */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentType === 'card'
                    ? 'border-primary bg-primary/5'
                    : 'border-border-color bg-bg-secondary/20 hover:border-text-muted'
                }`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="card"
                  checked={paymentType === 'card'}
                  onChange={() => setPaymentType('card')}
                  className="mt-1 text-primary focus:ring-primary"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span className="font-bold text-xs text-text-main">
                      {locale === 'ar' ? 'بطاقة بنكية (فيزا / ماستركارد / ميزة)' : 'Credit / Debit Card (Visa, MC, Meeza)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    {locale === 'ar'
                      ? 'دفع إلكتروني آمن 100% مشفر بالكامل عبر البنك المركزي المصري.'
                      : 'Secure online payment with 3D Secure verification.'}
                  </p>
                </div>
              </label>

              {/* Option 3: Digital Wallet / Instapay */}
              <label
                className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentType === 'wallet'
                    ? 'border-primary bg-primary/5'
                    : 'border-border-color bg-bg-secondary/20 hover:border-text-muted'
                }`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value="wallet"
                  checked={paymentType === 'wallet'}
                  onChange={() => setPaymentType('wallet')}
                  className="mt-1 text-primary focus:ring-primary"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-xs text-text-main">
                      {locale === 'ar' ? 'إنستاباي ومحافظ الهاتف (Instapay / Vodafone Cash)' : 'Instapay & Mobile Wallets'}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    {locale === 'ar'
                      ? 'تحويل فوري عبر شبكة المدفوعات اللحظية IPN أو محافظ فودافون وأورنج واتصالات كاش.'
                      : 'Instant transfer via IPN or mobile wallets.'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary: Multi-Vendor Packages Breakdown & Place Order (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Multi-Vendor Packages Card */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-secondary/30 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-text-main">
                {locale === 'ar' ? 'شحنات التجار المنفصلة' : 'Merchant Shipments'}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                {cart.vendorGroups.length} {locale === 'ar' ? 'شحنات' : 'packages'}
              </span>
            </div>

            {/* Explanatory Multi-Vendor Alert */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {locale === 'ar'
                  ? `أنت تشتري من ${cart.vendorGroups.length} تجار معتمدين. يتم شحن كل طرد مباشرة من مستودع التاجر لتسريع وصول القطع لورشتك.`
                  : `You are purchasing from ${cart.vendorGroups.length} verified vendors. Each package ships directly from the merchant warehouse.`}
              </p>
            </div>

            {/* Vendor Groups Preview */}
            <div className="space-y-3">
              {cart.vendorGroups.map((group, idx) => (
                <div
                  key={group.merchantId}
                  className="p-3.5 rounded-xl border border-border-color bg-bg-primary text-xs space-y-2"
                >
                  <div className="flex items-center justify-between font-bold text-text-main">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-primary" />
                      {group.merchantName}
                    </span>
                    <span className="font-mono text-primary">
                      {formatMoney(group.subtotal + group.estimatedDeliveryFee, locale)}
                    </span>
                  </div>

                  <div className="divide-y divide-border-color/60 text-[11px] text-text-muted">
                    {group.items.map((it) => (
                      <div key={it.id} className="py-1 flex justify-between">
                        <span className="truncate max-w-[200px]">
                          {it.quantity}× {it.product.name}
                        </span>
                        <span className="font-mono">{formatMoney(it.totalPrice, locale)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-emerald-600 pt-1 border-t border-border-color/40">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {group.estimatedDeliveryEta}
                    </span>
                    <span>
                      {locale === 'ar' ? 'توصيل:' : 'Delivery:'}{' '}
                      <strong>{formatMoney(group.estimatedDeliveryFee, locale)}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs border-t border-border-color pt-4 text-text-muted">
              <div className="flex justify-between">
                <span>{t.cart.subtotal}</span>
                <span className="font-mono font-bold text-text-main">
                  {formatMoney(cart.subtotal, locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t.cart.deliveryFee}</span>
                <span className="font-mono font-bold text-text-main">
                  {formatMoney(cart.totalDeliveryFee, locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t.cart.serviceFee}</span>
                <span className="font-mono font-bold text-text-main">
                  {formatMoney(cart.platformServiceFee, locale)}
                </span>
              </div>
              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{locale === 'ar' ? 'خصم الكوبون' : 'Coupon Discount'}</span>
                  <span className="font-mono">-{formatMoney(cart.discountAmount, locale)}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="flex items-baseline justify-between border-t border-border-color pt-4">
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

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Lock className="w-4 h-4" />
              <span>
                {loading
                  ? locale === 'ar'
                    ? 'جاري تأكيد وتجهيز الطلب...'
                    : 'Processing Order...'
                  : locale === 'ar'
                  ? 'تأكيد الطلب الآن'
                  : 'Confirm & Place Order'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
