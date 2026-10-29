import React from 'react';
import Link from 'next/link';
import { Locale, Vendor } from '@/lib/api/types';
import { services } from '@/lib/api';
import { Store, Star, MapPin, Package, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

interface VendorsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function VendorsPage({ params }: VendorsPageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  let vendors: Vendor[] = [];
  try {
    vendors = await services.vendor.getVendors(20);
  } catch {
    vendors = [];
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <Store className="w-4 h-4" />
          <span>{locale === 'ar' ? 'التجار المعتمدون' : 'Verified Merchants'}</span>
        </div>
        <h1 className="text-3xl font-black text-text-main">
          {locale === 'ar' ? 'دليل تجار وموزعي قطع الغيار' : 'Certified Auto Parts Vendors'}
        </h1>
        <p className="text-xs text-text-muted">
          {locale === 'ar'
            ? 'تصفح مخازن ومتاجر كبرى محلات وموزعي قطع الغيار الأصلية والمستوردة في جميع محافظات مصر'
            : 'Explore certified auto spare parts stores, workshops, and authorized distributors across Egypt'}
        </p>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="p-6 rounded-3xl border border-border-color bg-bg-primary shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                  <Store className="w-7 h-7" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-base text-text-main truncate">
                      {vendor.storeName || vendor.name}
                    </h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 mt-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold">{vendor.rating || 4.9}</span>
                    <span className="text-text-muted">({vendor.reviewCount || 120} تقييم)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-text-muted">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">
                  {vendor.addressText || (locale === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt')}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border-color">
              <Link
                href={`/${locale}/shop?vendor=${vendor.id}`}
                className="w-full py-2.5 px-4 rounded-xl bg-bg-secondary hover:bg-primary hover:text-white text-text-main text-xs font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{locale === 'ar' ? 'تصفح كتالوج المتجر' : 'Browse Store Catalog'}</span>
                <Arrow className="w-3.5 h-3.5 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
