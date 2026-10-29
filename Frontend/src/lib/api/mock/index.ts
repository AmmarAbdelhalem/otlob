import {
  ICatalogService,
  ISearchService,
  IVehicleService,
  ICheckoutService,
  IOrderService,
  ITrackingService,
  IVendorService,
  IContentService,
  CatalogFilterParams,
  PaginatedResult,
} from '../services';
import {
  mockProducts,
  mockCategories,
  mockMakes,
  mockModelsByMake,
  mockBrands,
  mockVendors,
} from './data';
import {
  Brand,
  Category,
  CustomerVehicle,
  OrderRecord,
  PaymentType,
  Product,
  TrackingInfo,
  VehicleMake,
  VehicleModel,
  Vendor,
} from '../types';

export class MockCatalogService implements ICatalogService {
  async searchProducts(params: CatalogFilterParams): Promise<PaginatedResult<Product>> {
    let list = [...mockProducts];

    if (params.q) {
      const q = params.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.oemNumber.toLowerCase().includes(q)
      );
    }

    if (params.category) {
      list = list.filter((p) => p.categorySlug === params.category);
    }

    if (params.brand) {
      list = list.filter((p) => p.brand?.toLowerCase() === params.brand?.toLowerCase());
    }

    if (params.vendor) {
      list = list.filter((p) => p.merchantId === params.vendor || p.merchant?.slug === params.vendor);
    }

    if (params.make && params.model) {
      const mk = params.make.toLowerCase();
      const md = params.model.toLowerCase();
      const yr = params.year;

      list = list.filter((p) =>
        p.compatibilities.some((c) => {
          const match = c.make.toLowerCase() === mk && c.model.toLowerCase() === md;
          if (!match) return false;
          if (yr) return yr >= c.yearFrom && yr <= c.yearTo;
          return true;
        })
      );
    }

    if (params.oemNumber) {
      list = list.filter((p) => p.oemNumber.toLowerCase() === params.oemNumber?.toLowerCase());
    }

    if (params.sku) {
      list = list.filter((p) => p.sku.toLowerCase() === params.sku?.toLowerCase());
    }

    if (params.minPrice) {
      list = list.filter((p) => p.price >= (params.minPrice || 0));
    }

    if (params.maxPrice) {
      list = list.filter((p) => p.price <= (params.maxPrice || Infinity));
    }

