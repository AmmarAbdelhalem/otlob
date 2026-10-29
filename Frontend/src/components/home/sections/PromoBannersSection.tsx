'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Wrench, Shield, Sparkles } from 'lucide-react';
import { Locale } from '@/lib/api/types';

interface PromoBannersProps {
  locale: Locale;
}

export const PromoBannersSection: React.FC<PromoBannersProps> = ({ locale }) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Banner 1: Engine Filters & Oil */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 p-6 sm:p-8 text-white shadow-lg flex flex-col justify-between group">
        <div className="space-y-3 z-10 max-w-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-md">
            {locale === 'ar' ? 'باقات الصيانة الدورية' : 'Regular Maintenance'}
          </span>
          <h4 className="text-xl sm:text-2xl font-black leading-tight">
            {locale === 'ar' ? 'فلاتر وسوائل المحرك الأصلية' : 'Genuine Engine Filters & Fluids'}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {locale === 'ar'
              ? 'احمِ محرك سيارتك بأفضل أنواع الزيوت والفلاتر من MANN و Bosch مع توصيل فوري.'
              : 'Protect your engine with premium oil and air filters from trusted brands.'}
          </p>
        </div>

        <div className="pt-6 z-10">
          <Link
            href={`/${locale}/shop?category=engine`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-primary hover:text-white text-xs font-bold transition-all shadow-md group-hover:scale-105"
          >
            <span>{locale === 'ar' ? 'تسوق فلاتر المحرك' : 'Shop Filters'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl-mirror" />
          </Link>
        </div>

        {/* Decorative Graphic */}
        <div className="absolute end-4 bottom-4 w-32 h-32 opacity-20 group-hover:opacity-30 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/products/oil-filter.svg" alt="Oil filter banner" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Banner 2: Suspension & Steering */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-950 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-lg flex flex-col justify-between group">
        <div className="space-y-3 z-10 max-w-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-danger bg-danger/10 px-2.5 py-1 rounded-md">
            {locale === 'ar' ? 'عفشة ومساعدين معتمدة' : 'Certified Suspension'}
          </span>
          <h4 className="text-xl sm:text-2xl font-black leading-tight">
            {locale === 'ar' ? 'مساعدين ومقصات وعلب دركسيون' : 'Shock Absorbers & Steering Racks'}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {locale === 'ar'
              ? 'ثبات وتحكم فائق على المطبات والمنحنيات مع ضمان استبدال فوري 14 يوماً.'
              : 'Superior stability and road control designed specifically for Egyptian roads.'}
          </p>
        </div>

        <div className="pt-6 z-10">
          <Link
            href={`/${locale}/shop?category=suspension`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md group-hover:scale-105"
          >
            <span>{locale === 'ar' ? 'تصفح قطع العفشة' : 'Browse Suspension'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl-mirror" />
          </Link>
        </div>

        {/* Decorative Graphic */}
        <div className="absolute end-4 bottom-4 w-32 h-32 opacity-20 group-hover:opacity-30 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/products/shock-absorber.svg" alt="Suspension banner" className="w-full h-full object-contain" />
        </div>
      </div>
    </section>
  );
};
