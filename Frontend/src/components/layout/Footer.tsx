'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Send, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';
import { siteConfig } from '@/config/site.config';
import { Locale } from '@/lib/api/types';
import { getMessages, resolveLocalized } from '@/lib/i18n';

interface FooterProps {
  locale: Locale;
}

export const Footer: React.FC<FooterProps> = ({ locale }) => {
  const t = getMessages(locale);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <footer className="w-full bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      {/* 4 Feature Promo Pillars */}
      <div className="border-b border-slate-800 bg-slate-950/50 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">توصيل سريع وفوري</h4>
              <p className="text-slate-500 text-[11px]">توصيل في نفس اليوم لجميع المحافظات</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">قطع أصلية بضمان</h4>
              <p className="text-slate-500 text-[11px]">ضمان على جميع القطع والموردين</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">استرجاع سهل 14 يوم</h4>
              <p className="text-slate-500 text-[11px]">استبدال واسترجاع بدون تعقيدات</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">دعم فني متخصص</h4>
              <p className="text-slate-500 text-[11px]">استشارات ميكانيكية وخدمة عملاء 19876</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Col 1 & 2: Brand Info & Contact */}
        <div className="lg:col-span-2 space-y-4">
          <Link href={`/${locale}`} className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-dark.svg" alt={siteConfig.brand.name[locale]} className="h-9 w-auto" />
          </Link>
          <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
            {siteConfig.brand.tagline ? siteConfig.brand.tagline[locale] : ''}
          </p>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold text-slate-200">الخط الساخن: {siteConfig.header.topBarContacts.phone}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>{siteConfig.header.topBarContacts.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>القاهرة، جمهورية مصر العربية</span>
            </div>
          </div>
        </div>

        {/* Dynamic Footer Link Columns */}
        {siteConfig.menus.footer.map((col, idx) => (
          <div key={idx} className="space-y-3">
            <h4 className="font-bold text-white text-sm">{resolveLocalized(col.title, locale)}</h4>
            <ul className="space-y-2">
              {col.items.map((item, i) => (
                <li key={i}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className="hover:text-white transition-colors block py-0.5"
                  >
                    {resolveLocalized(item.label, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter Signup */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-sm">النشرة البريدية</h4>
          <p className="text-slate-400 text-xs">
            اشترك ليصلك أحدث العروض والخصومات الحصرية لقطع غيار سيارتك.
          </p>

          {subscribed ? (
            <p className="text-success text-xs font-bold">شكراً لاشتراكك في النشرة البريدية!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني..."
                  className="w-full text-xs px-3 py-2.5 bg-slate-800 text-slate-200 rounded-s-lg border border-slate-700 outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="px-4 bg-primary hover:bg-primary-hover text-white rounded-e-lg font-bold transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Subscribe"
                >
                  <Send className="w-3.5 h-3.5 rtl-mirror" />
                </button>
              </div>
            </form>
          )}

          {/* Payment Badges */}
          <div className="pt-4">
            <span className="block text-[11px] text-slate-500 mb-2 font-medium">وسائل الدفع المقبولة:</span>
            <div className="flex items-center gap-2">
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded text-[10px] font-bold border border-slate-700">
                الدفع عند الاستلام (COD)
              </span>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-bold border border-slate-700">
                فوري (Fawry)
              </span>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-bold border border-slate-700">
                ميزة (Meeza)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-800 py-4 px-4 text-center text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {siteConfig.brand.name[locale]}. جميع الحقوق محفوظة.</p>
          <p className="text-slate-600">مصمم ومطور كمنصة تجارة إلكترونية متعددة التجار في مصر</p>
        </div>
      </div>
    </footer>
  );
};
