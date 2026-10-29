import React from 'react';
import { Locale } from '@/lib/api/types';
import { AccountLayout } from '@/components/account/AccountLayout';
import { GarageManagerView } from '@/components/account/GarageManagerView';

interface GaragePageProps {
  params: Promise<{ locale: string }>;
}

export default async function GaragePage({ params }: GaragePageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AccountLayout locale={locale}>
          <GarageManagerView locale={locale} />
        </AccountLayout>
      </div>
    </div>
  );
}
