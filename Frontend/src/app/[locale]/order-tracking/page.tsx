import React from 'react';
import { Locale } from '@/lib/api/types';
import { OrderTrackingView } from '@/components/tracking/OrderTrackingView';

interface OrderTrackingPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderTrackingPage({ params, searchParams }: OrderTrackingPageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;
  const resolvedSearchParams = await searchParams;

  const rawCode = resolvedSearchParams['code'];
  const initialCode = Array.isArray(rawCode) ? rawCode[0] : rawCode;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrderTrackingView locale={locale} initialCode={initialCode} />
      </div>
    </div>
  );
}
