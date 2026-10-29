import { SiteConfig } from './schema';

export const siteConfig: SiteConfig = {
  brand: {
    name: {
      ar: 'اطلب لقطع الغيار',
      en: 'Otlob Auto Parts',
    },
    tagline: {
      ar: 'أكبر سوق لقطع غيار السيارات في مصر',
      en: 'Egypt\'s Premier Multi-Vendor Auto Spare Parts Marketplace',
    },
    logo: {
      light: '/images/logo-light.svg',
      dark: '/images/logo-dark.svg',
      alt: {
        ar: 'اطلب لقطع غيار السيارات',
        en: 'Otlob Auto Parts Marketplace',
      },
    },
    favicon: '/favicon.ico',
  },
  locales: {
    default: 'ar',
    supported: ['ar', 'en'],
  },
  currency: {
    default: 'EGP',
    supported: ['EGP'],
    useWesternDigits: true,
  },
  theme: {
    preset: 'default',
    radius: 'md',
    font: {
      ar: 'Cairo',
      en: 'Inter',
    },
    darkMode: 'system',
  },
  header: {
    variant: 'default',
    showTopBar: true,
    showVehicleFinder: true,
    showLangSwitcher: true,
    showCurrencySwitcher: false,
    topBarContacts: {
      phone: '19876',
      email: 'support@otlob-parts.com',
      whatsapp: '+201012345678',
    },
  },
  menus: {
    main: [
      {
        id: 'home',
        title: { ar: 'الرئيسية', en: 'Home' },
        href: '/',
      },
      {
        id: 'shop',
        title: { ar: 'المتجر', en: 'Shop' },
        href: '/shop',
        badge: {
          text: { ar: 'خصومات', en: 'Sale' },
          color: 'red',
        },
      },
      {
        id: 'brands',
        title: { ar: 'الماركات', en: 'Brands' },
        href: '/brands',
      },
      {
        id: 'vendors',
        title: { ar: 'التجار والمحلات', en: 'Vendors' },
        href: '/vendors',
      },
      {
        id: 'order-tracking',
        title: { ar: 'تتبع طلبك', en: 'Order Tracking' },
        href: '/order-tracking',
      },
      {
        id: 'contact',
        title: { ar: 'اتصل بنا', en: 'Contact' },
        href: '/contact',
      },
    ],
    categories: {
      source: 'backend',
      items: [
        {
          id: 'cat-brakes',
          title: { ar: 'منظومة الفرامل', en: 'Braking Systems' },
          href: '/shop?category=brakes',
          children: [
            { id: 'cat-pads', title: { ar: 'تيل فرامل (أمامي / خلفي)', en: 'Brake Pads' }, href: '/shop?category=brake-pads' },
            { id: 'cat-discs', title: { ar: 'طنابير ديسكات', en: 'Brake Rotors & Discs' }, href: '/shop?category=brake-discs' },
            { id: 'cat-calipers', title: { ar: 'ماستر وكليبر فرامل', en: 'Master Cylinders & Calipers' }, href: '/shop?category=brake-calipers' },
          ],
        },
        {
          id: 'cat-engine',
          title: { ar: 'المحرك وملحقاته', en: 'Engine & Transmission' },
          href: '/shop?category=engine',
          children: [
            { id: 'cat-filters', title: { ar: 'فلاتر (زيت، هواء، بنزين)', en: 'Filters (Oil, Air, Fuel)' }, href: '/shop?category=filters' },
            { id: 'cat-belts', title: { ar: 'سيور وكاتينات', en: 'Timing Belts & Pulleys' }, href: '/shop?category=belts' },
            { id: 'cat-spark', title: { ar: 'بوجيهات وشمعات إشعال', en: 'Spark Plugs' }, href: '/shop?category=spark-plugs' },
          ],
        },
        {
          id: 'cat-suspension',
          title: { ar: 'العفشة والمساعدين', en: 'Suspension & Steering' },
          href: '/shop?category=suspension',
          children: [
            { id: 'cat-shocks', title: { ar: 'مساعدين أمامي وخلفي', en: 'Shock Absorbers' }, href: '/shop?category=shocks' },
            { id: 'cat-arms', title: { ar: 'مقصات وبيض مقص', en: 'Control Arms & Ball Joints' }, href: '/shop?category=arms' },
            { id: 'cat-steering', title: { ar: 'علبة دركسيون وبارات', en: 'Steering Racks' }, href: '/shop?category=steering' },
          ],
        },
        {
          id: 'cat-electrical',
          title: { ar: 'الكهرباء والإضاءة', en: 'Electrical & Lighting' },
          href: '/shop?category=electrical',
          children: [
            { id: 'cat-lights', title: { ar: 'فوانيس وإضاءة وفوجات', en: 'Headlights & Fog Lamps' }, href: '/shop?category=lights' },
            { id: 'cat-batteries', title: { ar: 'بطاريات ودينامو ومارش', en: 'Batteries & Alternators' }, href: '/shop?category=batteries' },
          ],
        },
        {
          id: 'cat-body',
          title: { ar: 'الهيكل والصاج والإكسسوار', en: 'Body Parts & Mirrors' },
          href: '/shop?category=body',
          children: [
            { id: 'cat-bumpers', title: { ar: 'إكصدامات وشبكات', en: 'Bumpers & Grilles' }, href: '/shop?category=bumpers' },
            { id: 'cat-mirrors', title: { ar: 'مرايات وزجاج جانبي', en: 'Side Mirrors' }, href: '/shop?category=mirrors' },
          ],
        },
      ],
    },
    footer: [
      {
        title: { ar: 'خدمة العملاء', en: 'Customer Care' },
        items: [
          { label: { ar: 'تتبع طلبك', en: 'Track Your Order' }, href: '/order-tracking' },
          { label: { ar: 'سياسة الاستبدال والاسترجاع', en: 'Return & Refund Policy' }, href: '/policies/refund' },
          { label: { ar: 'الشحن والتوصيل', en: 'Shipping & Delivery' }, href: '/policies/shipping' },
          { label: { ar: 'الأسئلة الشائعة', en: 'FAQs' }, href: '/faq' },
        ],
      },
      {
        title: { ar: 'عن اطلب', en: 'About Otlob' },
        items: [
          { label: { ar: 'من نحن', en: 'About Us' }, href: '/about-us' },
          { label: { ar: 'انضم كبائع / تاجر', en: 'Sell on Otlob' }, href: '/auth/register?role=merchant' },
          { label: { ar: 'انضم كمندوب توصيل', en: 'Become a Courier' }, href: '/auth/register?role=courier' },
          { label: { ar: 'الشروط والأحكام', en: 'Terms & Conditions' }, href: '/policies/terms' },
        ],
      },
      {
        title: { ar: 'أقسام شائعة', en: 'Popular Categories' },
        items: [
          { label: { ar: 'تيل وفرامل', en: 'Brakes & Pads' }, href: '/shop?category=brakes' },
          { label: { ar: 'فلاتر وسوائل', en: 'Filters & Fluids' }, href: '/shop?category=filters' },
          { label: { ar: 'مساعدين وعفشة', en: 'Suspension & Shocks' }, href: '/shop?category=suspension' },
          { label: { ar: 'بوجيهات وكهرباء', en: 'Spark Plugs & Electrical' }, href: '/shop?category=electrical' },
        ],
      },
    ],
  },
  home: {
    sections: [
      { id: 'sec-hero', type: 'hero', enabled: true, order: 1, props: {} },
      { id: 'sec-top-offers', type: 'top-offers', enabled: true, order: 2, props: {} },
      { id: 'sec-featured-tabs', type: 'featured-categories-tabs', enabled: true, order: 3, props: {} },
      { id: 'sec-promo-banners', type: 'promo-banners-row', enabled: true, order: 4, props: {} },
      { id: 'sec-latest-deals', type: 'latest-deals-stock-progress', enabled: true, order: 5, props: {} },
      { id: 'sec-coupon-strip', type: 'coupon-strip', enabled: true, order: 6, props: {} },
      { id: 'sec-wide-banner', type: 'wide-banner-product-row', enabled: true, order: 7, props: {} },
      { id: 'sec-flash-deal', type: 'flash-deal-countdown', enabled: true, order: 8, props: {} },
      { id: 'sec-category-tiles', type: 'category-tiles-grid', enabled: true, order: 9, props: {} },
      { id: 'sec-testimonials', type: 'testimonials', enabled: true, order: 10, props: {} },
      { id: 'sec-blog-teaser', type: 'blog-teaser', enabled: true, order: 11, props: {} },
      { id: 'sec-partner-brands', type: 'partner-brands-row', enabled: true, order: 12, props: {} },
      { id: 'sec-newsletter', type: 'newsletter', enabled: true, order: 13, props: {} },
    ],
  },
  shop: {
    layout: 'left-sidebar',
    view: 'grid',
    columns: 4,
    perPage: 12,
    pagination: 'load-more',
    card: {
      showSku: true,
      showAttributes: false,
      showSwatches: true,
      showQuickView: true,
      showCompare: true,
      showStockProgress: true,
    },
    catalogMode: false,
  },
  product: {
    layout: 'default',
    tabs: 'tabs',
    features: {
      buyNow: true,
      stickyAddToCart: true,
      orderOnWhatsapp: true,
      lowStockAlert: true,
      zoom: true,
      reviewsOutsideTabs: false,
    },
  },
  features: {
    wishlist: true,
    compare: true,
    vinSearch: true,
    garage: true,
    vendors: true,
    repTracking: true,
    blog: true,
    newsletter: true,
    pwa: true,
  },
  checkout: {
    paymentMethods: ['cod'],
    guestCheckout: true,
    phoneFormat: 'EG',
    defaultDeliveryFeePerMerchant: 45,
    platformServiceFeePerOrder: 15,
  },
  seo: {
    titleTemplate: '%s | اطلب - سوق قطع غيار السيارات',
    defaultTitle: {
      ar: 'اطلب | قطع غيار سيارات أصلية وتجارية لجميع الماركات في مصر',
      en: 'Otlob | Genuine & Aftermarket Auto Parts Marketplace in Egypt',
    },
    defaultDescription: {
      ar: 'تسوق قطع غيار سيارات في مصر بضمان وأفضل الأسعار، دفع عند الاستلام وتوصيل سريع وتتبع فوري للمندوب على الخريطة.',
      en: 'Shop auto spare parts in Egypt at unbeatable prices with Cash on Delivery, fast delivery, and real-time live map courier tracking.',
    },
    defaultOgImage: '/images/og-storefront.jpg',
  },
};
