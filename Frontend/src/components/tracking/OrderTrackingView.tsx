'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  ShieldCheck,
  Search,
  AlertCircle,
  PackageCheck,
  Navigation,
  RefreshCw,
  FileText,
  ChevronRight,
  ExternalLink,
  Store,
} from 'lucide-react';
import { Locale, TrackingInfo } from '@/lib/api/types';
import { services } from '@/lib/api';
import { formatMoney, getMessages } from '@/lib/i18n';

interface OrderTrackingViewProps {
  locale: Locale;
  initialCode?: string;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  locale,
  initialCode,
}) => {
  const t = getMessages(locale);
  const searchParams = useSearchParams();

  const codeParam = searchParams.get('code') || initialCode || 'ORD-EG849201';
  const [orderCodeInput, setOrderCodeInput] = useState(codeParam);
  const [activeCode, setActiveCode] = useState(codeParam);
  const [trackingData, setTrackingData] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [courierPositionDelta, setCourierPositionDelta] = useState(0);

  // Fetch tracking data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    services.order
      .trackOrder(activeCode)
      .then((data) => {
        if (isMounted) {
          setTrackingData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCode]);

  // Live courier movement simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCourierPositionDelta((prev) => (prev + 1) % 100);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderCodeInput.trim()) {
      setActiveCode(orderCodeInput.trim());
    }
  };

  const steps = [
    {
      id: 'placed',
      titleAr: 'تم استلام وتأكيد الطلب',
      titleEn: 'Order Placed & Confirmed',
      descAr: 'تم تسجيل الطلب وتوجيهه لمخازن التجار المعتمدين',
      descEn: 'Order routed to merchant warehouse',
      done: true,
    },
    {
      id: 'processing',
      titleAr: 'جاري التجهيز والتغليف',
      titleEn: 'Parts Prepared & Packed',
      descAr: 'فحص جودة القطع ومطابقة أرقام الـ OEM',
      descEn: 'Quality inspection & OEM verification',
      done: true,
    },
    {
      id: 'in_transit',
      titleAr: 'المندوب في الطريق إليك',
      titleEn: 'In Transit with Courier',
      descAr: 'الكابتن استلم الشحنة ومتجه لعنوانك أو ورشتك',
      descEn: 'Courier is en route to your location',
      done: trackingData?.status === 'in_transit' || trackingData?.status === 'delivered',
      active: trackingData?.status === 'in_transit',
    },
    {
      id: 'delivered',
      titleAr: 'تم التسليم بنجاح',
      titleEn: 'Delivered Successfully',
      descAr: 'تم التحقق من كود الاستلام واستلام القطع',
      descEn: 'Parts delivered and OTP verified',
      done: trackingData?.status === 'delivered',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <nav className="flex items-center gap-2 text-xs text-text-muted">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">
            {locale === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-text-main font-medium">{t.tracking.title}</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-black text-text-main">
          {locale === 'ar' ? 'تتبع مسار الشحنة والمندوب اللحظي' : 'Live Order & Courier Tracking'}
        </h1>
      </div>

      {/* Order Search Box */}
      <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-color">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={locale === 'ar' ? 'أدخل رقم الطلب (مثال: ORD-EG849201)...' : 'Enter order code (e.g. ORD-EG849201)...'}
              value={orderCodeInput}
              onChange={(e) => setOrderCodeInput(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-border-color bg-bg-primary text-xs font-mono uppercase focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>{locale === 'ar' ? 'تتبع الآن' : 'Track'}</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-16 text-center text-text-muted text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span>{locale === 'ar' ? 'جاري الاتصال بنظام التتبع المباشر...' : 'Connecting to live tracking system...'}</span>
        </div>
      ) : trackingData ? (
        <div className="space-y-6">
          {/* OTP Verification Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-primary/10 to-emerald-500/15 border-2 border-primary/30 flex items-center justify-between flex-wrap gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t.tracking.deliveryOtp}
              </span>
              <p className="text-xs text-text-muted max-w-lg">
                {t.tracking.otpInstruction}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-bg-primary px-5 py-2.5 rounded-xl border-2 border-primary shadow-md">
              <span className="text-2xl font-black font-mono tracking-widest text-primary">
                482910
              </span>
            </div>
          </div>

          {/* Stepper Progress Timeline */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-primary shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div>
                <span className="text-text-muted">{t.tracking.orderCode}</span>{' '}
                <strong className="font-mono text-text-main text-sm">{trackingData.orderCode}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-600">{trackingData.statusLabel}</span>
              </div>
            </div>

            {/* Steps Visual Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              {steps.map((st, idx) => (
                <div key={st.id} className="relative space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        st.done
                          ? 'bg-emerald-600 text-white'
                          : st.active
                          ? 'bg-primary text-white ring-4 ring-primary/20 animate-pulse'
                          : 'bg-bg-secondary text-text-muted border border-border-color'
                      }`}
                    >
                      {st.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className="font-bold text-xs text-text-main">
                      {locale === 'ar' ? st.titleAr : st.titleEn}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-tight ps-10 sm:ps-0">
                    {locale === 'ar' ? st.descAr : st.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Courier Tracking Map Card */}
          {trackingData.courier && (
            <div className="p-6 rounded-2xl border border-border-color bg-bg-primary shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg border border-primary/20">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text-main">
                      {trackingData.courier.name}
                    </h3>
                    <p className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                      <span>{locale === 'ar' ? 'كابتن توصيل اطلب السريع' : 'Otlob Express Courier'}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {locale === 'ar' ? 'متصل الآن' : 'Live Online'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${trackingData.courier.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t.tracking.callRep}</span>
                  </a>
                </div>
              </div>

              {/* Simulated GPS Live Interactive Route Graphic */}
              <div className="relative aspect-[21/9] sm:aspect-[24/9] rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 p-6 overflow-hidden flex flex-col justify-between text-white shadow-inner">
                {/* Background Map Grid & Roads Effect */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Top Info HUD */}
                <div className="relative z-10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 font-mono">
                    <Navigation className="w-3.5 h-3.5 text-primary animate-spin" />
                    <span>
                      GPS:{' '}
                      {trackingData.courier.livePosition
                        ? `${trackingData.courier.livePosition.latitude.toFixed(4)}, ${trackingData.courier.livePosition.longitude.toFixed(4)}`
                        : '30.0521, 31.2389'}
                    </span>
                  </div>

                  <div className="bg-emerald-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg font-bold text-white shadow">
                    {locale === 'ar' ? 'الوقت التقديري للوصول: 22 دقيقة' : 'ETA: 22 Minutes'}
                  </div>
                </div>

                {/* Animated Route Line & Moving Courier */}
                <div className="relative z-10 my-auto py-6">
                  {/* Road Base */}
                  <div className="w-full h-2.5 rounded-full bg-white/20 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-amber-400 to-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${65 + (courierPositionDelta % 15)}%` }}
                    />
                  </div>

                  {/* Waypoints */}
                  <div className="flex justify-between items-center text-xs mt-3">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <Store className="w-4 h-4 text-primary" />
                      <span>{t.tracking.pickup} (شبرا)</span>
                    </div>

                    {/* Animated Moving Motorcycle Avatar */}
                    <div className="text-center font-bold text-amber-400 text-[11px] animate-bounce">
                      🛵 {locale === 'ar' ? 'المندوب في الطريق' : 'Courier Moving'}
                    </div>

                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>{t.tracking.dropoff} (الدقي)</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer HUD */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{locale === 'ar' ? 'تحديث تلقائي كل 10 ثواني' : 'Live updates every 10 seconds'}</span>
                  <span>{locale === 'ar' ? 'السرعة التقديرية: 35 كم/س' : 'Est. Speed: 35 km/h'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Orders Breakdown */}
          <div className="p-6 rounded-2xl border border-border-color bg-bg-primary shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-text-main">
              {locale === 'ar' ? 'محتويات الطرد والشحنة' : 'Order Contents & Package Details'}
            </h3>

            <div className="divide-y divide-border-color text-xs">
              <div className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold text-text-main">
                    طقم تيل فرامل سيراميك أمامي - تويوتا كورولا (2014 - 2022)
                  </p>
                  <p className="text-[11px] text-text-muted font-mono">
                    SKU: BP-TY-COR-01 | OEM: 04465-02220 | الكمية: 1
                  </p>
                </div>
                <span className="font-bold text-text-main font-mono">950 ج.م</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold text-text-main">
                    فلتر زيت محرك أصلي - هيونداي وكيا
                  </p>
                  <p className="text-[11px] text-text-muted font-mono">
                    SKU: OF-HY-EL-02 | OEM: 26300-35505 | الكمية: 1
                  </p>
                </div>
                <span className="font-bold text-text-main font-mono">320 ج.م</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-bg-secondary/30 flex items-center justify-between text-xs pt-3">
              <span className="text-text-muted">{locale === 'ar' ? 'طريقة السداد:' : 'Payment:'}</span>
              <span className="font-bold text-text-main">
                {locale === 'ar' ? 'الدفع نقداً عند الاستلام (1330 ج.م شامل الشحن)' : 'Cash on Delivery (1,330 EGP)'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-border-color bg-bg-secondary/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-bold text-sm text-text-main">
            {locale === 'ar' ? 'لم يتم العثور على شحنة بهذا الرقم' : 'No order found with this code'}
          </h3>
          <p className="text-xs text-text-muted">
            {locale === 'ar'
              ? 'يرجى التأكد من كتابة كود الطلب بشكل سليم (مثال: ORD-EG849201).'
              : 'Please check your order code (e.g. ORD-EG849201).'}
          </p>
        </div>
      )}
    </div>
  );
};
