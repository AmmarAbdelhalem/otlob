'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Chip,
  Progress,
  Divider,
} from '@heroui/react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  ShieldCheck,
  Search,
  AlertCircle,
  Navigation,
  RefreshCw,
  ChevronRight,
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
        <nav className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
          <Link href={`/${locale}`} className="hover:text-white transition-colors">
            {locale === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-white font-medium">{t.tracking.title}</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {locale === 'ar' ? 'تتبع مسار الشحنة والمندوب اللحظي' : 'Live Order & Courier Tracking'}
        </h1>
      </div>

      {/* Order Search Box */}
      <Card className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#262626] shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            size="sm"
            variant="bordered"
            placeholder={locale === 'ar' ? 'أدخل رقم الطلب (مثال: ORD-EG849201)...' : 'Enter order code (e.g. ORD-EG849201)...'}
            value={orderCodeInput}
            onChange={(e) => setOrderCodeInput(e.target.value)}
            startContent={<Search className="w-4 h-4 text-neutral-400" />}
            classNames={{
              inputWrapper: 'border-[#262626] bg-[#111111] hover:border-neutral-600',
              input: 'text-xs uppercase font-mono tracking-wider',
            }}
          />
          <Button
            type="submit"
            className="bg-white text-black font-bold text-xs hover:bg-neutral-200 px-6 shadow-sm"
          >
            {locale === 'ar' ? 'تتبع الآن' : 'Track'}
          </Button>
        </form>
      </Card>

      {loading ? (
        <div className="py-20 text-center text-neutral-400 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-white" />
          <span className="font-mono">{locale === 'ar' ? 'جاري الاتصال بنظام التتبع المباشر...' : 'Connecting to live tracking system...'}</span>
        </div>
      ) : trackingData ? (
        <div className="space-y-6">
          {/* OTP Verification Banner */}
          <Card className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#262626] flex flex-row items-center justify-between flex-wrap gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {t.tracking.deliveryOtp}
              </span>
              <p className="text-xs text-neutral-400 max-w-lg">
                {t.tracking.otpInstruction}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#111111] px-5 py-2.5 rounded-xl border border-[#262626] shadow-md">
              <span className="text-2xl font-black font-mono tracking-widest text-white">
                482910
              </span>
            </div>
          </Card>

          {/* Stepper Progress Timeline */}
          <Card className="p-6 rounded-2xl border border-[#262626] bg-[#0a0a0a] shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div>
                <span className="text-neutral-400 font-mono">{t.tracking.orderCode}</span>{' '}
                <strong className="font-mono text-white text-sm">{trackingData.orderCode}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-emerald-400 font-mono">{trackingData.statusLabel}</span>
              </div>
            </div>

            {/* Steps Visual Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              {steps.map((st, idx) => (
                <div key={st.id} className="relative space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono ${
                        st.done
                          ? 'bg-white text-black'
                          : st.active
                          ? 'bg-neutral-800 text-white ring-2 ring-white animate-pulse'
                          : 'bg-[#111111] text-neutral-500 border border-[#262626]'
                      }`}
                    >
                      {st.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className="font-bold text-xs text-white">
                      {locale === 'ar' ? st.titleAr : st.titleEn}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-tight ps-10 sm:ps-0">
                    {locale === 'ar' ? st.descAr : st.descEn}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Live Courier Tracking Map Card */}
          {trackingData.courier && (
            <Card className="p-6 rounded-2xl border border-[#262626] bg-[#0a0a0a] shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#111111] text-white flex items-center justify-center font-black text-lg border border-[#262626]">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {trackingData.courier.name}
                    </h3>
                    <p className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>{locale === 'ar' ? 'كابتن توصيل اطلب السريع' : 'Otlob Express Courier'}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {locale === 'ar' ? 'متصل الآن' : 'Live Online'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    as="a"
                    href={`tel:${trackingData.courier.phone}`}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                    startContent={<Phone className="w-3.5 h-3.5" />}
                  >
                    <span>{t.tracking.callRep}</span>
                  </Button>
                </div>
              </div>

              {/* Simulated GPS Live Interactive Route Graphic */}
              <div className="relative aspect-[21/9] sm:aspect-[24/9] rounded-2xl bg-black border border-[#262626] p-6 overflow-hidden flex flex-col justify-between text-white shadow-inner">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Top Info HUD */}
                <div className="relative z-10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 bg-[#111111]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#262626] font-mono">
                    <Navigation className="w-3.5 h-3.5 text-white animate-spin" />
                    <span>
                      GPS:{' '}
                      {trackingData.courier.livePosition
                        ? `${trackingData.courier.livePosition.latitude.toFixed(4)}, ${trackingData.courier.livePosition.longitude.toFixed(4)}`
                        : '30.0521, 31.2389'}
                    </span>
                  </div>

                  <div className="bg-white text-black px-3 py-1.5 rounded-lg font-bold text-xs font-mono shadow">
                    {locale === 'ar' ? 'الوقت التقديري للوصول: 22 دقيقة' : 'ETA: 22 Minutes'}
                  </div>
                </div>

                {/* Animated Route Line & Moving Courier */}
                <div className="relative z-10 my-auto py-6">
                  <div className="w-full h-2 rounded-full bg-[#1f1f1f] relative overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${65 + (courierPositionDelta % 15)}%` }}
                    />
                  </div>

                  {/* Waypoints */}
                  <div className="flex justify-between items-center text-xs mt-3">
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <Store className="w-4 h-4 text-neutral-300" />
                      <span>{t.tracking.pickup}</span>
                    </div>

                    <div className="text-center font-bold text-neutral-200 text-[11px] font-mono">
                      🛵 {locale === 'ar' ? 'المندوب في الطريق' : 'Courier Moving'}
                    </div>

                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>{t.tracking.dropoff}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer HUD */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span>{locale === 'ar' ? 'تحديث تلقائي كل 10 ثواني' : 'Live updates every 10 seconds'}</span>
                  <span>{locale === 'ar' ? 'السرعة: 35 كم/س' : 'Speed: 35 km/h'}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Sub-Orders Breakdown */}
          <Card className="p-6 rounded-2xl border border-[#262626] bg-[#0a0a0a] shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-white">
              {locale === 'ar' ? 'محتويات الطرد والشحنة' : 'Order Contents & Package Details'}
            </h3>

            <div className="divide-y divide-[#262626] text-xs">
              <div className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold text-white">
                    {locale === 'ar' ? 'طقم تيل فرامل سيراميك أمامي - تويوتا كورولا' : 'Front Ceramic Brake Pads Kit - Toyota Corolla'}
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    SKU: BP-TY-COR-01 | OEM: 04465-02220 | {locale === 'ar' ? 'الكمية: 1' : 'Qty: 1'}
                  </p>
                </div>
                <span className="font-bold text-white font-mono">{formatMoney(950, locale)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#262626] flex items-center justify-between text-xs pt-3 font-mono">
              <span className="text-neutral-400">{locale === 'ar' ? 'طريقة السداد:' : 'Payment:'}</span>
              <span className="font-bold text-white">
                {locale === 'ar' ? 'الدفع نقداً عند الاستلام' : 'Cash on Delivery'}
              </span>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-8 rounded-2xl border border-[#262626] bg-[#0a0a0a] text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="font-bold text-sm text-white">
            {locale === 'ar' ? 'لم يتم العثور على شحنة بهذا الرقم' : 'No order found with this code'}
          </h3>
          <p className="text-xs text-neutral-400">
            {locale === 'ar'
              ? 'يرجى التأكد من كتابة كود الطلب بشكل سليم (مثال: ORD-EG849201).'
              : 'Please check your order code (e.g. ORD-EG849201).'}
          </p>
        </Card>
      )}
    </div>
  );
};
