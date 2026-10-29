'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Store, Tag } from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { getMessages, formatMoney } from '@/lib/i18n';
import { useCartStore } from '@/stores/useCartStore';
import { useUIStore } from '@/stores/useUIStore';

interface MiniCartDrawerProps {
  locale: Locale;
}

export const MiniCartDrawer: React.FC<MiniCartDrawerProps> = ({ locale }) => {
  const t = getMessages(locale);
  const { isMiniCartOpen, setMiniCartOpen } = useUIStore();
  const { cart, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon, couponCode } =
    useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; success: boolean } | null>(null);

  if (!isMiniCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput);
    if (res.success) {
      setCouponMsg({ text: res.message, success: true });
      setCouponInput('');
    } else {
      setCouponMsg({
        text: res.message,
        success: false,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setMiniCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 end-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-s border-surface-border shadow-2xl flex flex-col justify-between animate-slideIn">
          {/* Header */}
          <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-muted">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-text">{t.cart.title}</h2>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                {cart.itemCount}
              </span>
            </div>
            <button
              onClick={() => setMiniCartOpen(false)}
              className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-text-muted">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <p className="text-sm text-text-muted">{t.cart.empty}</p>
                <button
                  onClick={() => setMiniCartOpen(false)}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {t.cart.continueShopping}
                </button>
              </div>
            ) : (
              /* Vendor Groups */
              cart.vendorGroups.map((group) => (
                <div
                  key={group.merchantId}
                  className="border border-surface-border rounded-xl p-3 bg-surface-muted space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-text border-b border-surface-border pb-2">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Store className="w-4 h-4" />
                      <span>{group.merchantName}</span>
                    </div>
                    <span className="text-text-muted font-normal text-[11px]">
                      {t.cart.deliveryFee} {formatMoney(group.estimatedDeliveryFee, locale)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex gap-3 bg-surface p-2.5 rounded-lg border border-surface-border">
                        <div className="w-14 h-14 rounded-md bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center overflow-hidden border border-surface-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.product.thumbnail || '/images/products/brake-pads.svg'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-text truncate">
                              {item.product.name}
                            </h4>
                            <span className="text-[11px] text-text-muted block font-mono">
                              {item.product.sku}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-black text-primary">
                              {formatMoney(item.totalPrice, locale)}
                            </span>

                            {/* Quantity Controls */}
                            <div className="flex items-center border border-surface-border rounded-md bg-surface">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-text transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-bold text-text">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-text transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-text-muted hover:text-danger p-1 transition-colors cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Totals & Checkout */}
          {cart.items.length > 0 && (
            <div className="p-4 border-t border-surface-border bg-surface space-y-3">
              {/* Coupon Row */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute start-2.5 top-3 text-text-muted" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={t.cart.couponPlaceholder}
                    className="w-full text-xs ps-8 pe-3 py-2 rounded-lg bg-surface-muted border border-surface-border text-text uppercase outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary-hover text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {t.cart.applyCoupon}
                </button>
              </form>
              {couponMsg && (
                <p className={`text-xs ${couponMsg.success ? 'text-success' : 'text-danger'}`}>
                  {couponMsg.text}
                </p>
              )}
              {couponCode && (
                <div className="flex items-center justify-between text-xs bg-success/10 text-success px-2 py-1 rounded">
                  <span>كود الخصم: {couponCode}</span>
                  <button onClick={removeCoupon} className="text-xs font-bold hover:underline cursor-pointer">
                    إلغاء
                  </button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-text-muted pt-2 border-t border-surface-border">
                <div className="flex justify-between">
                  <span>{t.cart.subtotal}</span>
                  <span className="font-semibold text-text">{formatMoney(cart.subtotal, locale)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.cart.deliveryFee}</span>
                  <span className="font-semibold text-text">{formatMoney(cart.totalDeliveryFee, locale)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.cart.serviceFee}</span>
                  <span className="font-semibold text-text">{formatMoney(cart.platformServiceFee, locale)}</span>
                </div>
                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-success font-semibold">
                    <span>الخصم المطبق</span>
                    <span>- {formatMoney(cart.discountAmount, locale)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-text pt-2 border-t border-surface-border">
                  <span>{t.cart.total}</span>
                  <span className="text-primary">{formatMoney(cart.totalAmount, locale)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href={`/${locale}/checkout`}
                onClick={() => setMiniCartOpen(false)}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-primary hover:bg-primary-hover text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.cart.checkout}</span>
                <ArrowRight className="w-4 h-4 rtl-mirror" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
