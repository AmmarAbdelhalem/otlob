'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Chip, Card, CardBody } from '@heroui/react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { formatMoney } from '@/lib/i18n';

interface HeroSliderProps {
  locale: Locale;
  slides?: any[];
}

export const HeroSliderSection: React.FC<HeroSliderProps> = ({ locale, slides }) => {
  const defaultSlides = [
    {
      id: 'slide-1',
      eyebrow: { ar: 'عروض الموسم لقطع غيار السيارات', en: 'Seasonal Auto Parts Deals' },
      headline: { ar: 'تيل فرامل وطنابير أصلية بخصم 25%', en: 'Original Brake Pads & Rotors 25% Off' },
      shortText: {
        ar: 'متوافق مع تويوتا، نيسان، هيونداي وكيا، مع ضمان استرجاع 14 يوم ودفع عند الاستلام.',
        en: 'Guaranteed fitment for Toyota, Nissan, Hyundai, and Kia with 14-day warranty and Cash on Delivery.',
      },
      price: 950,
      originalPrice: 1250,
      ctaText: { ar: 'تسوق عروض الفرامل', en: 'Shop Brakes Deals' },
      ctaLink: '/shop?category=brakes',
      image: '/images/products/brake-pads.svg',
      gradient: 'from-slate-950 via-slate-900 to-red-950',
    },
    {
      id: 'slide-2',
      eyebrow: { ar: 'توصيل فوري خلال 2 - 4 ساعات', en: 'Express Delivery in 2 - 4 Hours' },
      headline: { ar: 'مساعدين وعفشة ياباني وألماني أصلية', en: 'Japanese & German Shocks & Suspension' },
      shortText: {
        ar: 'أقصى ثبات وراحة على جميع الطرق المصرية. اطلب قطعتك وتتبع مندوب التوصيل لحظياً على الخريطة.',
        en: 'Maximum comfort and stability on Egyptian roads. Track your courier live on map.',
      },
      price: 3100,
      originalPrice: 3800,
      ctaText: { ar: 'اكتشف العفشة والمساعدين', en: 'Discover Suspension' },
      ctaLink: '/shop?category=suspension',
      image: '/images/products/shock-absorber.svg',
      gradient: 'from-slate-950 via-slate-900 to-blue-950',
    },
    {
      id: 'slide-3',
      eyebrow: { ar: 'شمعات إشعال ليزر إيريديوم', en: 'Laser Iridium Spark Plugs' },
      headline: { ar: 'وفر استهلاك البنزين وارفع عزم المحرك', en: 'Save Fuel & Boost Engine Performance' },
      shortText: {
        ar: 'بوجيهات NGK و DENSO الأصلية سن إيريديوم ليزر بعمر افتراضي 100,000 كم.',
        en: 'Genuine NGK & DENSO spark plugs with 100,000 km lifespan.',
      },
      price: 1450,
      originalPrice: 1800,
      ctaText: { ar: 'تسوق البوجيهات', en: 'Shop Spark Plugs' },
      ctaLink: '/shop?category=spark-plugs',
      image: '/images/products/spark-plugs.svg',
      gradient: 'from-slate-950 via-slate-900 to-amber-950',
    },
  ];

  const [cmsSlides, setCmsSlides] = useState<any[]>(slides || []);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Fetch CMS banners from backend Filament CMS if available
  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch('/api/cms/banners');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const mapped = json.data.map((b: any) => ({
            id: b.id,
            eyebrow: { ar: b.badge_text || 'عرض حصري', en: b.badge_text || 'Exclusive Deal' },
            headline: { ar: b.title_ar, en: b.title_en || b.title_ar },
            shortText: { ar: b.subtitle_ar || '', en: b.subtitle_en || b.subtitle_ar || '' },
            price: 999,
            originalPrice: 1299,
            ctaText: { ar: b.cta_text_ar || 'تسوق الآن', en: b.cta_text_en || 'Shop Now' },
            ctaLink: b.cta_url || '/shop',
            image: b.image
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${b.image}`
              : '/images/products/brake-pads.svg',
            gradient: 'from-slate-950 via-slate-900 to-primary-950',
          }));
          setCmsSlides(mapped);
        }
      } catch {
        // Fallback to default slides
      }
    }
    fetchBanners();
  }, []);

  const activeSlides = cmsSlides.length > 0 ? cmsSlides : defaultSlides;

  // Auto rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const slide = activeSlides[currentIdx] || defaultSlides[0];

  return (
    <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white min-h-[380px] md:min-h-[440px] flex items-center">
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${slide.gradient || 'from-slate-950 via-slate-900 to-slate-900'} transition-all duration-700`}
      />

      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-4 md:space-y-6">
          <Chip
            startContent={<Sparkles className="w-3.5 h-3.5" />}
            variant="flat"
            color="warning"
            className="font-bold text-xs"
          >
            {slide.eyebrow?.[locale] || slide.eyebrow?.ar || 'عروض حصرية'}
          </Chip>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {slide.headline?.[locale] || slide.headline?.ar}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
            {slide.shortText?.[locale] || slide.shortText?.ar}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              as={Link}
              href={`/${locale}${slide.ctaLink}`}
              color="primary"
              size="lg"
              radius="lg"
              className="font-bold text-sm shadow-xl"
              endContent={<ArrowRight className="w-4 h-4 rtl-mirror group-hover:translate-x-1 transition-transform" />}
            >
              {slide.ctaText?.[locale] || slide.ctaText?.ar || 'تسوق الآن'}
            </Button>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 line-through text-xs">
                {formatMoney(slide.originalPrice, locale)}
              </span>
              <span className="text-warning text-base sm:text-lg font-black">
                {formatMoney(slide.price, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Visual Image */}
        <div className="lg:col-span-5 flex justify-center">
          <Card className="w-full max-w-xs sm:max-w-sm aspect-4/3 bg-slate-900/40 backdrop-blur-md border border-white/10" shadow="lg">
            <CardBody className="p-6 flex flex-col items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image || '/images/products/brake-pads.svg'}
                alt="Auto Part Hero Visual"
                className="w-full h-auto max-h-48 object-contain drop-shadow-2xl transition-all duration-500 scale-100 hover:scale-105"
              />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-4 end-6 flex items-center gap-2 z-20">
        <Button
          isIconOnly
          size="sm"
          radius="full"
          variant="flat"
          onClick={() => setCurrentIdx((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
          className="bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700"
          aria-label="Previous Slide"
        >
          <ChevronRight className="w-4 h-4 rtl-mirror" />
        </Button>
        <Button
          isIconOnly
          size="sm"
          radius="full"
          variant="flat"
          onClick={() => setCurrentIdx((prev) => (prev + 1) % activeSlides.length)}
          className="bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700"
          aria-label="Next Slide"
        >
          <ChevronLeft className="w-4 h-4 rtl-mirror" />
        </Button>
      </div>
    </section>
  );
};
