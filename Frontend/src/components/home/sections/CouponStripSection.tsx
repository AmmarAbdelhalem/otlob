'use client';

import React, { useState, useEffect } from 'react';
import { Button, Chip } from '@heroui/react';
import { Tag, Copy, Check } from 'lucide-react';
import { Locale } from '@/lib/api/types';

interface CouponStripProps {
  locale: Locale;
}

export const CouponStripSection: React.FC<CouponStripProps> = ({ locale }) => {
  const [copied, setCopied] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<any | null>(null);

  // Fetch real active coupons from Filament CMS (/api/offers)
  useEffect(() => {
    async function fetchCoupon() {
      try {
        const res = await fetch('/api/offers?coupons_only=true');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setActiveCoupon(json.data[0]);
          } else {
            setActiveCoupon(null);
          }
        }
      } catch {
        setActiveCoupon(null);
      }
    }
    fetchCoupon();
  }, []);

  if (!activeCoupon) {
    // If no coupon exists in database, return null — zero hardcoded coupons
    return null;
  }

  const code = activeCoupon.code;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const discountText =
    activeCoupon.discount_type === 'percentage'
      ? `${Number(activeCoupon.discount_value)}%`
      : `${Number(activeCoupon.discount_value).toLocaleString()} ${locale === 'ar' ? 'ج.م' : 'EGP'}`;

  return (
    <section className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
          <Tag className="w-5 h-5 text-neutral-300" />
        </div>
        <div>
          <Chip size="sm" variant="flat" className="bg-neutral-900 text-neutral-300 font-bold text-[10px] uppercase mb-1">
            {locale === 'ar' ? 'كوبون خصم إضافي' : 'Special Promo Code'}
          </Chip>
          <h4 className="text-sm sm:text-base font-bold leading-tight text-white">
            {locale === 'ar'
              ? `احصل على خصم ${discountText} فوري على سلة مشترياتك!`
              : `Get ${discountText} instant discount on your order!`}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-neutral-800">
        <span className="font-mono font-black text-sm px-3 tracking-widest text-white">
          {code}
        </span>
        <Button
          size="sm"
          onClick={handleCopy}
          className="bg-white text-black font-bold text-xs hover:bg-neutral-200 shadow-sm"
          startContent={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copied ? (locale === 'ar' ? 'تم النسخ!' : 'Copied!') : (locale === 'ar' ? 'نسخ الكود' : 'Copy Code')}
        </Button>
      </div>
    </section>
  );
};
