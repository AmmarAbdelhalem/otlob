import React from 'react';
import { Locale } from '@/lib/api/types';
import { WishlistView } from '@/components/wishlist/WishlistView';

interface WishlistPageProps {
  params: Promise<{ locale: string }>;
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WishlistView locale={locale} />
      </div>
    </div>
  );
}