    if (params.sortBy) {
      if (params.sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
      if (params.sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
      if (params.sortBy === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      if (params.sortBy === 'popularity') list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    const page = params.page || 1;
    const perPage = params.perPage || 12;
    const total = list.length;
    const start = (page - 1) * perPage;
    const paginated = list.slice(start, start + perPage);

    return {
      data: paginated,
      meta: {
        currentPage: page,
        lastPage: Math.ceil(total / perPage) || 1,
        perPage,
        total,
      },
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    return mockProducts.find((p) => p.id === id) || null;
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    return mockProducts.find((p) => p.sku.toLowerCase() === sku.toLowerCase()) || null;
  }

  async getCategories(): Promise<Category[]> {
    return mockCategories;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return mockCategories.find((c) => c.slug === slug) || null;
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    return mockProducts.slice(0, limit);
  }

  async getDeals(limit = 6): Promise<Product[]> {
    return mockProducts.filter((p) => (p.discountPercentage || 0) > 0).slice(0, limit);
  }

  async getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
    return mockProducts.filter((p) => p.id !== productId).slice(0, limit);
  }

  async getBrands(): Promise<Brand[]> {
    return mockBrands;
  }
}

export class MockSearchService implements ISearchService {
  async liveSearch(query: string, limit = 6): Promise<{ products: Product[]; categories: Category[] }> {
    const q = query.trim().toLowerCase();
    if (!q) return { products: [], categories: [] };

    const products = mockProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.oemNumber.toLowerCase().includes(q)
      )
      .slice(0, limit);

    const categories = mockCategories
      .filter(
        (c) =>
          c.name.ar.toLowerCase().includes(q) ||
          c.name.en.toLowerCase().includes(q)
      )
      .slice(0, 3);

    return { products, categories };
  }

  async findByPartNumber(partNumber: string): Promise<Product[]> {
    const clean = partNumber.trim().toLowerCase();
    return mockProducts.filter(
      (p) => p.oemNumber.toLowerCase().includes(clean) || p.sku.toLowerCase().includes(clean)
    );
  }

  async findByVin(vin: string): Promise<{ vehicle: Partial<CustomerVehicle> | null; products: Product[] }> {
    const clean = vin.trim().toUpperCase();
    if (clean.length < 3) return { vehicle: null, products: [] };

    let make = 'Toyota';
    let model = 'Corolla';
    let year = 2020;

    if (clean.startsWith('KMH')) {
      make = 'Hyundai';
      model = 'Elantra HD';
      year = 2018;
    } else if (clean.startsWith('JN1')) {
      make = 'Nissan';
      model = 'Sunny N17';
      year = 2019;
    } else if (clean.startsWith('ZFA')) {
      make = 'Fiat';
      model = 'Tipo';
      year = 2021;
    }

    const vehicle: Partial<CustomerVehicle> = { make, model, year, vin: clean };
    const products = mockProducts.filter((p) =>
      p.compatibilities.some(
        (c) => c.make.toLowerCase() === make.toLowerCase() && c.model.toLowerCase() === model.toLowerCase()
      )
    );

    return { vehicle, products };
  }
}

export class MockVehicleService implements IVehicleService {
  async getMakes(): Promise<VehicleMake[]> {
    return mockMakes;
  }

  async getModels(makeIdOrName: string): Promise<VehicleModel[]> {
    const key = makeIdOrName.trim().toLowerCase();
    const names = mockModelsByMake[key] || ['Standard Model'];
    return names.map((name, idx) => ({
      id: `${key}-${idx}`,
      makeId: key,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }));
  }

  async getYears(make: string, model: string): Promise<number[]> {
    const currentYear = new Date().getFullYear() + 1;
    const years: number[] = [];
    for (let y = currentYear; y >= 2005; y--) {
      years.push(y);
    }
    return years;
  }

  async resolveByVin(vin: string): Promise<Partial<CustomerVehicle> | null> {
    const clean = vin.trim().toUpperCase();
    if (clean.length !== 17) return null;

    if (clean.startsWith('JT')) return { make: 'Toyota', model: 'Corolla', year: 2020, vin: clean };
    if (clean.startsWith('KMH')) return { make: 'Hyundai', model: 'Elantra HD', year: 2018, vin: clean };
    if (clean.startsWith('JN1')) return { make: 'Nissan', model: 'Sunny N17', year: 2019, vin: clean };
    if (clean.startsWith('ZFA')) return { make: 'Fiat', model: 'Tipo', year: 2021, vin: clean };

    return { make: 'Toyota', model: 'Corolla', year: 2020, vin: clean };
  }

  async getCustomerVehicles(): Promise<CustomerVehicle[]> {
    return [];
  }

  async addCustomerVehicle(data: Omit<CustomerVehicle, 'id'>): Promise<CustomerVehicle> {
    return {
      ...data,
      id: `veh-${Date.now()}`,
    };
  }
}

export class MockCheckoutService implements ICheckoutService {
  async checkout(payload: {
    items: Array<{ productId: string; quantity: number }>;
    deliveryLat: number;
    deliveryLng: number;
    paymentType: PaymentType;
  }): Promise<OrderRecord> {
    const orderId = `ord-${Date.now()}`;
    const orderCode = `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    let subtotal = 0;
    const subOrders = mockVendors.map((vendor, idx) => {
      const vendorItems = payload.items.slice(idx, idx + 1);
      const subtotalSub = 950;
      subtotal += subtotalSub;

      return {
        id: `sub-${orderId}-${idx}`,
        parentId: orderId,
        orderCode: `${orderCode}-SUB-${idx + 1}`,
        merchantId: vendor.id,
        merchant: vendor,
        subtotal: subtotalSub,
        deliveryFee: 45,
        serviceFee: 15,
        totalAmount: subtotalSub + 45 + 15,
        orderStatus: 'pending' as const,
        deliveryOtp: String(Math.floor(100000 + Math.random() * 900000)),
        items: vendorItems.map((it) => ({
          id: `item-${it.productId}`,
          orderId: `sub-${orderId}-${idx}`,
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: 950,
          totalPrice: 950 * it.quantity,
        })),
      };
    });

    return {
      id: orderId,
      orderCode,
      customerId: 'guest-customer-id',
      subtotal,
      deliveryFee: 45 * subOrders.length,
      serviceFee: 15 * subOrders.length,
      totalAmount: subtotal + 60 * subOrders.length,
      paymentType: payload.paymentType,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      deliveryLat: payload.deliveryLat,
      deliveryLng: payload.deliveryLng,
      subOrders,
      createdAt: new Date().toISOString(),
    };
  }
}

export class MockOrderService implements IOrderService {
  async getOrders(page = 1): Promise<PaginatedResult<OrderRecord>> {
    return {
      data: [],
      meta: {
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
      },
    };
  }

  async getOrderById(id: string): Promise<OrderRecord | null> {
    const list = await this.getOrders();
    return list.data[0] || null;
  }

  async trackOrder(orderIdOrCode: string): Promise<TrackingInfo | null> {
    return {
      orderCode: orderIdOrCode.startsWith('ORD-') ? orderIdOrCode : 'ORD-EG849201',
      status: 'in_transit',
      statusLabel: 'في الطريق إليك',
      courier: {
        name: 'كابتن محمود حسن',
        phone: '01234567890',
        vehicleType: 'motorcycle',
        livePosition: {
          latitude: 30.0521,
          longitude: 31.2389,
        },
      },
      pickupLocation: {
        latitude: 30.0812,
        longitude: 31.2489,
      },
      deliveryLocation: {
        latitude: 30.0444,
        longitude: 31.2357,
      },
      updatedAt: new Date().toISOString(),
    };
  }
}

export class MockTrackingService implements ITrackingService {
  async getRepLocation(orderId: string): Promise<TrackingInfo | null> {
    return new MockOrderService().trackOrder(orderId);
  }
}

export class MockVendorService implements IVendorService {
  async getVendors(limit = 6): Promise<Vendor[]> {
    return mockVendors.slice(0, limit);
  }

  async getVendorBySlug(slug: string): Promise<Vendor | null> {
    return mockVendors.find((v) => v.slug === slug) || null;
  }

  async getVendorProducts(vendorId: string, page = 1): Promise<PaginatedResult<Product>> {
    const items = mockProducts.filter((p) => p.merchantId === vendorId || p.merchant?.id === vendorId);
    return {
      data: items,
      meta: {
        currentPage: page,
        lastPage: 1,
        perPage: 12,
        total: items.length,
      },
    };
  }
}

export class MockContentService implements IContentService {
  async getHeroSlides() {
    return [
      {
        id: 'slide-1',
        eyebrow: { ar: 'خصومات الموسم لقطع الغيار', en: 'Seasonal Spare Parts Deals' },
        headline: { ar: 'تيل فرامل وطنابير أصلية بخصم 25%', en: 'Original Brake Pads & Rotors 25% Off' },
        shortText: { ar: 'متوافق مع تويوتا، نيسان، هيونداي وكيا، مع ضمان استرجاع 14 يوم ودفع عند الاستلام.', en: 'Compatible with Toyota, Nissan, Hyundai, and Kia with 14-day warranty.' },
        price: 950,
        originalPrice: 1250,
        ctaText: { ar: 'تسوق عروض الفرامل', en: 'Shop Brakes Deals' },
        ctaLink: '/shop?category=brakes',
        image: '/images/hero/hero-brakes.svg',
      },
      {
        id: 'slide-2',
        eyebrow: { ar: 'توصيل فوري خلال ساعتين', en: 'Express Delivery in 2 Hours' },
        headline: { ar: 'مساعدين وعفشة ياباني وألماني', en: 'Japanese & German Shocks & Suspension' },
        shortText: { ar: 'راحة وثبات على جميع الطرق المصرية، اطلب قطعتك وتتبع المندوب لحظياً على الخريطة.', en: 'Maximum comfort and stability. Track your courier live on map.' },
        price: 3100,
        originalPrice: 3800,
        ctaText: { ar: 'اكتشف العفشة والمساعدين', en: 'Discover Suspension' },
        ctaLink: '/shop?category=suspension',
        image: '/images/hero/hero-suspension.svg',
      },
    ];
  }

  async getPromoBanners() {
    return [
      {
        id: 'banner-1',
        title: { ar: 'فلاتر وسوائل المحرك', en: 'Engine Filters & Oils' },
        subtitle: { ar: 'وفر حتى 30% على الباقات', en: 'Save up to 30% on Bundles' },
        link: '/shop?category=engine',
        image: '/images/banners/banner-filters.svg',
      },
      {
        id: 'banner-2',
        title: { ar: 'بوجيهات ليزر إيريديوم', en: 'Iridium Laser Spark Plugs' },
        subtitle: { ar: 'توفير وقود وعزم محرك فائق', en: 'Better Fuel Economy & Power' },
        link: '/shop?category=spark-plugs',
        image: '/images/banners/banner-spark.svg',
      },
    ];
  }

  async getTestimonials() {
    return [
      {
        id: 't-1',
        name: 'م. طارق عبد الرحمن',
        car: 'تويوتا كورولا 2021',
        text: 'طلبت تيل فرامل وبوجيهات وصلوا خلال 3 ساعات بالظبط وتابعت الكابتن على الخريطة لحد ما وصل للورشة. والقطع أصلية 100%.',
        rating: 5,
      },
      {
        id: 't-2',
        name: 'أحمد نبيل',
        car: 'هيونداي إلنترا HD',
        text: 'ميزة البحث برقم الشاسيه سهلت عليا جداً اختيار القطع المتوافقة بدون ما أقلق تطلع مش مناسبة. خدمة عملاء محترمة.',
        rating: 5,
      },
    ];
  }

  async getBlogTeasers() {
    return [
      {
        id: 'b-1',
        title: { ar: 'كيف تعرف أن تيل الفرامل بحاجة للتغيير فوراً؟', en: 'How to Know Your Brake Pads Need Immediate Replacement' },
        category: { ar: 'صيانة الفرامل', en: 'Brake Care' },
        date: '2026-10-15',
        author: 'فريق صيانة اطلب',
        commentsCount: 18,
        slug: 'when-to-replace-brake-pads',
        image: '/images/blog/blog-brakes.svg',
      },
      {
        id: 'b-2',
        title: { ar: 'الفرق بين شمعات الإشعال العادية وبوجيهات الإيريديوم', en: 'Difference Between Standard & Iridium Spark Plugs' },
        category: { ar: 'نصائح ميكانيكا', en: 'Engine Tips' },
        date: '2026-10-20',
        author: 'م. كريم صبحي',
        commentsCount: 24,
        slug: 'spark-plugs-guide',
        image: '/images/blog/blog-spark.svg',
      },
    ];
  }
}
