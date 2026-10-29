import React from 'react';
import { Locale } from '@/lib/api/types';
import { CartView } from '@/components/cart/CartView';

interface CartPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CartView locale={locale} />
      </div>
    </div>
  );
}
