import React from 'react';
import type { Metadata } from 'next';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { MegaMenu } from '@/components/layout/MegaMenu';
import { Footer } from '@/components/layout/Footer';
import { MiniCartDrawer } from '@/components/layout/MiniCartDrawer';
import { MobileNav } from '@/components/layout/MobileNav';
import { ThemeCustomizerDrawer } from '@/components/theme/ThemeCustomizerDrawer';
import { Locale } from '@/lib/api/types';
import { siteConfig } from '@/config/site.config';
import { getDirection } from '@/lib/i18n';
import '@/styles/tokens.css';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: {
    default: siteConfig.seo.defaultTitle.ar,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.defaultDescription.ar,
  icons: {
    icon: '/favicon.ico',
  },
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

import { headers } from 'next/headers';
import { HeroProvider } from '@/components/theme/HeroProvider';

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;
  const dir = getDirection(locale);

  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';

  const isDashboardRoute =
    pathname.includes('/vendor') ||
    pathname.includes('/courier');

  if (isDashboardRoute) {
    return (
      <html lang={locale} dir={dir} data-theme="dark" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen bg-black text-text selection:bg-white selection:text-black">
          <HeroProvider>
            <main className="min-h-screen">{children}</main>
            <ThemeCustomizerDrawer locale={locale} />
          </HeroProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang={locale} dir={dir} data-theme="dark" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-black text-text selection:bg-white selection:text-black">
        <HeroProvider>
          <TopBar locale={locale} />
          <Header locale={locale} />
          <MegaMenu locale={locale} />

          <main className="flex-1 pb-16 lg:pb-0">{children}</main>

          <Footer locale={locale} />
          <MiniCartDrawer locale={locale} />
          <MobileNav locale={locale} />
          <ThemeCustomizerDrawer locale={locale} />
        </HeroProvider>
      </body>
    </html>
  );
}
