'use client';

import React, { useState } from 'react';
import { Ticket, Copy, Check, Calendar, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export interface OfferData {
  id: string;
  code: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  is_active: boolean;
  is_coupon_only?: boolean;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

interface OfferCardProps {
  offer: OfferData;
  locale?: string;
  onApply?: (code: string) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  locale = 'ar',
  onApply,
}) => {
  const [copied, setCopied] = useState(false);
  const isAr = locale === 'ar';

  const handleCopy = () => {
    navigator.clipboard.writeText(offer.code);
    setCopied(true);
    if (onApply) {
      onApply(offer.code);
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedDiscount =
    offer.discount_type === 'percentage'
      ? `${Number(offer.discount_value)}%`
      : `${Number(offer.discount_value).toLocaleString()} ${isAr ? 'ج.م' : 'EGP'}`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface border border-surface-border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      {/* Top Banner Accent */}
      <div className="h-1.5 w-full bg-linear-to-r from-primary via-amber-500 to-rose-500" />

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        {/* Header Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? `خصم ${formattedDiscount}` : `${formattedDiscount} OFF`}</span>
            </span>

            {offer.is_coupon_only ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Ticket className="w-3 h-3" />
                <span>{isAr ? 'عرض كوبون حصري' : 'Coupon Only'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                <span>{isAr ? 'عرض فوري تلقائي' : 'Instant Deal'}</span>
              </span>
            )}
          </div>

          <div className="w-9 h-9 rounded-xl bg-surface-raised flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
            <Ticket className="w-4 h-4" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-base font-black text-text group-hover:text-primary transition-colors line-clamp-1">
            {offer.title}
          </h3>
          {offer.description && (
            <div
              className="text-xs text-text-muted leading-relaxed line-clamp-3 rich-content-sm"
              dangerouslySetInnerHTML={{ __html: offer.description }}
            />
          )}
        </div>

        {/* Coupon Code Strip */}
        <div className="mt-2 bg-surface-raised/70 border border-dashed border-surface-border rounded-xl p-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] text-text-muted font-bold block mb-0.5 uppercase tracking-wider">
              {isAr ? 'رمز الكوبون' : 'Promo Code'}
            </span>
            <span className="text-sm font-mono font-black text-text tracking-wider select-all">
              {offer.code}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-primary text-white hover:bg-primary-hover active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{isAr ? 'نسخ الكود' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Meta Details */}
        <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-[11px] text-text-muted">
          {offer.min_order_amount ? (
            <span>
              {isAr
                ? `للطلبات من ${Number(offer.min_order_amount).toLocaleString()} ج.م`
                : `Min. order ${Number(offer.min_order_amount).toLocaleString()} EGP`}
            </span>
          ) : (
            <span>{isAr ? 'بدون حد أدنى للطلب' : 'No min. order'}</span>
          )}

          {offer.end_date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-text-muted" />
              <span>
                {isAr
                  ? `ينتهي: ${new Date(offer.end_date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}`
                  : `Ends: ${new Date(offer.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Action Shortcut to Shop */}
      <div className="px-5 py-2.5 bg-surface-raised/40 border-t border-surface-border flex items-center justify-between">
        <Link
          href={`/${locale}/shop`}
          className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
        >
          <span>{isAr ? 'تطبيق الكوبون على مشترياتك' : 'Shop with this coupon'}</span>
          <ArrowRight className="w-3 h-3 rtl-mirror" />
        </Link>
      </div>
    </div>
  );
};
