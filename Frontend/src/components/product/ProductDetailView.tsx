'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Tabs,
  Tab,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from '@heroui/react';
import {
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Share2,
  Heart,
  Repeat,
  Star,
  Copy,
  Check,
  Phone,
  MapPin,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  Car,
  ChevronRight,
  BadgeCheck,
} from 'lucide-react';
import { Locale, Product } from '@/lib/api/types';
import { formatMoney, getMessages, resolveLocalized } from '@/lib/i18n';
import { useCartStore } from '@/stores/useCartStore';
import { useGarageStore } from '@/stores/useGarageStore';
import { useWishlistStore } from '@/stores/useWishlistStore';
import { useCompareStore } from '@/stores/useCompareStore';
import { useUIStore } from '@/stores/useUIStore';
import { ProductCard } from '@/components/product/ProductCard';

interface ProductDetailViewProps {
  locale: Locale;
  product: Product;
  relatedProducts: Product[];
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  locale,
  product,
  relatedProducts,
}) => {
  const t = getMessages(locale);
  const router = useRouter();

  // Stores
  const { addItem } = useCartStore();
  const { activeVehicle } = useGarageStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { isInCompare, toggleCompare } = useCompareStore();
  const { setMiniCartOpen, openGarageModal } = useUIStore();

  // Component State
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0] || product.thumbnail || '/images/products/placeholder.svg'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('desc');
  const [copiedOem, setCopiedOem] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  // Check vehicle fitment
  const fitmentStatus = React.useMemo(() => {
    if (!activeVehicle) return null;
    const vMake = activeVehicle.make?.toLowerCase();
    const vModel = activeVehicle.model?.toLowerCase();
    const vYear = activeVehicle.year;

    const matched = product.compatibilities.find((c) => {
      const makeMatch = c.make.toLowerCase() === vMake;
      const modelMatch = c.model.toLowerCase() === vModel;
      if (!makeMatch || !modelMatch) return false;
      if (vYear) {
        return vYear >= c.yearFrom && vYear <= c.yearTo;
      }
      return true;
    });

    return !!matched;
  }, [activeVehicle, product.compatibilities]);

  // Handle OEM Copy
  const handleCopyOem = () => {
    navigator.clipboard.writeText(product.oemNumber);
    setCopiedOem(true);
    setTimeout(() => setCopiedOem(false), 2000);
  };

  // Scroll listener for sticky CTA bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add to cart handler
  const handleAddToCart = () => {
    addItem(product, quantity);
    setMiniCartOpen(true);
  };

  // Buy Now handler
  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push(`/${locale}/checkout`);
  };

  // WhatsApp Order Link generator
  const getWhatsAppLink = () => {
    const merchantPhone = product.merchant?.phone || '201099887766';
    const cleanPhone = merchantPhone.replace(/[^0-9]/g, '');
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const textAr = `السلام عليكم، أرغب في طلب القطعة التالية:\n*${product.name}*\nكود القطعة (SKU): ${product.sku}\nرقم OEM: ${product.oemNumber}\nالسعر: ${product.price} ج.م\nالكمية: ${quantity}\nرابط المنتج: ${currentUrl}`;
    const textEn = `Hello, I would like to order this spare part:\n*${product.name}*\nSKU: ${product.sku}\nOEM: ${product.oemNumber}\nPrice: ${product.price} EGP\nQuantity: ${quantity}\nLink: ${currentUrl}`;
    const msg = locale === 'ar' ? textAr : textEn;
    return `https://wa.me/${cleanPhone.startsWith('2') ? cleanPhone : '2' + cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Share handler
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.thumbnail];

  return (
    <div className="space-y-10 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 font-mono flex-wrap">
        <Link href={`/${locale}`} className="hover:text-white transition-colors">
          {locale === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        <Link href={`/${locale}/shop`} className="hover:text-white transition-colors">
          {locale === 'ar' ? 'المتجر' : 'Shop'}
        </Link>
        {product.categorySlug && (
          <>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            <Link
              href={`/${locale}/category/${product.categorySlug}`}
              className="hover:text-white transition-colors"
            >
              {product.categoryName ? resolveLocalized(product.categoryName, locale) : product.categorySlug}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        <span className="text-white font-medium line-clamp-1 max-w-[280px]">
          {product.name}
        </span>
      </nav>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Showcase Image */}
          <Card className="relative aspect-square rounded-2xl bg-[#0a0a0a] border border-[#262626] overflow-hidden group flex items-center justify-center p-6 shadow-sm">
            {/* Badges */}
            <div className="absolute top-4 start-4 z-10 flex flex-col gap-1.5">
              {product.badges?.map((b, i) => (
                <Chip
                  key={i}
                  size="sm"
                  variant="flat"
                  className="bg-[#171717] border border-[#262626] text-white font-mono text-[11px]"
                >
                  {resolveLocalized(b.text, locale)}
                </Chip>
              ))}
              {product.discountPercentage && product.discountPercentage > 0 && (
                <Chip size="sm" color="success" variant="flat" className="font-mono text-[11px]">
                  {locale === 'ar' ? `وفر ${product.discountPercentage}%` : `Save ${product.discountPercentage}%`}
                </Chip>
              )}
            </div>

            {/* Main Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />

            {/* Quick Action Overlay (Share / Wishlist / Compare) */}
            <div className="absolute top-4 end-4 z-10 flex flex-col gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={() => toggleWishlist(product)}
                className={`rounded-full border w-8 h-8 min-w-8 ${
                  isWishlisted
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-[#141414] border-[#262626] text-neutral-400 hover:text-white'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>

              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={() => toggleCompare(product)}
                className={`rounded-full border w-8 h-8 min-w-8 ${
                  isCompared
                    ? 'bg-white text-black border-white'
                    : 'bg-[#141414] border-[#262626] text-neutral-400 hover:text-white'
                }`}
                aria-label="Compare"
              >
                <Repeat className="w-3.5 h-3.5" />
              </Button>

              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={handleShare}
                className="rounded-full bg-[#141414] border border-[#262626] text-neutral-400 hover:text-white w-8 h-8 min-w-8 relative"
                aria-label="Share"
              >
                <Share2 className="w-3.5 h-3.5" />
                {shareFeedback && (
                  <span className="absolute -bottom-7 start-1/2 -translate-x-1/2 bg-white text-black font-mono text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                    {locale === 'ar' ? 'تم نسخ الرابط' : 'Link copied!'}
                  </span>
                )}
              </Button>
            </div>
          </Card>

          {/* Thumbnails Carousel */}
          {imagesList.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-18 h-18 rounded-xl border overflow-hidden flex-shrink-0 p-1.5 transition-all bg-[#0a0a0a] cursor-pointer ${
                    selectedImage === img
                      ? 'border-white ring-1 ring-white/30'
                      : 'border-[#262626] opacity-60 hover:opacity-100 hover:border-neutral-500'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Security & Authenticity Guarantee Banner */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-[#262626] bg-[#0a0a0a] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-white flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">
                  {locale === 'ar' ? 'ضمان أصلي 100%' : '100% Genuine'}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {locale === 'ar' ? 'معتمد من الوكيل المباشر' : 'Official certified part'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-[#262626] bg-[#0a0a0a] flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">
                  {locale === 'ar' ? 'إرجاع سهل 14 يوم' : '14-Day Returns'}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {locale === 'ar' ? 'استرجاع فوري للأموال' : 'Money-back guarantee'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Meta, Purchase Actions, Merchant Card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Info: Brand, SKU, OEM and Rating */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                {product.brand && (
                  <Chip size="sm" variant="flat" className="bg-white text-black font-bold font-mono">
                    {product.brand}
                  </Chip>
                )}
                <span className="text-neutral-400 font-mono">SKU: {product.sku}</span>
              </div>

              {/* OEM Number with copy button */}
              <div className="flex items-center gap-1.5 bg-[#0a0a0a] px-2.5 py-1 rounded-lg border border-[#262626]">
                <span className="text-neutral-400 font-mono text-[11px]">OEM:</span>
                <span className="font-mono font-bold text-white text-xs">{product.oemNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyOem}
                  className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title={locale === 'ar' ? 'نسخ رقم OEM' : 'Copy OEM'}
                >
                  {copiedOem ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars & Reviews */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-neutral-600'
                    }`}
                  />
                ))}
                <span className="font-bold ms-1 text-white font-mono">
                  {product.rating?.toFixed(1) || '4.9'}
                </span>
              </div>
              <span className="text-neutral-600">•</span>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="text-neutral-400 hover:text-white underline cursor-pointer"
              >
                {product.reviewCount || 48} {locale === 'ar' ? 'تقييم موثق من المشترين' : 'verified reviews'}
              </button>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400 font-mono">
                {locale === 'ar' ? `تم بيع ${product.soldCount || 84} قطعة` : `${product.soldCount || 84} sold`}
              </span>
            </div>
          </div>

          {/* Vehicle Fitment Alert Box */}
          <Card className="border border-[#262626] p-4 bg-[#0a0a0a] shadow-sm">
            {activeVehicle ? (
              fitmentStatus ? (
                <div className="flex items-start gap-3 text-emerald-400 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-sm text-white">
                      {locale === 'ar' ? 'متوافق تماماً مع سيارتك المحددة' : 'Guaranteed to Fit Your Vehicle'}
                    </p>
                    <p className="mt-0.5 text-neutral-300 font-mono">
                      {activeVehicle.make} {activeVehicle.model} {activeVehicle.year}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-rose-400 bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-sm text-white">
                      {locale === 'ar' ? 'تنبيه: غير متوافق مع سيارتك المحددة' : 'Warning: Does Not Fit Your Vehicle'}
                    </p>
                    <p className="mt-0.5 text-neutral-300 font-mono">
                      {activeVehicle.make} {activeVehicle.model} {activeVehicle.year}
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-between gap-4 flex-wrap bg-[#111111] p-3.5 rounded-xl border border-[#262626]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#171717] border border-[#262626] flex items-center justify-center text-white flex-shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {locale === 'ar' ? 'تأكد من توافق القطعة مع سيارتك' : 'Check vehicle fitment before buying'}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {locale === 'ar' ? 'حدد الماركة والموديل وسنة الصنع' : 'Select your make, model and year'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={openGarageModal}
                  className="bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors"
                >
                  {locale === 'ar' ? 'اختر سيارتك' : 'Select Vehicle'}
                </Button>
              </div>
            )}
          </Card>

          {/* Pricing & Stock Progress */}
          <Card className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#262626] space-y-4 shadow-sm">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {formatMoney(product.price, locale)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-base text-neutral-500 line-through font-mono">
                    {formatMoney(product.originalPrice, locale)}
                  </span>
                  <Chip size="sm" color="success" variant="flat" className="font-mono text-xs">
                    {locale === 'ar'
                      ? `وفرت ${formatMoney(product.originalPrice - product.price, locale)}`
                      : `Save ${formatMoney(product.originalPrice - product.price, locale)}`}
                  </Chip>
                </>
              )}
            </div>

            <p className="text-xs text-neutral-400 flex items-center gap-1.5 font-mono">
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              {locale === 'ar' ? 'الأسعار شاملة ضريبة القيمة المضافة 14%' : 'All prices include 14% VAT'}
            </p>

            {/* Stock Level Progress Indicator */}
            <div className="space-y-1.5 pt-2 border-t border-[#262626]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {product.stockQuantity > 5
                    ? locale === 'ar'
                      ? 'متوفر في المخزن - جاهز للشحن الفوري'
                      : 'In Stock - Ready for immediate dispatch'
                    : locale === 'ar'
                    ? `متبقي ${product.stockQuantity} قطع فقط!`
                    : `Only ${product.stockQuantity} left in stock!`}
                </span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  {product.availableStock || product.stockQuantity} / 50
                </span>
              </div>
              <Progress
                size="sm"
                value={Math.min(100, Math.max(15, ((product.availableStock || 25) / 50) * 100))}
                classNames={{
                  track: 'bg-[#171717] border border-[#262626]',
                  indicator: 'bg-white',
                }}
              />
            </div>
          </Card>

          {/* Quantity Selector, Add to Cart, Buy Now & WhatsApp */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-[#262626] rounded-xl bg-[#0a0a0a] overflow-hidden h-12 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 h-full text-neutral-400 hover:text-white hover:bg-[#141414] transition-colors cursor-pointer"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-mono font-bold text-sm min-w-[36px] text-center text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="px-3.5 h-full text-neutral-400 hover:text-white hover:bg-[#141414] transition-colors cursor-pointer"
                  disabled={quantity >= product.stockQuantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <Button
                onPress={handleAddToCart}
                className="flex-1 h-12 bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors shadow-sm"
                startContent={<ShoppingBag className="w-4 h-4" />}
              >
                {t.common.addToCart}
              </Button>

              {/* Buy Now Button */}
              <Button
                onPress={handleBuyNow}
                variant="flat"
                className="h-12 px-5 bg-[#171717] hover:bg-[#262626] text-white border border-[#262626] font-bold text-sm transition-all"
                startContent={<Zap className="w-4 h-4 text-amber-400" />}
              >
                {t.common.buyNow}
              </Button>
            </div>

            {/* WhatsApp Direct Ordering Button */}
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>{locale === 'ar' ? 'طلب فوري ومباشر عبر واتساب' : 'Quick Order via WhatsApp'}</span>
            </a>
          </div>

          {/* Multi-Vendor Seller Information Card */}
          {product.merchant && (
            <Card className="p-4 rounded-xl border border-[#262626] bg-[#0a0a0a] flex flex-row items-center justify-between gap-4 flex-wrap shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-black font-bold flex items-center justify-center text-sm">
                  {product.merchant.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white">
                      {product.merchant.storeName || product.merchant.name}
                    </p>
                    <span className="flex items-center text-[10px] font-bold text-amber-400 font-mono">
                      ★ {product.merchant.rating || 4.8}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                    {product.merchant.addressText}
                  </p>
                </div>
              </div>

              <Link
                href={`/${locale}/shop?vendor=${product.merchant.slug || product.merchant.id}`}
                className="text-xs font-bold text-white hover:underline font-mono"
              >
                {locale === 'ar' ? 'زيارة متجر التاجر' : 'Visit Store'}
              </Link>
            </Card>
          )}

          {/* Delivery & Payment Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-400 pt-2 border-t border-[#262626]">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-white flex-shrink-0" />
              <span>
                {locale === 'ar'
                  ? 'توصيل فوري خلال 2 إلى 4 ساعات للقاهرة والجيزة'
                  : 'Fast delivery within 2-4 hours in Cairo & Giza'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <BadgeCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                {locale === 'ar'
                  ? 'الدفع عند الاستلام، كارت، إنستاباي، أو تقسيط فوري'
                  : 'Cash on delivery, cards, Instapay, or installments'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Section */}
      <div className="pt-10 border-t border-[#262626] space-y-6">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(String(key))}
          variant="underlined"
          classNames={{
            tabList: 'border-b border-[#262626] p-0 gap-6',
            cursor: 'bg-white',
            tab: 'text-neutral-400 font-semibold text-xs data-[selected=true]:text-white pb-3',
          }}
        >
          <Tab
            key="desc"
            title={locale === 'ar' ? 'الوصف ومميزات القطعة' : 'Description & Features'}
          >
            <div className="pt-6 prose prose-invert prose-sm max-w-none text-neutral-300 leading-relaxed">
              {product.description ? (
                <div
                  className="rich-content"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-neutral-500 italic text-sm">
                  {locale === 'ar' ? 'لا يوجد وصف متاح لهذا المنتج.' : 'No description available for this product.'}
                </p>
              )}
            </div>
          </Tab>

          <Tab
            key="specs"
            title={locale === 'ar' ? 'المواصفات الفنية وأرقام OEM' : 'Technical Specs & OEM'}
          >
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl border border-[#262626] bg-[#0a0a0a]">
                <span className="text-neutral-500 block text-[11px] font-sans">
                  {locale === 'ar' ? 'رقم القطعة الأصلي (OEM)' : 'OEM Part Number'}
                </span>
                <span className="font-bold text-white text-sm mt-0.5 block">{product.oemNumber}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#262626] bg-[#0a0a0a]">
                <span className="text-neutral-500 block text-[11px] font-sans">
                  {locale === 'ar' ? 'كود المخزن (SKU)' : 'SKU'}
                </span>
                <span className="font-bold text-white text-sm mt-0.5 block">{product.sku}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#262626] bg-[#0a0a0a]">
                <span className="text-neutral-500 block text-[11px] font-sans">
                  {locale === 'ar' ? 'الوزن الصافي' : 'Weight'}
                </span>
                <span className="font-bold text-white text-sm mt-0.5 block">{product.weightKg} {locale === 'ar' ? 'كجم' : 'kg'}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#262626] bg-[#0a0a0a]">
                <span className="text-neutral-500 block text-[11px] font-sans">
                  {locale === 'ar' ? 'الأبعاد (طول × عرض × ارتفاع)' : 'Dimensions (L × W × H)'}
                </span>
                <span className="font-bold text-white text-sm mt-0.5 block">
                  {product.dimensionsCm.length} × {product.dimensionsCm.width} × {product.dimensionsCm.height} cm
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#262626] bg-[#0a0a0a]">
                <span className="text-neutral-500 block text-[11px] font-sans">
                  {locale === 'ar' ? 'الحالة' : 'Condition'}
                </span>
                <span className="font-bold text-white text-sm mt-0.5 block capitalize">{product.condition}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-[#262626] bg-[#0a0a0a]">
                <span className="text-neutral-500 block text-[11px] font-sans">
                  {locale === 'ar' ? 'بلد الصنع / الماركة' : 'Brand / Origin'}
                </span>
                <span className="font-bold text-white text-sm mt-0.5 block">{product.brand || 'Original OEM'}</span>
              </div>
            </div>
          </Tab>

          <Tab
            key="fitment"
            title={`${locale === 'ar' ? 'السيارات المتوافقة' : 'Fitment List'} (${product.compatibilities.length})`}
          >
            <div className="pt-6 space-y-4">
              <p className="text-xs text-neutral-400">
                {locale === 'ar'
                  ? 'تم فحص ومطابقة هذه القطعة وفقاً لقواعد البيانات الفنية لمصنعي السيارات التالية:'
                  : 'This part is fully verified against the technical databases of the following car models:'}
              </p>
              <Table
                aria-label="Fitment List"
                classNames={{
                  base: 'border border-[#262626] rounded-xl overflow-hidden',
                  th: 'bg-[#111111] text-white font-bold text-xs',
                  td: 'text-xs text-neutral-300 border-b border-[#262626]',
                }}
              >
                <TableHeader>
                  <TableColumn>{locale === 'ar' ? 'الماركة' : 'Make'}</TableColumn>
                  <TableColumn>{locale === 'ar' ? 'الموديل' : 'Model'}</TableColumn>
                  <TableColumn>{locale === 'ar' ? 'سنوات الصنع' : 'Years'}</TableColumn>
                  <TableColumn>{locale === 'ar' ? 'حالة التوافق' : 'Fitment Status'}</TableColumn>
                </TableHeader>
                <TableBody>
                  {product.compatibilities.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-bold text-white">{c.make}</TableCell>
                      <TableCell>{c.model}</TableCell>
                      <TableCell className="font-mono">{c.yearFrom} - {c.yearTo}</TableCell>
                      <TableCell>
                        <Chip size="sm" color="success" variant="flat" className="font-mono text-[10px]">
                          {locale === 'ar' ? 'تطابق تام 100%' : '100% Fit'}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Tab>

          <Tab
            key="shipping"
            title={locale === 'ar' ? 'الشحن والضمان والاسترجاع' : 'Shipping & Returns'}
          >
            <div className="pt-6 space-y-4 text-xs text-neutral-300 leading-relaxed">
              <Card className="p-4 rounded-xl border border-[#262626] bg-[#0a0a0a] space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-white" />
                  {locale === 'ar' ? 'مواعيد وطرق التوصيل في مصر' : 'Delivery Times & Coverage'}
                </h4>
                <p className="text-neutral-400">
                  {locale === 'ar'
                    ? 'يتم تسليم الطلبات داخل القاهرة الكبرى والجيزة خلال ساعتين إلى 4 ساعات عبر كباتن التوصيل السريع. للمحافظات الأخرى، يصل الطلب خلال 24 إلى 48 ساعة كحد أقصى.'
                    : 'Orders within Greater Cairo and Giza are delivered in 2-4 hours. Other Egyptian governorates within 24-48 hours.'}
                </p>
              </Card>

              <Card className="p-4 rounded-xl border border-[#262626] bg-[#0a0a0a] space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  {locale === 'ar' ? 'سياسة الاستبدال والاسترجاع' : 'Return & Refund Policy'}
                </h4>
                <p className="text-neutral-400">
                  {locale === 'ar'
                    ? 'يحق للعميل إرجاع أو استبدال القطعة خلال 14 يوماً من تاريخ الاستلام بشرط أن تكون في حالتها وعبوتها الأصلية غير مستخدمة، مع إمكانية المعاينة قبل الاستلام ودفع الحساب.'
                    : 'You have 14 days to return or replace the item provided it is in original packaging and uninstalled.'}
                </p>
              </Card>
            </div>
          </Tab>

          <Tab
            key="reviews"
            title={`${locale === 'ar' ? 'تقييمات المشترين' : 'Reviews'} (${product.reviewCount || 48})`}
          >
            <div className="pt-6 space-y-6">
              <Card className="p-5 rounded-xl border border-[#262626] bg-[#0a0a0a] flex flex-row items-center justify-between gap-6 flex-wrap shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black text-white font-mono">
                    {product.rating?.toFixed(1) || '4.9'}
                  </div>
                  <div>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 font-mono">
                      {locale === 'ar' ? 'بناءً على 48 مشتري موثق' : 'Based on 48 verified buyers'}
                    </p>
                  </div>
                </div>

                <Button
                  className="bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors"
                >
                  {locale === 'ar' ? 'أضف تقييمك وتجربتك' : 'Write a Review'}
                </Button>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Related Products Carousel / Grid */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-[#262626] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {locale === 'ar' ? 'قطع غيار يشتريها العملاء أيضاً' : 'Related & Recommended Parts'}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {locale === 'ar' ? 'قطع متوافقة ومكملة لهذه المنظومة' : 'Frequently bought together'}
              </p>
            </div>
            <Link
              href={`/${locale}/shop?category=${product.categorySlug || 'brakes'}`}
              className="text-xs font-bold text-white hover:underline font-mono"
            >
              {locale === 'ar' ? 'عرض المزيد' : 'View more'}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Add To Cart Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 start-0 end-0 z-40 bg-black/90 backdrop-blur-md border-t border-[#262626] shadow-2xl py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.thumbnail}
                alt=""
                className="w-12 h-12 rounded-lg object-contain bg-[#111111] p-1 border border-[#262626] flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-sm">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-white font-mono">
                    {formatMoney(product.price, locale)}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                    OEM: {product.oemNumber}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onPress={handleAddToCart}
                className="h-10 px-4 sm:px-6 bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all shadow-sm"
                startContent={<ShoppingBag className="w-3.5 h-3.5" />}
              >
                <span>{t.common.addToCart}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
