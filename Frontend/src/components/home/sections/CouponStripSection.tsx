'use client';

import React, { useState } from 'react';
import { Button, Chip } from '@heroui/react';
import { Tag, Copy, Check } from 'lucide-react';
import { Locale } from '@/lib/api/types';

interface CouponStripProps {
  locale: Locale;
}

export const CouponStripSection: React.FC<CouponStripProps> = ({ locale }) => {
  const [copied, setCopied] = useState(false);
  const code = 'OTLOB10';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-primary rounded-2xl p-4 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
          <Tag className="w-6 h-6 text-white" />
        </div>
        <div>
          <Chip size="sm" variant="flat" color="warning" className="bg-white/20 text-white font-bold text-xs uppercase mb-1">
            {locale === 'ar' ? 'كوبون خصم إضافي' : 'Special Promo Code'}
          </Chip>
          <h4 className="text-base sm:text-lg font-black leading-tight">
            {locale === 'ar'
              ? 'احصل على خصم 10% فوري على إجمالي سلة مشترياتك!'
              : 'Get 10% Instant Discount on Your Entire Cart!'}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
        <span className="font-mono font-black text-sm sm:text-base px-3 tracking-widest text-white">
          {code}
        </span>
        <Button
          size="sm"
          color="default"
          variant="solid"
          onClick={handleCopy}
          className="bg-white text-slate-900 font-bold shadow-md"
          startContent={copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copied ? (locale === 'ar' ? 'تم النسخ!' : 'Copied!') : (locale === 'ar' ? 'نسخ الكود' : 'Copy Code')}
        </Button>
      </div>
    </section>
  );
};
