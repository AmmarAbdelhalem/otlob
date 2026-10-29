'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Sparkles,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  Car,
  ChevronRight,
  ChevronDown,
  Layers,
  FileText,
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
  const { activeVehicle, vehicles } = useGarageStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { isInCompare, toggleCompare } = useCompareStore();
  const { setMiniCartOpen, openGarageModal } = useUIStore();

  // Component State
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0] || product.thumbnail || '/images/products/placeholder.svg'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'fitment' | 'shipping' | 'reviews'>('desc');
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
      <nav className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
        <Link href={`/${locale}`} className="hover:text-primary transition-colors">
          {locale === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        <Link href={`/${locale}/shop`} className="hover:text-primary transition-colors">
          {locale === 'ar' ? 'المتجر' : 'Shop'}
        </Link>
        {product.categorySlug && (
          <>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            <Link
              href={`/${locale}/category/${product.categorySlug}`}
              className="hover:text-primary transition-colors"
            >
              {product.categoryName ? resolveLocalized(product.categoryName, locale) : product.categorySlug}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        <span className="text-text-main font-medium line-clamp-1 max-w-[280px]">
          {product.name}
        </span>
      </nav>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Showcase Image */}
          <div className="relative aspect-square rounded-2xl bg-bg-secondary/40 border border-border-color overflow-hidden group flex items-center justify-center p-6 shadow-sm">
            {/* Badges */}
            <div className="absolute top-4 start-4 z-10 flex flex-col gap-1.5">
              {product.badges?.map((b, i) => (
                <span
                  key={i}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-white shadow-sm ${
                    b.variant === 'danger'
                      ? 'bg-accent'
                      : b.variant === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-primary'
                  }`}
                >
                  {resolveLocalized(b.text, locale)}
                </span>
              ))}
              {product.discountPercentage && product.discountPercentage > 0 && (
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
                  {locale === 'ar' ? `وفر ${product.discountPercentage}%` : `Save ${product.discountPercentage}%`}
                </span>
              )}
            </div>

            {/* Main Image */}
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />

            {/* Quick Action Overlay (Share / Wishlist / Compare) */}
            <div className="absolute top-4 end-4 z-10 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                title={locale === 'ar' ? 'إضافة للمفضلة' : 'Add to wishlist'}
                className={`p-2.5 rounded-full border shadow-md transition-all ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                    : 'bg-bg-primary/90 border-border-color text-text-muted hover:text-rose-500 hover:border-rose-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => toggleCompare(product)}
                title={locale === 'ar' ? 'مقارنة المواصفات' : 'Compare product'}
                className={`p-2.5 rounded-full border shadow-md transition-all ${
                  isCompared
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-bg-primary/90 border-border-color text-text-muted hover:text-primary hover:border-primary'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleShare}
                title={locale === 'ar' ? 'مشاركة المنتج' : 'Share'}
                className="p-2.5 rounded-full bg-bg-primary/90 border border-border-color text-text-muted hover:text-primary shadow-md transition-all relative"
              >
                <Share2 className="w-4 h-4" />
                {shareFeedback && (
                  <span className="absolute -bottom-7 start-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                    {locale === 'ar' ? 'تم نسخ الرابط' : 'Link copied!'}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Thumbnails Carousel */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 p-1.5 transition-all bg-bg-secondary/30 ${
                    selectedImage === img
                      ? 'border-primary ring-2 ring-primary/20 scale-95'
                      : 'border-border-color opacity-70 hover:opacity-100 hover:border-text-muted'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Security & Authenticity Guarantee Banner */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-border-color/80 bg-bg-secondary/20 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-text-main">
                  {locale === 'ar' ? 'ضمان أصلي 100%' : '100% Genuine'}
                </p>
                <p className="text-[11px] text-text-muted">
                  {locale === 'ar' ? 'معتمد من الوكيل المباشر' : 'Official certified part'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border-color/80 bg-bg-secondary/20 flex items-center gap-3">
              <RotateCcw className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-text-main">
                  {locale === 'ar' ? 'إرجاع سهل 14 يوم' : '14-Day Returns'}
                </p>
                <p className="text-[11px] text-text-muted">
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
                  <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-bold tracking-wide">
                    {product.brand}
                  </span>
                )}
                <span className="text-text-muted font-mono">SKU: {product.sku}</span>
              </div>

              {/* OEM Number with copy button */}
              <div className="flex items-center gap-1.5 bg-bg-secondary px-2.5 py-1 rounded-lg border border-border-color">
                <span className="text-text-muted font-medium">OEM:</span>
                <span className="font-mono font-bold text-text-main">{product.oemNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyOem}
                  className="p-1 text-text-muted hover:text-primary transition-colors"
                  title={locale === 'ar' ? 'نسخ رقم OEM' : 'Copy OEM'}
                >
                  {copiedOem ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars & Reviews */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-neutral-300'
                    }`}
                  />
                ))}
                <span className="font-bold ms-1 text-text-main text-sm">
                  {product.rating?.toFixed(1) || '4.9'}
                </span>
              </div>
              <span className="text-text-muted">•</span>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="text-primary hover:underline font-medium"
              >
                {product.reviewCount || 48} {locale === 'ar' ? 'تقييم موثق من المشترين' : 'verified reviews'}
              </button>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted">
                {locale === 'ar' ? `تم بيع ${product.soldCount || 84} قطعة` : `${product.soldCount || 84} sold`}
              </span>
            </div>
          </div>

          {/* Vehicle Fitment Alert Box */}
          <div className="rounded-xl border p-4 transition-all bg-bg-primary shadow-sm">
            {activeVehicle ? (
              fitmentStatus ? (
                <div className="flex items-start gap-3 text-emerald-800 bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-sm text-emerald-950">
                      {locale === 'ar' ? 'متوافق تماماً مع سيارتك المحددة' : 'Guaranteed to Fit Your Vehicle'}
                    </p>
                    <p className="mt-0.5 text-emerald-800">
                      {activeVehicle.make} {activeVehicle.model} {activeVehicle.year}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-rose-800 bg-rose-50/70 p-3.5 rounded-lg border border-rose-200">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-sm text-rose-950">
                      {locale === 'ar' ? 'تنبيه: غير متوافق مع سيارتك المحددة' : 'Warning: Does Not Fit Your Vehicle'}
                    </p>
                    <p className="mt-0.5 text-rose-800">
                      {activeVehicle.make} {activeVehicle.model} {activeVehicle.year}
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-between gap-4 flex-wrap bg-primary/5 p-3.5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-main">
                      {locale === 'ar' ? 'تأكد من توافق القطعة مع سيارتك' : 'Check vehicle fitment before buying'}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {locale === 'ar' ? 'حدد الماركة والموديل وسنة الصنع' : 'Select your make, model and year'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openGarageModal}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition-colors"
                >
                  {locale === 'ar' ? 'اختر سيارتك' : 'Select Vehicle'}
                </button>
              </div>
            )}
          </div>

          {/* Pricing & Stock Progress */}
          <div className="p-5 rounded-2xl bg-bg-secondary/40 border border-border-color space-y-4">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
                {formatMoney(product.price, locale)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-text-muted line-through">
                    {formatMoney(product.originalPrice, locale)}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800">
                    {locale === 'ar'
                      ? `وفرت ${formatMoney(product.originalPrice - product.price, locale)}`
                      : `Save ${formatMoney(product.originalPrice - product.price, locale)}`}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-text-muted flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              {locale === 'ar' ? 'الأسعار شاملة ضريبة القيمة المضافة 14%' : 'All prices include 14% VAT'}
            </p>

            {/* Stock Level Progress Indicator */}
            <div className="space-y-1.5 pt-2 border-t border-border-color">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text-main flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {product.stockQuantity > 5
                    ? locale === 'ar'
                      ? 'متوفر في المخزن - جاهز للشحن الفوري'
                      : 'In Stock - Ready for immediate dispatch'
                    : locale === 'ar'
                    ? `متبقي ${product.stockQuantity} قطع فقط!`
                    : `Only ${product.stockQuantity} left in stock!`}
                </span>
                <span className="text-text-muted">
                  {product.availableStock || product.stockQuantity} / 50
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-border-color/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(15, ((product.availableStock || 25) / 50) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quantity Selector, Add to Cart, Buy Now & WhatsApp */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-border-color rounded-xl bg-bg-primary overflow-hidden h-12 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 h-full text-text-muted hover:text-text-main hover:bg-bg-secondary transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-mono font-bold text-sm min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="px-3.5 h-full text-text-muted hover:text-text-main hover:bg-bg-secondary transition-colors"
                  disabled={quantity >= product.stockQuantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4" />
                {t.common.addToCart}
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="h-12 px-5 rounded-xl bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                {t.common.buyNow}
              </button>
            </div>

            {/* Egyptian WhatsApp Direct Ordering Button */}
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Phone className="w-4 h-4" />
              {locale === 'ar' ? 'طلب فوري ومباشر عبر واتساب' : 'Quick Order via WhatsApp'}
            </a>
          </div>

          {/* Multi-Vendor Seller Information Card */}
          {product.merchant && (
            <div className="p-4 rounded-xl border border-border-color bg-bg-secondary/20 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-base">
                  {product.merchant.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-text-main">
                      {product.merchant.storeName || product.merchant.name}
                    </p>
                    <span className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                      ★ {product.merchant.rating || 4.8}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-text-muted" />
                    {product.merchant.addressText}
                  </p>
                </div>
              </div>

              <Link
                href={`/${locale}/shop?vendor=${product.merchant.slug || product.merchant.id}`}
                className="text-xs font-bold text-primary hover:underline"
              >
                {locale === 'ar' ? 'زيارة متجر التاجر' : 'Visit Store'}
              </Link>
            </div>
          )}

          {/* Delivery & Payment Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-muted pt-2 border-t border-border-color">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-primary flex-shrink-0" />
              <span>
                {locale === 'ar'
                  ? 'توصيل فوري خلال 2 إلى 4 ساعات للقاهرة والجيزة'
                  : 'Fast delivery within 2-4 hours in Cairo & Giza'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <BadgeCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
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
      <div className="pt-10 border-t border-border-color space-y-6">
        <div className="flex items-center gap-2 border-b border-border-color overflow-x-auto scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'desc'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {locale === 'ar' ? 'الوصف ومميزات القطعة' : 'Description & Features'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {locale === 'ar' ? 'المواصفات الفنية وأرقام OEM' : 'Technical Specs & OEM'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fitment')}
            className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'fitment'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {locale === 'ar'
              ? `السيارات المتوافقة (${product.compatibilities.length})`
              : `Fitment List (${product.compatibilities.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {locale === 'ar' ? 'الشحن والضمان والاسترجاع' : 'Shipping & Returns'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {locale === 'ar'
              ? `تقييمات المشترين (${product.reviewCount || 48})`
              : `Reviews (${product.reviewCount || 48})`}
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'desc' && (
          <div className="prose prose-sm max-w-none text-text-muted leading-relaxed">
            {product.description ? (
              /* RichEditor (Trix) saves HTML — render it safely */
              <div
                className="rich-content text-text-main"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-text-muted italic text-sm">
                {locale === 'ar' ? 'لا يوجد وصف متاح لهذا المنتج.' : 'No description available for this product.'}
              </p>
            )}
          </div>
        )}

        {/* Tab 2: Specs & OEM */}
        {activeTab === 'specs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-border-color bg-bg-secondary/30">
                <span className="text-text-muted block">{locale === 'ar' ? 'رقم القطعة الأصلي (OEM)' : 'OEM Part Number'}</span>
                <span className="font-mono font-bold text-text-main text-sm mt-0.5 block">{product.oemNumber}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border-color bg-bg-secondary/30">
                <span className="text-text-muted block">{locale === 'ar' ? 'كود المخزن (SKU)' : 'SKU'}</span>
                <span className="font-mono font-bold text-text-main text-sm mt-0.5 block">{product.sku}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border-color bg-bg-secondary/30">
                <span className="text-text-muted block">{locale === 'ar' ? 'الوزن الصافي' : 'Weight'}</span>
                <span className="font-bold text-text-main text-sm mt-0.5 block">{product.weightKg} {locale === 'ar' ? 'كجم' : 'kg'}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border-color bg-bg-secondary/30">
                <span className="text-text-muted block">{locale === 'ar' ? 'الأبعاد (طول × عرض × ارتفاع)' : 'Dimensions (L × W × H)'}</span>
                <span className="font-mono font-bold text-text-main text-sm mt-0.5 block">
                  {product.dimensionsCm.length} × {product.dimensionsCm.width} × {product.dimensionsCm.height} cm
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-border-color bg-bg-secondary/30">
                <span className="text-text-muted block">{locale === 'ar' ? 'الحالة' : 'Condition'}</span>
                <span className="font-bold text-text-main text-sm mt-0.5 block capitalize">{product.condition}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border-color bg-bg-secondary/30">
                <span className="text-text-muted block">{locale === 'ar' ? 'بلد الصنع / الماركة' : 'Brand / Origin'}</span>
                <span className="font-bold text-text-main text-sm mt-0.5 block">{product.brand || 'Original OEM'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Vehicle Compatibility Table */}
        {activeTab === 'fitment' && (
          <div className="space-y-4">
            <p className="text-xs text-text-muted">
              {locale === 'ar'
                ? 'تم فحص ومطابقة هذه القطعة وفقاً لقواعد البيانات الفنية لمصنعي السيارات التالية:'
                : 'This part is fully verified against the technical databases of the following car models:'}
            </p>
            <div className="border border-border-color rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-start">
                <thead className="bg-bg-secondary text-text-main font-bold border-b border-border-color">
                  <tr>
                    <th className="py-3 px-4 text-start">{locale === 'ar' ? 'الماركة' : 'Make'}</th>
                    <th className="py-3 px-4 text-start">{locale === 'ar' ? 'الموديل' : 'Model'}</th>
                    <th className="py-3 px-4 text-start">{locale === 'ar' ? 'سنوات الصنع' : 'Years'}</th>
                    <th className="py-3 px-4 text-start">{locale === 'ar' ? 'حالة التوافق' : 'Fitment Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {product.compatibilities.map((c, i) => (
                    <tr key={i} className="hover:bg-bg-secondary/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-text-main">{c.make}</td>
                      <td className="py-3 px-4">{c.model}</td>
                      <td className="py-3 px-4 font-mono">{c.yearFrom} - {c.yearTo}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {locale === 'ar' ? 'تطابق تام' : '100% Fit'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Shipping & Returns */}
        {activeTab === 'shipping' && (
          <div className="space-y-4 text-xs text-text-muted leading-relaxed">
            <div className="p-4 rounded-xl border border-border-color bg-bg-secondary/20 space-y-2">
              <h4 className="font-bold text-text-main text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                {locale === 'ar' ? 'مواعيد وطرق التوصيل في مصر' : 'Delivery Times & Coverage'}
              </h4>
              <p>
                {locale === 'ar'
                  ? 'يتم تسليم الطلبات داخل القاهرة الكبرى والجيزة خلال ساعتين إلى 4 ساعات عبر كباتن التوصيل السريع. للمحافظات الأخرى، يصل الطلب خلال 24 إلى 48 ساعة كحد أقصى.'
                  : 'Orders within Greater Cairo and Giza are delivered in 2-4 hours. Other Egyptian governorates within 24-48 hours.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border-color bg-bg-secondary/20 space-y-2">
              <h4 className="font-bold text-text-main text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                {locale === 'ar' ? 'سياسة الاستبدال والاسترجاع' : 'Return & Refund Policy'}
              </h4>
              <p>
                {locale === 'ar'
                  ? 'يحق للعميل إرجاع أو استبدال القطعة خلال 14 يوماً من تاريخ الاستلام بشرط أن تكون في حالتها وعبوتها الأصلية غير مستخدمة، مع إمكانية المعاينة قبل الاستلام ودفع الحساب.'
                  : 'You have 14 days to return or replace the item provided it is in original packaging and uninstalled.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl border border-border-color bg-bg-secondary/30 flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-black text-text-main">
                  {product.rating?.toFixed(1) || '4.9'}
                </div>
                <div>
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {locale === 'ar' ? 'بناءً على 48 مشتري موثق' : 'Based on 48 verified buyers'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition-colors"
              >
                {locale === 'ar' ? 'أضف تقييمك وتجربتك' : 'Write a Review'}
              </button>
            </div>

            {/* Mock Reviews List */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border-color bg-bg-primary space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-main">م. طارق عبد الرحمن</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {locale === 'ar' ? 'مشتري موثق' : 'Verified Buyer'}
                    </span>
                  </div>
                  <span className="text-text-muted">منذ أسبوع</span>
                </div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {locale === 'ar'
                    ? 'القطعة ممتازة ومطابقة للمواصفات، والفرامل أصبحت ناعمة جداً وبدون أي صوت. التوصيل كان سريع جداً واستلمت في نفس اليوم.'
                    : 'Excellent genuine part, braking is smooth and noiseless. Delivery was on the same day.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border-color bg-bg-primary space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-main">كريم حسني</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {locale === 'ar' ? 'مشتري موثق' : 'Verified Buyer'}
                    </span>
                  </div>
                  <span className="text-text-muted">منذ أسبوعين</span>
                </div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {locale === 'ar'
                    ? 'تغليف سليم وكرتونة أصلية برقم الباركود ورقم الـ OEM مطابق للقطعة القديمة التي فككتها من السيارة. شكراً على المصداقية.'
                    : 'Original box with barcode and OEM matching my old part exactly. Highly recommended.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Products Carousel / Grid */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-border-color space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-text-main">
                {locale === 'ar' ? 'قطع غيار يشتريها العملاء أيضاً' : 'Related & Recommended Parts'}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                {locale === 'ar' ? 'قطع متوافقة ومكملة لهذه المنظومة' : 'Frequently bought together'}
              </p>
            </div>
            <Link
              href={`/${locale}/shop?category=${product.categorySlug || 'brakes'}`}
              className="text-xs font-bold text-primary hover:underline"
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
        <div className="fixed bottom-0 start-0 end-0 z-40 bg-bg-primary/95 backdrop-blur-md border-t border-border-color shadow-2xl py-3 px-4 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={product.thumbnail}
                alt=""
                className="w-12 h-12 rounded-lg object-contain bg-bg-secondary p-1 border border-border-color flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-text-main truncate max-w-[200px] sm:max-w-sm">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-extrabold text-primary">
                    {formatMoney(product.price, locale)}
                  </span>
                  <span className="text-[10px] text-text-muted font-mono hidden sm:inline">
                    OEM: {product.oemNumber}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden sm:flex items-center border border-border-color rounded-lg bg-bg-secondary h-9">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2 text-text-muted hover:text-text-main"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono font-bold text-xs">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="px-2 text-text-muted hover:text-text-main"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="h-10 px-4 sm:px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t.common.addToCart}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
