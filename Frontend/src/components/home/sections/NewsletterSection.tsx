'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import { Locale } from '@/lib/api/types';

interface NewsletterProps {
  locale: Locale;
}

export const NewsletterSection: React.FC<NewsletterProps> = ({ locale }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4 max-w-lg">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
          <Mail className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">
            {locale === 'ar' ? 'اشترك في نشرة العروض الأسبوعية' : 'Subscribe to Weekly Parts Deals'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {locale === 'ar'
              ? 'احصل على أكواد خصم حصرية وتنبيهات بتوفر قطع غيار سيارتك النادرة فور وصولها.'
              : 'Receive exclusive promo codes and notifications when rare spare parts arrive.'}
          </p>
        </div>
      </div>

      <div className="w-full md:w-auto">
        {submitted ? (
          <div className="flex items-center gap-2 text-success font-bold text-sm bg-success/10 px-4 py-3 rounded-xl border border-success/20">
            <CheckCircle2 className="w-5 h-5" />
            <span>{locale === 'ar' ? 'شكراً لاشتراكك! تم تسجيل بريدك بنجاح.' : 'Thank you for subscribing!'}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={locale === 'ar' ? 'أدخل بريدك الإلكتروني...' : 'Enter your email...'}
              className="px-4 py-3 rounded-xl bg-slate-800 text-white text-xs border border-slate-700 outline-none focus:border-primary flex-1"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>{locale === 'ar' ? 'اشتراك' : 'Subscribe'}</span>
              <Send className="w-3.5 h-3.5 rtl-mirror" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
