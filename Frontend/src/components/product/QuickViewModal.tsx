'use client';

import React from 'react';
import Link from 'next/link';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from '@heroui/react';
import { ShoppingCart, Star, CheckCircle, ShieldCheck, Heart, ExternalLink } from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { formatMoney, getMessages } from '@/lib/i18n';
import { useUIStore } from '@/stores/useUIStore';
import { useCartStore } from '@/stores/useCartStore';
import { useWishlistStore } from '@/stores/useWishlistStore';

interface QuickViewModalProps {
  locale: Locale;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ locale }) => {
  const t = getMessages(locale);
  const { isQuickViewOpen, quickViewProduct, closeQuickView } = useUIStore();
  const { addItem: addToCart } = useCartStore();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlistStore();

  if (!quickViewProduct) return null;

  const isFavorited = isInWishlist(quickViewProduct.id);

  return (
    <Modal
      isOpen={isQuickViewOpen}
      onOpenChange={(open) => !open && closeQuickView()}
      size="3xl"
      backdrop="blur"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        backdrop: 'bg-black/80 backdrop-blur-md',
        base: 'bg-[#0a0a0a] border border-[#262626] text-[#ededed] shadow-2xl rounded-2xl',
        header: 'border-b border-[#262626] px-6 py-4 flex items-center justify-between',
        body: 'p-6',
        footer: 'border-t border-[#262626] px-6 py-4 bg-[#0a0a0a]',
        closeButton: 'hover:bg-[#262626] text-neutral-400 hover:text-white',
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Chip size="sm" variant="flat" className="bg-[#171717] text-neutral-300 font-mono text-[11px] border border-[#262626]">
                  SKU: {quickViewProduct.sku}
                </Chip>
                {quickViewProduct.oemNumber && (
                  <Chip size="sm" variant="flat" className="bg-[#171717] text-neutral-300 font-mono text-[11px] border border-[#262626]">
                    OEM: {quickViewProduct.oemNumber}
                  </Chip>
                )}
                <Chip size="sm" color="success" variant="dot" className="border-none text-emerald-400">
                  {locale === 'ar' ? 'متوفر بالمخزن' : 'In Stock'}
                </Chip>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="aspect-square rounded-xl bg-[#111111] p-6 flex items-center justify-center border border-[#262626]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={quickViewProduct.thumbnail || '/images/products/brake-pads.svg'}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-white leading-snug">
                      {quickViewProduct.name}
                    </h2>

                    <div className="flex items-center gap-1.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3.5 h-3.5 fill-current" />
                      ))}
                      <span className="text-xs text-neutral-400 ms-1 font-mono">
                        ({quickViewProduct.reviewCount || 15} {locale === 'ar' ? 'تقييم' : 'reviews'})
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3 pt-1">
                      <span className="text-2xl font-black text-white">
                        {formatMoney(quickViewProduct.price, locale)}
                      </span>
                      {quickViewProduct.originalPrice && (
                        <span className="text-xs text-neutral-500 line-through">
                          {formatMoney(quickViewProduct.originalPrice, locale)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                      {quickViewProduct.description}
                    </p>

                    <div className="space-y-2 pt-2 text-xs text-neutral-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{locale === 'ar' ? 'متوفر للشحن الفوري والتسليم في نفس اليوم' : 'Available for immediate express shipping'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-neutral-300 shrink-0" />
                        <span>{locale === 'ar' ? 'ضمان استبدال واسترجاع لمدة 14 يوماً' : '14-day replacement & return guarantee'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="bordered"
                isIconOnly
                onPress={() => toggleWishlist(quickViewProduct)}
                className={`border-[#262626] ${
                  isFavorited ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' : 'text-neutral-300 hover:text-white hover:bg-[#1a1a1a]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>

              <Button
                as={Link}
                href={`/${locale}/product/${quickViewProduct.sku}`}
                onPress={closeQuickView}
                variant="flat"
                className="bg-[#171717] hover:bg-[#262626] text-neutral-200 border border-[#262626] text-xs font-semibold"
                endContent={<ExternalLink className="w-3.5 h-3.5" />}
              >
                {locale === 'ar' ? 'عرض تفاصيل القطعة الكاملة' : 'View Full Details'}
              </Button>

              <Button
                onPress={() => {
                  addToCart(quickViewProduct, 1);
                  closeQuickView();
                }}
                className="flex-1 bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors shadow-sm"
                startContent={<ShoppingCart className="w-4 h-4" />}
              >
                {t.common.addToCart}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
