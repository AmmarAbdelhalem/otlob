'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Input,
  Chip,
  Divider,
  ScrollShadow,
} from '@heroui/react';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, Store, Tag } from 'lucide-react';
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
  const { cart, updateQuantity, removeItem, applyCoupon, removeCoupon, couponCode } =
    useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; success: boolean } | null>(null);

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

  const drawerPlacement = locale === 'ar' ? 'left' : 'right';

  return (
    <Drawer
      isOpen={isMiniCartOpen}
      onOpenChange={(open) => setMiniCartOpen(open)}
      placement={drawerPlacement}
      size="md"
      backdrop="blur"
      classNames={{
        backdrop: 'bg-black/80 backdrop-blur-sm',
        base: 'bg-[#0a0a0a] border-x border-[#262626] text-[#ededed] shadow-2xl',
        header: 'border-b border-[#262626] p-4 bg-[#0a0a0a]',
        body: 'p-0 bg-[#000000]',
        footer: 'border-t border-[#262626] p-4 bg-[#0a0a0a]',
        closeButton: 'hover:bg-[#262626] text-neutral-400 hover:text-white',
      }}
    >
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-white" />
                <h2 className="text-base font-bold text-white">{t.cart.title}</h2>
                <Chip size="sm" variant="flat" className="bg-[#171717] text-white border border-[#262626] font-mono">
                  {cart.itemCount}
                </Chip>
              </div>
            </DrawerHeader>

            <DrawerBody>
              <ScrollShadow className="w-full h-full p-4 space-y-4">
                {cart.items.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-[#262626] flex items-center justify-center mx-auto text-neutral-500">
                      <ShoppingBag className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="text-sm text-neutral-400">{t.cart.empty}</p>
                    <Button
                      onPress={() => setMiniCartOpen(false)}
                      variant="flat"
                      className="bg-[#171717] text-white hover:bg-[#262626] border border-[#262626] text-xs font-semibold"
                    >
                      {t.cart.continueShopping}
                    </Button>
                  </div>
                ) : (
                  cart.vendorGroups.map((group) => (
                    <div
                      key={group.merchantId}
                      className="border border-[#262626] rounded-xl p-3 bg-[#0a0a0a] space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#262626] pb-2">
                        <div className="flex items-center gap-1.5 text-neutral-200">
                          <Store className="w-4 h-4 text-neutral-400" />
                          <span>{group.merchantName}</span>
                        </div>
                        <span className="text-neutral-500 font-normal text-[11px] font-mono">
                          {t.cart.deliveryFee} {formatMoney(group.estimatedDeliveryFee, locale)}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3 bg-[#111111] p-2.5 rounded-lg border border-[#262626]"
                          >
                            <div className="w-14 h-14 rounded-md bg-[#171717] shrink-0 flex items-center justify-center overflow-hidden border border-[#262626]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.product.thumbnail || '/images/products/brake-pads.svg'}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-white truncate">
                                  {item.product.name}
                                </h4>
                                <span className="text-[11px] text-neutral-400 block font-mono">
                                  {item.product.sku}
                                </span>
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-black text-white font-mono">
                                  {formatMoney(item.totalPrice, locale)}
                                </span>

                                {/* Quantity Controls */}
                                <div className="flex items-center border border-[#262626] rounded-md bg-[#0a0a0a]">
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                                    className="w-7 h-7 min-w-7 text-neutral-300 hover:text-white"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <span className="px-1 text-xs font-bold text-white min-w-6 text-center font-mono">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                                    className="w-7 h-7 min-w-7 text-neutral-300 hover:text-white"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>

                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  onPress={() => removeItem(item.productId)}
                                  className="w-7 h-7 min-w-7 text-neutral-500 hover:text-rose-400"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </ScrollShadow>
            </DrawerBody>

            {cart.items.length > 0 && (
              <DrawerFooter className="flex flex-col gap-3">
                {/* Coupon Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2 w-full">
                  <Input
                    size="sm"
                    variant="bordered"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder={t.cart.couponPlaceholder}
                    startContent={<Tag className="w-3.5 h-3.5 text-neutral-400" />}
                    classNames={{
                      inputWrapper: 'border-[#262626] bg-[#111111] hover:border-neutral-700',
                      input: 'text-xs uppercase font-mono',
                    }}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="flat"
                    className="bg-[#171717] hover:bg-[#262626] text-white border border-[#262626] text-xs font-semibold px-4"
                  >
                    {t.cart.applyCoupon}
                  </Button>
                </form>

                {couponMsg && (
                  <p className={`text-xs ${couponMsg.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {couponMsg.text}
                  </p>
                )}

                {couponCode && (
                  <div className="flex items-center justify-between text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-full">
                    <span>{locale === 'ar' ? 'كود الخصم المطبق:' : 'Coupon Code:'} <strong className="font-mono">{couponCode}</strong></span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs font-bold hover:underline cursor-pointer"
                    >
                      {locale === 'ar' ? 'إلغاء' : 'Remove'}
                    </button>
                  </div>
                )}

                <Divider className="bg-[#262626]" />

                {/* Price Breakdown */}
                <div className="w-full space-y-1.5 text-xs text-neutral-400">
                  <div className="flex justify-between">
                    <span>{t.cart.subtotal}</span>
                    <span className="font-semibold text-white font-mono">{formatMoney(cart.subtotal, locale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.cart.deliveryFee}</span>
                    <span className="font-semibold text-white font-mono">{formatMoney(cart.totalDeliveryFee, locale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.cart.serviceFee}</span>
                    <span className="font-semibold text-white font-mono">{formatMoney(cart.platformServiceFee, locale)}</span>
                  </div>
                  {cart.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>{locale === 'ar' ? 'الخصم المطبق' : 'Discount Applied'}</span>
                      <span className="font-mono">- {formatMoney(cart.discountAmount, locale)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-[#262626]">
                    <span>{t.cart.total}</span>
                    <span className="text-white font-mono">{formatMoney(cart.totalAmount, locale)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Button
                  as={Link}
                  href={`/${locale}/checkout`}
                  onPress={() => setMiniCartOpen(false)}
                  className="w-full bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors py-6 shadow-sm"
                  endContent={<ArrowRight className="w-4 h-4 rtl-mirror" />}
                >
                  {t.cart.checkout}
                </Button>
              </DrawerFooter>
            )}
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};
