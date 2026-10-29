import { z } from 'zod';

export const LocalizedTextSchema = z.object({
  ar: z.string(),
  en: z.string(),
});

export const BrandConfigSchema = z.object({
  name: LocalizedTextSchema,
  tagline: LocalizedTextSchema.optional(),
  logo: z.object({
    light: z.string(),
    dark: z.string().optional(),
    alt: LocalizedTextSchema.optional(),
  }),
  favicon: z.string(),
});

export const LocalesConfigSchema = z.object({
  default: z.enum(['ar', 'en']),
  supported: z.array(z.enum(['ar', 'en'])),
});

export const CurrencyConfigSchema = z.object({
  default: z.literal('EGP'),
  supported: z.array(z.literal('EGP')),
  useWesternDigits: z.boolean().default(true),
});

export const ThemeColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  surface: z.string(),
  text: z.string(),
  success: z.string(),
  danger: z.string(),
});

export const ThemeConfigSchema = z.object({
  preset: z.enum(['default', 'electric-blue', 'emerald-speed', 'monochrome-luxe']),
  colors: ThemeColorsSchema.partial().optional(),
  radius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md'),
  font: z.object({
    ar: z.string().default('Cairo'),
    en: z.string().default('Inter'),
  }),
  darkMode: z.enum(['off', 'on', 'system']).default('system'),
});

export const HeaderConfigSchema = z.object({
  variant: z.enum(['default', 'compact', 'centered']).default('default'),
  showTopBar: z.boolean().default(true),
  showVehicleFinder: z.boolean().default(true),
  showLangSwitcher: z.boolean().default(true),
  showCurrencySwitcher: z.boolean().default(false),
  topBarContacts: z.object({
    phone: z.string(),
    email: z.string(),
    whatsapp: z.string().optional(),
  }),
});

export type MenuItem = {
  id: string;
  title: z.infer<typeof LocalizedTextSchema>;
  href: string;
  badge?: {
    text: z.infer<typeof LocalizedTextSchema>;
    color: 'red' | 'green' | 'amber' | 'blue';
  };
  children?: MenuItem[];
};

export const MenuItemSchema: z.ZodType<MenuItem> = z.lazy(() =>
  z.object({
    id: z.string(),
    title: LocalizedTextSchema,
    href: z.string(),
    badge: z
      .object({
        text: LocalizedTextSchema,
        color: z.enum(['red', 'green', 'amber', 'blue']),
      })
      .optional(),
    children: z.array(MenuItemSchema).optional(),
  })
);

export const MenusConfigSchema = z.object({
  main: z.array(MenuItemSchema),
  categories: z.object({
    source: z.enum(['backend', 'config']),
    items: z.array(MenuItemSchema).optional(),
  }),
  footer: z.array(
    z.object({
      title: LocalizedTextSchema,
      items: z.array(
        z.object({
          label: LocalizedTextSchema,
          href: z.string(),
        })
      ),
    })
  ),
});

export const HomeSectionTypeSchema = z.enum([
  'hero',
  'top-offers',
  'featured-categories-tabs',
  'promo-banners-row',
  'latest-deals-stock-progress',
  'coupon-strip',
  'wide-banner-product-row',
  'flash-deal-countdown',
  'category-tiles-grid',
  'testimonials',
  'blog-teaser',
  'partner-brands-row',
  'newsletter',
]);

export const HomeSectionSchema = z.object({
  id: z.string(),
  type: HomeSectionTypeSchema,
  enabled: z.boolean().default(true),
  order: z.number().default(0),
  props: z.record(z.any()).default({}),
});

export const ShopConfigSchema = z.object({
  layout: z.enum(['left-sidebar', 'right-sidebar', 'wide', 'top-filters']).default('left-sidebar'),
  view: z.enum(['grid', 'list']).default('grid'),
  columns: z.number().min(2).max(6).default(4),
  perPage: z.number().default(12),
  pagination: z.enum(['pages', 'load-more', 'infinite']).default('load-more'),
  card: z.object({
    showSku: z.boolean().default(true),
    showAttributes: z.boolean().default(false),
    showSwatches: z.boolean().default(true),
    showQuickView: z.boolean().default(true),
    showCompare: z.boolean().default(true),
    showStockProgress: z.boolean().default(false),
  }),
  catalogMode: z.boolean().default(false),
});

export const ProductConfigSchema = z.object({
  layout: z.enum(['default', 'wide', 'thumbs-left', 'gallery-1col', 'gallery-2col', 'carousel-2col']).default('default'),
  tabs: z.enum(['tabs', 'accordion', 'vertical']).default('tabs'),
  features: z.object({
    buyNow: z.boolean().default(true),
    stickyAddToCart: z.boolean().default(true),
    orderOnWhatsapp: z.boolean().default(true),
    lowStockAlert: z.boolean().default(true),
    zoom: z.boolean().default(true),
    reviewsOutsideTabs: z.boolean().default(false),
  }),
});

export const FeaturesToggleSchema = z.object({
  wishlist: z.boolean().default(true),
  compare: z.boolean().default(true),
  vinSearch: z.boolean().default(true),
  garage: z.boolean().default(true),
  vendors: z.boolean().default(true),
  repTracking: z.boolean().default(true),
  blog: z.boolean().default(true),
  newsletter: z.boolean().default(true),
  pwa: z.boolean().default(true),
});

export const CheckoutConfigSchema = z.object({
  paymentMethods: z.array(z.enum(['cod', 'card', 'wallet'])).default(['cod']),
  guestCheckout: z.boolean().default(true),
  phoneFormat: z.literal('EG').default('EG'),
  defaultDeliveryFeePerMerchant: z.number().default(45),
  platformServiceFeePerOrder: z.number().default(15),
});

export const SeoConfigSchema = z.object({
  titleTemplate: z.string().default('%s | Otlob Auto Parts'),
  defaultTitle: LocalizedTextSchema,
  defaultDescription: LocalizedTextSchema,
  defaultOgImage: z.string().default('/images/og-default.jpg'),
});

export const SiteConfigSchema = z.object({
  brand: BrandConfigSchema,
  locales: LocalesConfigSchema,
  currency: CurrencyConfigSchema,
  theme: ThemeConfigSchema,
  header: HeaderConfigSchema,
  menus: MenusConfigSchema,
  home: z.object({
    sections: z.array(HomeSectionSchema),
  }),
  shop: ShopConfigSchema,
  product: ProductConfigSchema,
  features: FeaturesToggleSchema,
  checkout: CheckoutConfigSchema,
  seo: SeoConfigSchema,
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type HomeSection = z.infer<typeof HomeSectionSchema>;
export type HomeSectionType = z.infer<typeof HomeSectionTypeSchema>;
