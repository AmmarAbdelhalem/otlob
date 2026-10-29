'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { Button, Chip } from '@heroui/react';

interface PromoBannersProps {
  locale: Locale;
}

export const PromoBannersSection: React.FC<PromoBannersProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [banners, setBanners] = useState<any[]>([]);

  // Fetch real promo banners from Filament CMS (/api/cms/banners)
  useEffect(() => {
    async function loadPromoBanners() {
      try {
        const res = await fetch('/api/cms/banners');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            // Filter banners designated for promo strip
            const promos = json.data.filter((b: any) => b.position === 'promo_strip' || b.position === 'middle_banner');
            setBanners(promos);
          }
        }
      } catch {
        setBanners([]);
      }
    }
    loadPromoBanners();
  }, []);

  if (banners.length === 0) {
    // Zero hardcoded banners — return null if none published in Filament CMS
    return null;
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {banners.slice(0, 2).map((banner) => {
        const title = isAr ? banner.title_ar : (banner.title_en || banner.title_ar);
        const subtitle = isAr ? banner.subtitle_ar : (banner.subtitle_en || banner.subtitle_ar);
        const ctaText = isAr ? (banner.cta_text_ar || 'تسوق الآن') : (banner.cta_text_en || 'Shop Now');
        const ctaUrl = banner.cta_url || '/shop';
        const imageUrl = banner.image
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${banner.image}`
          : null;

        return (
          <div
            key={banner.id}
            className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 p-6 sm:p-8 text-white flex flex-col justify-between group"
          >
            <div className="space-y-3 z-10 max-w-sm">
              {banner.badge_text && (
                <Chip size="sm" variant="flat" className="bg-neutral-900 text-neutral-300 font-bold text-[10px] uppercase">
                  {banner.badge_text}
                </Chip>
              )}
              <h4 className="text-xl sm:text-2xl font-black leading-tight text-white">
                {title}
              </h4>
              {subtitle && (
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="pt-6 z-10">
              <Button
                as={Link}
                href={ctaUrl}
                size="sm"
                className="bg-white text-black font-bold text-xs hover:bg-neutral-200"
                endContent={<ArrowRight className="w-3.5 h-3.5 rtl-mirror" />}
              >
                {ctaText}
              </Button>
            </div>

            {imageUrl && (
              <div className="absolute end-4 bottom-4 w-32 h-32 opacity-20 group-hover:opacity-30 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};
