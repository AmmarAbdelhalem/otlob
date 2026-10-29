'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Tag, Sparkles, Ticket, Percent, Search, RefreshCw, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { OfferCard, OfferData } from '@/components/offers/OfferCard';

export default function OffersPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';

  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'coupons_only' | 'percentage' | 'fixed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/offers');
      if (res.ok) {
        const json = await res.json();
        setOffers(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load offers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleApplyCoupon = (code: string) => {
    setToastMessage(isAr ? `تم نسخ الكود ${code} بنجاح! يمكنك استخدامه عند الدفع.` : `Code ${code} copied! Apply at checkout.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredOffers = offers.filter((offer) => {
    // Tab filter
    if (activeTab === 'coupons_only' && !offer.is_coupon_only) return false;
    if (activeTab === 'percentage' && offer.discount_type !== 'percentage') return false;
    if (activeTab === 'fixed' && offer.discount_type !== 'fixed') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = offer.title.toLowerCase().includes(q);
      const matchCode = offer.code.toLowerCase().includes(q);
      const matchDesc = offer.description?.toLowerCase().includes(q);
      return matchTitle || matchCode || matchDesc;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-bottom-4">
          <Ticket className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-dark to-slate-900 text-white py-12 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isAr ? 'عروض وتخفيضات أطلب الحصرية' : 'Exclusive Otlob Offers & Deals'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {isAr ? 'وفر أكثر مع أقوى كوبونات وعروض قطع الغيار' : 'Save More with Verified Auto Parts Coupons'}
          </h1>
          <p className="text-white/80 max-w-2xl text-sm sm:text-base leading-relaxed">
            {isAr
              ? 'تخفيضات حقيقية وأكواد خصم معتمدة من كبار موردي قطع الغيار في مصر. انسخ الكوبون واستمتع بخصم فوري عند إتمام الطلب.'
              : 'Real instant discounts and verified promo codes from certified auto parts suppliers across Egypt. Copy your code and save now.'}
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Controls Bar: Tabs & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-surface-border shadow-xs">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-raised text-text-muted hover:text-text hover:bg-surface-border'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>{isAr ? 'جميع العروض' : 'All Deals'}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-white/20">
                {offers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('coupons_only')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'coupons_only'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-raised text-text-muted hover:text-text hover:bg-surface-border'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>{isAr ? 'عروض الكوبونات فقط' : 'Coupons Only'}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black">
                {offers.filter((o) => o.is_coupon_only).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('percentage')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'percentage'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-raised text-text-muted hover:text-text hover:bg-surface-border'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>{isAr ? 'خصم مئوي %' : 'Percentage Off'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('fixed')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'fixed'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-raised text-text-muted hover:text-text hover:bg-surface-border'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'خصم نقدي مباشر' : 'Fixed Discount'}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:min-w-[300px]">
            <Search className="w-4 h-4 text-text-muted absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث باسم العرض أو الكود...' : 'Search by title or coupon code...'}
              className="w-full ps-9 pe-4 py-2 text-xs sm:text-sm rounded-xl bg-surface-raised border border-surface-border text-text placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Content Stream */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-surface-border bg-surface p-5 space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-6 w-24 bg-surface-raised rounded-full" />
                  <div className="h-8 w-8 bg-surface-raised rounded-xl" />
                </div>
                <div className="h-5 w-3/4 bg-surface-raised rounded-md" />
                <div className="h-4 w-full bg-surface-raised rounded-md" />
                <div className="h-12 bg-surface-raised rounded-xl" />
                <div className="h-4 w-1/2 bg-surface-raised rounded-md" />
              </div>
            ))}
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="rounded-2xl border border-surface-border bg-surface p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8 opacity-70" />
            </div>
            <h3 className="text-base font-bold text-text">
              {isAr ? 'لا توجد عروض مطابقة للاختيار الحالي' : 'No offers match your current filter'}
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              {isAr
                ? 'جرّب تغيير تبويب الفرز أو البحث باسم كود آخر، أو تفقد كتالوج قطع الغيار للتخفيضات المباشرة.'
                : 'Try changing your filter tab or search keywords, or explore our parts catalog for instant savings.'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-raised hover:bg-surface-border text-text transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعادة ضبط الفلاتر' : 'Reset filters'}</span>
              </button>
              <Link
                href={`/${locale}/shop`}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover transition-colors flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isAr ? 'تصفح قطع الغيار' : 'Browse Parts'}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                locale={locale}
                onApply={handleApplyCoupon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
