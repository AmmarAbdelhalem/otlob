'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Chip, Skeleton } from '@heroui/react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Locale } from '@/lib/api/types';

interface HeroSliderProps {
  locale: Locale;
  slides?: any[];
}

export const HeroSliderSection: React.FC<HeroSliderProps> = ({ locale, slides }) => {
  const isAr = locale === 'ar';
  const [cmsSlides, setCmsSlides] = useState<any[]>(slides || []);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(!slides || slides.length === 0);

  // Fetch real banners exclusively from backend Filament CMS (/api/cms/banners)
  useEffect(() => {
    async function fetchBanners() {
      try {
        setLoading(true);
        const res = await fetch('/api/cms/banners');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((b: any) => ({
            id: b.id,
            eyebrow: { ar: b.badge_text || 'عرض حصري', en: b.badge_text || 'Exclusive Deal' },
            headline: { ar: b.title_ar, en: b.title_en || b.title_ar },
            shortText: { ar: b.subtitle_ar || '', en: b.subtitle_en || b.subtitle_ar || '' },
            ctaText: { ar: b.cta_text_ar || 'تسوق الآن', en: b.cta_text_en || 'Shop Now' },
            ctaLink: b.cta_url || '/shop',
            image: b.image
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${b.image}`
              : null,
          }));
          setCmsSlides(mapped);
        } else {
          setCmsSlides([]);
        }
      } catch {
        setCmsSlides([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  // Auto rotate slides if multiple
  useEffect(() => {
    if (cmsSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % cmsSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [cmsSlides.length]);

  if (loading) {
    return (
      <div className="w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 p-8 h-[360px] flex items-center">
        <div className="space-y-4 max-w-lg w-full">
          <Skeleton className="h-6 w-32 rounded-lg bg-neutral-800" />
          <Skeleton className="h-10 w-full rounded-lg bg-neutral-800" />
          <Skeleton className="h-4 w-3/4 rounded-lg bg-neutral-800" />
          <Skeleton className="h-10 w-40 rounded-xl bg-neutral-800" />
        </div>
      </div>
    );
  }

  // If no banners are published in Filament CMS, render a sleek default platform banner
  if (cmsSlides.length === 0) {
    return (
      <section className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 text-white min-h-[300px] flex items-center p-8 sm:p-12">
        <div className="space-y-4 max-w-xl z-10">
          <Chip
            startContent={<Sparkles className="w-3.5 h-3.5" />}
            size="sm"
            variant="flat"
            className="bg-neutral-900 text-neutral-300 font-bold"
          >
            {isAr ? 'منصة أطلب لقطع الغيار' : 'Otlob Auto Parts'}
          </Chip>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
            {isAr
              ? 'قطع غيار سيارات أصلية مع ضمان التوافق التام'
              : 'Genuine Auto Parts with Guaranteed Fitment'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            {isAr
              ? 'تصفح آلاف القطع من التجار المعتمدين مع توصيل سريع بالـ GPS ودفع عند الاستلام.'
              : 'Browse certified merchants with express GPS delivery and Cash on Delivery.'}
          </p>
          <Button
            as={Link}
            href={`/${locale}/shop`}
            className="bg-white text-black font-bold text-xs hover:bg-neutral-200 mt-2"
            endContent={<ArrowRight className="w-3.5 h-3.5 rtl-mirror" />}
          >
            {isAr ? 'تصفح الكتالوج' : 'Browse Catalog'}
          </Button>
        </div>
      </section>
    );
  }

  const slide = cmsSlides[currentIdx] || cmsSlides[0];

  return (
    <section className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 text-white min-h-[360px] md:min-h-[420px] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-radial from-neutral-900/50 to-neutral-950/95" />
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Content */}
        <div className="lg:col-span-7 space-y-4 md:space-y-6">
          <Chip
            startContent={<Sparkles className="w-3.5 h-3.5" />}
            size="sm"
            variant="flat"
            className="bg-neutral-900 text-neutral-300 font-bold text-xs"
          >
            {slide.eyebrow?.[locale] || slide.eyebrow?.ar || 'عروض حصرية'}
          </Chip>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            {slide.headline?.[locale] || slide.headline?.ar}
          </h1>

          {slide.shortText?.[locale] && (
            <p className="text-neutral-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
              {slide.shortText[locale]}
            </p>
          )}

          <div className="pt-2">
            <Button
              as={Link}
              href={slide.ctaLink}
              size="lg"
              className="bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-all shadow-md"
              endContent={<ArrowRight className="w-4 h-4 rtl-mirror" />}
            >
              {slide.ctaText?.[locale] || (isAr ? 'تسوق الآن' : 'Shop Now')}
            </Button>
          </div>
        </div>

        {/* Media */}
        <div className="lg:col-span-5 flex items-center justify-center">
          {slide.image ? (
            <div className="relative w-full max-w-xs sm:max-w-sm aspect-square flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.headline?.[locale] || 'Banner'}
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Slide Navigation Dots */}
      {cmsSlides.length > 1 && (
        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-20">
          {cmsSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIdx ? 'w-6 bg-white' : 'w-2 bg-neutral-700 hover:bg-neutral-500'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
