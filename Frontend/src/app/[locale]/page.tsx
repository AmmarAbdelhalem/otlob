import React from 'react';
import { Locale } from '@/lib/api/types';
import { siteConfig } from '@/config/site.config';
import { homeSectionRegistry } from '@/components/home/registry';
import { QuickViewModal } from '@/components/product/QuickViewModal';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;

  // Filter and sort enabled sections from siteConfig
  const activeSections = siteConfig.home.sections
    .filter((sec) => sec.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="py-6 space-y-12">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        {activeSections.map((section) => {
          const Component = homeSectionRegistry[section.type];
          if (!Component) return null;

          return (
            <div key={section.id}>
              <Component locale={locale} props={section.props} />
            </div>
          );
        })}
      </div>

      <QuickViewModal locale={locale} />
    </div>
  );
}
