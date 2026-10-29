'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  RadioGroup,
  Radio,
  Chip,
  Divider,
} from '@heroui/react';
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
  Lock,
} from 'lucide-react';
import { Locale, PaymentType } from '@/lib/api/types';
import { useCartStore } from '@/stores/useCartStore';
import { formatMoney, getMessages } from '@/lib/i18n';

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
      setErrorMessage(
        locale === 'ar'
          ? 'يرجى كتابة عنوان التوصيل بالتفصيل'
          : 'Please provide detailed delivery address'
      );
      return;
    }

    try {
      setLoading(true);

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

      clearCart();
      const orderCode = result.data?.order_code || result.data?.orderCode;
      router.push(`/${locale}/order-tracking?code=${orderCode}`);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (locale === 'ar'
            ? 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.'
            : 'Error placing order. Please retry.')
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white">
          {locale === 'ar' ? 'لا توجد عناصر في السلة لإتمام الشراء' : 'No items in cart to checkout'}
        </h2>
        <Button
          as={Link}
          href={`/${locale}/shop`}
          className="bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors"
        >
          {locale === 'ar' ? 'العودة للمتجر' : 'Return to Shop'}
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
          <Link href={`/${locale}/cart`} className="hover:text-white transition-colors">
            {t.nav.cart}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-white font-medium">
            {locale === 'ar' ? 'إتمام الشراء وتأكيد الطلب' : 'Checkout'}
          </span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {locale === 'ar' ? 'إتمام الطلب وتفاصيل التوصيل' : 'Checkout & Delivery Details'}
        </h1>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Delivery Address, Contact Info & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Customer Contact Information */}
          <Card className="p-6 rounded-2xl border border-[#262626] bg-[#0a0a0a] shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#262626] pb-3">
              <span className="w-6 h-6 rounded-full bg-white text-black text-xs font-black flex items-center justify-center font-mono">
                1
              </span>
              <span>{locale === 'ar' ? 'بيانات المستلم والاتصال' : 'Recipient & Contact Info'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label={locale === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                  isRequired
                  size="sm"
                  variant="bordered"
                  placeholder={locale === 'ar' ? 'مثال: محمد أحمد إبراهيم' : 'e.g. Mohamed Ahmed Ibrahim'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  classNames={{
                    inputWrapper: 'border-[#262626] bg-[#111111] hover:border-neutral-600',
                    label: 'text-neutral-400 font-medium text-xs',
                    input: 'text-xs text-white',
                  }}
                />
              </div>

              <div>
                <Input
                  label={locale === 'ar' ? 'رقم الهاتف المحمول' : 'Mobile Number'}
                  isRequired
                  size="sm"
                  variant="bordered"
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  description={locale === 'ar' ? 'مطلوب 11 رقم للتحقق وتتبع المندوب' : '11-digit mobile required'}
                  classNames={{
                    inputWrapper: 'border-[#262626] bg-[#111111] hover:border-neutral-600',
                    label: 'text-neutral-400 font-medium text-xs',
                    input: 'text-xs font-mono text-white',
                  }}
                  dir="ltr"
                />
              </div>

              <div>
                <Input
                  label={locale === 'ar' ? 'رقم هاتف إضافي / واتساب' : 'Secondary Phone (Optional)'}
                  size="sm"
                  variant="bordered"
                  placeholder="01187654321"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  classNames={{
                    inputWrapper: 'border-[#262626] bg-[#111111] hover:border-neutral-600',
                    label: 'text-neutral-400 font-medium text-xs',
                    input: 'text-xs font-mono text-white',
                  }}
                  dir="ltr"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Delivery Location & GPS Pin Simulation */}
          <Card className="p-6 rounded-2xl border border-[#262626] bg-[#0a0a0a] shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#262626] pb-3">
              <span className="w-6 h-6 rounded-full bg-white text-black text-xs font-black flex items-center justify-center font-mono">
                2
              </span>
              <span>{locale === 'ar' ? 'عنوان التوصيل أو الورشة' : 'Delivery Address & Location'}</span>
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label={locale === 'ar' ? 'المحافظة' : 'Governorate'}
                  selectedKeys={[selectedGov]}
                  onChange={(e) => handleGovChange(e.target.value)}
                  size="sm"
                  variant="bordered"
                  classNames={{
                    trigger: 'border-[#262626] bg-[#111111] hover:border-neutral-600',
                    popoverContent: 'bg-[#0a0a0a] border border-[#262626]',
                    label: 'text-neutral-400 font-medium text-xs',
                  }}
                >
                  {EGYPTIAN_GOVERNORATES.map((g) => (
                    <SelectItem key={g.id} textValue={locale === 'ar' ? g.nameAr : g.nameEn} className="text-white hover:bg-[#1f1f1f]">
                      {locale === 'ar' ? g.nameAr : g.nameEn}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label={locale === 'ar' ? 'اسم الورشة أو مركز الخدمة' : 'Workshop Name (Optional)'}
                  size="sm"
                  variant="bordered"
                  placeholder={locale === 'ar' ? 'مثال: ورشة الأمل للميكانيكا' : 'e.g. Al-Amal Auto Care'}
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                  classNames={{
                    inputWrapper: 'border-[#262626] bg-[#111111] hover:border-neutral-600',
                    label: 'text-neutral-400 font-medium text-xs',
                    input: 'text-xs text-white',
                  }}
                />
              </div>

              <Textarea
                label={locale === 'ar' ? 'العنوان بالتفصيل مع أقرب علامة مميزة' : 'Detailed Address & Landmark'}
                isRequired
                rows={2}
                size="sm"
                variant="bordered"
                placeholder={
                  locale === 'ar'
                    ? 'مثال: شارع التحرير، عمارة 18 الدور الأرضي، بجوار صيدلية العزبي'
                    : 'e.g. 18 Tahrir St, Ground floor, next to El-Ezaby Pharmacy'
                }
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                classNames={{
                  inputWrapper: 'border-[#262626] bg-[#111111] hover:border-neutral-600',
                  label: 'text-neutral-400 font-medium text-xs',
                  input: 'text-xs text-white',
                }}
              />

              {/* GPS Coordinates Simulation Pin */}
              <div className="p-3.5 rounded-xl bg-[#111111] border border-[#262626] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    {locale === 'ar' ? 'إحداثيات موقع التسليم (GPS):' : 'Delivery GPS Coordinates:'}
                  </span>
                  <span className="font-mono text-neutral-400 text-[11px]">
                    {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap text-[11px]">
                  <span className="text-neutral-500 self-center">
                    {locale === 'ar' ? 'تحديد سريع:' : 'Quick Select:'}
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
                      className="px-2.5 py-1 rounded-lg border border-[#262626] bg-[#0a0a0a] hover:border-neutral-500 text-neutral-300 font-medium transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Payment Method Selection */}
          <Card className="p-6 rounded-2xl border border-[#262626] bg-[#0a0a0a] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#262626] pb-3">
              <span className="w-6 h-6 rounded-full bg-white text-black text-xs font-black flex items-center justify-center font-mono">
                3
              </span>
              <span>{locale === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</span>
            </h2>

            <RadioGroup
              value={paymentType}
              onValueChange={(val) => setPaymentType(val as PaymentType)}
              classNames={{ wrapper: 'gap-3' }}
            >
              {/* Option 1: Cash on Delivery */}
              <Radio
                value="cod"
                classNames={{
                  base: `flex m-0 bg-[#111111] hover:bg-[#161616] items-center justify-between cursor-pointer rounded-xl gap-4 p-4 border border-[#262626] data-[selected=true]:border-white max-w-full`,
                  label: 'w-full',
                }}
              >
                <div className="w-full flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs text-white">
                        {locale === 'ar' ? 'الدفع نقداً عند الاستلام (COD)' : 'Cash on Delivery (COD)'}
                      </span>
                      <Chip size="sm" variant="flat" color="success" className="text-[10px] h-5">
                        {locale === 'ar' ? 'الأكثر شيوعاً' : 'Popular'}
                      </Chip>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {locale === 'ar'
                        ? 'ادفع نقداً لمندوب الشحن بعد معاينة وتفقد القطع في يدك.'
                        : 'Pay cash to the courier upon delivery and parts inspection.'}
                    </p>
                  </div>
                </div>
              </Radio>

              {/* Option 2: Credit / Debit Card */}
              <Radio
                value="card"
                classNames={{
                  base: `flex m-0 bg-[#111111] hover:bg-[#161616] items-center justify-between cursor-pointer rounded-xl gap-4 p-4 border border-[#262626] data-[selected=true]:border-white max-w-full`,
                  label: 'w-full',
                }}
              >
                <div className="w-full flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-white" />
                      <span className="font-bold text-xs text-white">
                        {locale === 'ar' ? 'بطاقة بنكية (فيزا / ماستركارد / ميزة)' : 'Credit / Debit Card (Visa, MC, Meeza)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {locale === 'ar'
                        ? 'دفع إلكتروني آمن 100% مشفر بالكامل عبر البنك المركزي المصري.'
                        : 'Secure online payment with 3D Secure verification.'}
                    </p>
                  </div>
                </div>
              </Radio>

              {/* Option 3: Digital Wallet / Instapay */}
              <Radio
                value="wallet"
                classNames={{
                  base: `flex m-0 bg-[#111111] hover:bg-[#161616] items-center justify-between cursor-pointer rounded-xl gap-4 p-4 border border-[#262626] data-[selected=true]:border-white max-w-full`,
                  label: 'w-full',
                }}
              >
                <div className="w-full flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      <span className="font-bold text-xs text-white">
                        {locale === 'ar' ? 'إنستاباي ومحافظ الهاتف (Instapay / Wallets)' : 'Instapay & Mobile Wallets'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {locale === 'ar'
                        ? 'تحويل فوري عبر شبكة المدفوعات اللحظية IPN أو محافظ فودافون كاش.'
                        : 'Instant transfer via IPN or mobile wallets.'}
                    </p>
                  </div>
                </div>
              </Radio>
            </RadioGroup>
          </Card>
        </div>

        {/* Right Summary: Multi-Vendor Packages Breakdown & Place Order (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 rounded-2xl border border-[#262626] bg-[#0a0a0a] shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight">
                {locale === 'ar' ? 'شحنات التجار المنفصلة' : 'Merchant Shipments'}
              </h2>
              <Chip size="sm" variant="flat" className="bg-[#171717] text-white border border-[#262626] font-mono">
                {cart.vendorGroups.length} {locale === 'ar' ? 'شحنات' : 'packages'}
              </Chip>
            </div>

            {/* Explanatory Multi-Vendor Alert */}
            <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] text-xs text-neutral-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {locale === 'ar'
                  ? `أنت تشتري من ${cart.vendorGroups.length} تجار معتمدين. يتم شحن كل طرد مباشرة من مستودع التاجر لتسريع وصول القطع.`
                  : `You are purchasing from ${cart.vendorGroups.length} verified vendors. Each package ships directly from the merchant warehouse.`}
              </p>
            </div>

            {/* Vendor Groups Preview */}
            <div className="space-y-3">
              {cart.vendorGroups.map((group) => (
                <div
                  key={group.merchantId}
                  className="p-3.5 rounded-xl border border-[#262626] bg-[#111111] text-xs space-y-2"
                >
                  <div className="flex items-center justify-between font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-neutral-400" />
                      {group.merchantName}
                    </span>
                    <span className="font-mono text-white">
                      {formatMoney(group.subtotal + group.estimatedDeliveryFee, locale)}
                    </span>
                  </div>

                  <div className="divide-y divide-[#262626] text-[11px] text-neutral-400">
                    {group.items.map((it) => (
                      <div key={it.id} className="py-1 flex justify-between">
                        <span className="truncate max-w-[200px]">
                          {it.quantity}× {it.product.name}
                        </span>
                        <span className="font-mono text-neutral-300">{formatMoney(it.totalPrice, locale)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-[#262626]">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {group.estimatedDeliveryEta}
                    </span>
                    <span className="font-mono">
                      {locale === 'ar' ? 'توصيل:' : 'Delivery:'}{' '}
                      <strong className="text-white">{formatMoney(group.estimatedDeliveryFee, locale)}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs border-t border-[#262626] pt-4 text-neutral-400 font-mono">
              <div className="flex justify-between">
                <span>{t.cart.subtotal}</span>
                <span className="font-bold text-white">
                  {formatMoney(cart.subtotal, locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t.cart.deliveryFee}</span>
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
                  <span>{locale === 'ar' ? 'خصم الكوبون' : 'Coupon Discount'}</span>
                  <span>-{formatMoney(cart.discountAmount, locale)}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="flex items-baseline justify-between border-t border-[#262626] pt-4">
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

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Order Button */}
            <Button
              type="submit"
              isLoading={loading}
              className="w-full bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors py-6 shadow-sm"
              startContent={!loading && <Lock className="w-4 h-4" />}
            >
              {loading
                ? locale === 'ar'
                  ? 'جاري تأكيد وتجهيز الطلب...'
                  : 'Processing Order...'
                : locale === 'ar'
                ? 'تأكيد الطلب الآن'
                : 'Confirm & Place Order'}
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
};
