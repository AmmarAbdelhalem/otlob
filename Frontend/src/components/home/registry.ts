import React from 'react';
import { HomeSectionType, Locale } from '@/lib/api/types';
import { HeroSliderSection } from './sections/HeroSliderSection';
import { TopOffersStripSection } from './sections/TopOffersStripSection';
import { FeaturedCategoryTabsSection } from './sections/FeaturedCategoryTabsSection';
import { PromoBannersSection } from './sections/PromoBannersSection';
import { LatestDealsProgressSection } from './sections/LatestDealsProgressSection';
import { CouponStripSection } from './sections/CouponStripSection';
import { WideBannerProductRowSection } from './sections/WideBannerProductRowSection';
import { FlashDealCountdownSection } from './sections/FlashDealCountdownSection';
import { CategoryTilesGridSection } from './sections/CategoryTilesGridSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { BlogTeaserSection } from './sections/BlogTeaserSection';
import { PartnerBrandsSection } from './sections/PartnerBrandsSection';
import { NewsletterSection } from './sections/NewsletterSection';

export interface SectionComponentProps {
  locale: Locale;
  props?: Record<string, any>;
}

export const homeSectionRegistry: Record<
  string,
  React.ComponentType<SectionComponentProps>
> = {
  hero: HeroSliderSection,
  'top-offers': TopOffersStripSection,
  'featured-categories-tabs': FeaturedCategoryTabsSection,
  'promo-banners-row': PromoBannersSection,
  'latest-deals-stock-progress': LatestDealsProgressSection,
  'coupon-strip': CouponStripSection,
  'wide-banner-product-row': WideBannerProductRowSection,
  'flash-deal-countdown': FlashDealCountdownSection,
  'category-tiles-grid': CategoryTilesGridSection,
  testimonials: TestimonialsSection,
  'blog-teaser': BlogTeaserSection,
  'partner-brands-row': PartnerBrandsSection,
  newsletter: NewsletterSection,
};
