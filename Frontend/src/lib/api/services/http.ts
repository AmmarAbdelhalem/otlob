import { apiClient } from '../client';
import {
  CatalogFilterParams,
  ICatalogService,
  ICheckoutService,
  IOrderService,
  ISearchService,
  ITrackingService,
  IVehicleService,
  IVendorService,
  PaginatedResult,
} from './index';
import {
  CustomerVehicle,
  OrderRecord,
  PaymentType,
  Product,
  TrackingInfo,
  VehicleMake,
  VehicleModel,
  Vendor,
} from '../types';
import {
  MockCatalogService,
  MockOrderService,
  MockSearchService,
  MockVehicleService,
  MockVendorService,
} from '../mock';

/**
 * Mapper: transforms raw Laravel Product model into domain Product type
 */
export function mapBackendProduct(raw: any): Product {
  const compats = Array.isArray(raw.compatibilities)
    ? raw.compatibilities.map((c: any) => ({
        id: c.id,
        productId: c.product_id,
        make: c.make,
        model: c.model,
        yearFrom: Number(c.year_from),
        yearTo: Number(c.year_to),
      }))
    : [];

  return {
    id: raw.id,
    merchantId: raw.merchant_id,
    name: raw.name,
    sku: raw.sku,
    oemNumber: raw.oem_number,
    description: raw.description || '',
    price: parseFloat(raw.price) || 0,
    stockQuantity: Number(raw.stock_quantity) || 0,
    availableStock: Number(raw.stock_quantity) || 0,
    weightKg: parseFloat(raw.weight_kg) || 0,
    dimensionsCm: {
      length: parseFloat(raw.length_cm) || 0,
      width: parseFloat(raw.width_cm) || 0,
      height: parseFloat(raw.height_cm) || 0,
    },
    condition: raw.condition || 'new',
    isActive: Boolean(raw.is_active),
    images: ['/images/products/brake-pads.svg'],
    thumbnail: '/images/products/brake-pads.svg',
    categorySlug: 'brakes',
    merchant: raw.merchant
      ? {
          id: raw.merchant.id,
          name: raw.merchant.store_name,
          storeName: raw.merchant.store_name,
          slug: raw.merchant.id,
          addressText: raw.merchant.address_text || '',
          latitude: parseFloat(raw.merchant.latitude) || 0,
          longitude: parseFloat(raw.merchant.longitude) || 0,
          isActive: Boolean(raw.merchant.is_active),
        }
      : undefined,
    compatibilities: compats,
    rating: 4.8,
    reviewCount: 15,
  };
}

export class HttpCatalogService implements ICatalogService {
  private fallbackMock = new MockCatalogService();

  async searchProducts(params: CatalogFilterParams): Promise<PaginatedResult<Product>> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.make) query.set('make', params.make);
    if (params.model) query.set('model', params.model);
    if (params.year) query.set('year', String(params.year));
    if (params.category) query.set('category', params.category);
    if (params.brand) query.set('brand', params.brand);
    if (params.vendor) query.set('vendor', params.vendor);
    if (params.condition) query.set('condition', params.condition);
    if (params.minPrice !== undefined) query.set('min_price', String(params.minPrice));
    if (params.maxPrice !== undefined) query.set('max_price', String(params.maxPrice));
    if (params.sortBy) query.set('sort_by', params.sortBy);
    if (params.oemNumber) query.set('oem_number', params.oemNumber);
    if (params.sku) query.set('sku', params.sku);
    if (params.page) query.set('page', String(params.page));
    if (params.perPage) query.set('per_page', String(params.perPage));

    try {
      const res = await apiClient<any[]>(`/products/search?${query.toString()}`);
      const data = (res.data || []).map(mapBackendProduct);
      return {
        data,
        meta: {
          currentPage: res.meta?.current_page || 1,
          lastPage: res.meta?.last_page || 1,
          perPage: res.meta?.per_page || 15,
          total: res.meta?.total || data.length,
        },
      };
    } catch {
      // Fallback to mock catalog if backend server is unreachable
      return this.fallbackMock.searchProducts(params);
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    const res = await this.searchProducts({ q: id });
    return res.data.find((p) => p.id === id) || null;
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    const res = await this.searchProducts({ sku });
    return res.data[0] || null;
  }

  getCategories = () => this.fallbackMock.getCategories();
  getCategoryBySlug = (slug: string) => this.fallbackMock.getCategoryBySlug(slug);
  getFeaturedProducts = (limit?: number) => this.fallbackMock.getFeaturedProducts(limit);
  getDeals = (limit?: number) => this.fallbackMock.getDeals(limit);
  getRelatedProducts = (id: string, limit?: number) => this.fallbackMock.getRelatedProducts(id, limit);
  getBrands = () => this.fallbackMock.getBrands();
}

export class HttpSearchService implements ISearchService {
  private catalog = new HttpCatalogService();
  private fallbackMock = new MockSearchService();

  async liveSearch(query: string, limit = 6) {
    try {
      const res = await this.catalog.searchProducts({ q: query, perPage: limit });
      return {
        products: res.data,
        categories: (await this.catalog.getCategories()).slice(0, 3),
      };
    } catch {
      return this.fallbackMock.liveSearch(query, limit);
    }
  }

  findByPartNumber = (part: string) => this.fallbackMock.findByPartNumber(part);
  findByVin = (vin: string) => this.fallbackMock.findByVin(vin);
}

export class HttpVehicleService implements IVehicleService {
  private fallbackMock = new MockVehicleService();

  getMakes = () => this.fallbackMock.getMakes();
  getModels = (make: string) => this.fallbackMock.getModels(make);
  getYears = (make: string, model: string) => this.fallbackMock.getYears(make, model);
  resolveByVin = (vin: string) => this.fallbackMock.resolveByVin(vin);

  async getCustomerVehicles(token?: string): Promise<CustomerVehicle[]> {
    if (!token) return this.fallbackMock.getCustomerVehicles();
    try {
      const res = await apiClient<any[]>('/customer/vehicles', { token });
      return (res.data || []).map((v: any) => ({
        id: v.id,
        userId: v.user_id,
        make: v.make,
        model: v.model,
        year: Number(v.year),
        vin: v.vin,
        isDefault: Boolean(v.is_default),
        createdAt: v.created_at,
      }));
    } catch {
      return this.fallbackMock.getCustomerVehicles();
    }
  }

  async addCustomerVehicle(data: Omit<CustomerVehicle, 'id'>, token?: string): Promise<CustomerVehicle> {
    if (!token) return this.fallbackMock.addCustomerVehicle(data);
    const res = await apiClient<any>('/customer/vehicles', {
      method: 'POST',
      body: JSON.stringify({
        make: data.make,
        model: data.model,
        year: data.year,
        vin: data.vin,
        is_default: data.isDefault,
      }),
      token,
    });
    return {
      id: res.data.id,
      userId: res.data.user_id,
      make: res.data.make,
      model: res.data.model,
      year: Number(res.data.year),
      vin: res.data.vin,
      isDefault: Boolean(res.data.is_default),
    };
  }
}

export class HttpCheckoutService implements ICheckoutService {
  private fallbackMock = new MockVehicleService();

  async checkout(
    payload: {
      items: Array<{ productId: string; quantity: number }>;
      deliveryLat: number;
      deliveryLng: number;
      paymentType: PaymentType;
    },
    token?: string
  ): Promise<OrderRecord> {
    const res = await apiClient<any>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: payload.items.map((it) => ({
          product_id: it.productId,
          quantity: it.quantity,
        })),
        delivery_lat: payload.deliveryLat,
        delivery_lng: payload.deliveryLng,
        payment_type: payload.paymentType,
      }),
      token,
    });

    const o = res.data;
    return {
      id: o.id,
      orderCode: o.order_code,
      customerId: o.customer_id,
      subtotal: parseFloat(o.subtotal),
      deliveryFee: parseFloat(o.delivery_fee),
      serviceFee: parseFloat(o.service_fee),
      totalAmount: parseFloat(o.total_amount),
      paymentType: o.payment_type,
      paymentStatus: o.payment_status,
      orderStatus: o.order_status,
      deliveryLat: parseFloat(o.delivery_lat),
      deliveryLng: parseFloat(o.delivery_lng),
      subOrders: (o.sub_orders || []).map((s: any) => ({
        id: s.id,
        parentId: s.parent_id,
        orderCode: s.order_code,
        merchantId: s.merchant_id,
        subtotal: parseFloat(s.subtotal),
        deliveryFee: parseFloat(s.delivery_fee),
        serviceFee: parseFloat(s.service_fee),
        totalAmount: parseFloat(s.total_amount),
        orderStatus: s.order_status,
        deliveryOtp: s.delivery_otp,
        items: (s.items || []).map((it: any) => ({
          id: it.id,
          orderId: it.order_id,
          productId: it.product_id,
          quantity: Number(it.quantity),
          unitPrice: parseFloat(it.unit_price),
          totalPrice: parseFloat(it.total_price),
        })),
      })),
      createdAt: o.created_at || new Date().toISOString(),
    };
  }
}

export class HttpOrderService implements IOrderService {
  private fallbackMock = new MockOrderService();

  async getOrders(page = 1, token?: string): Promise<PaginatedResult<OrderRecord>> {
    try {
      const res = await apiClient<any[]>(`/orders?page=${page}`, { token });
      return {
        data: (res.data || []).map((o: any) => ({
          id: o.id,
          orderCode: o.order_code,
          customerId: o.customer_id,
          subtotal: parseFloat(o.subtotal),
          deliveryFee: parseFloat(o.delivery_fee),
          serviceFee: parseFloat(o.service_fee),
          totalAmount: parseFloat(o.total_amount),
          paymentType: o.payment_type,
          paymentStatus: o.payment_status,
          orderStatus: o.order_status,
          deliveryLat: parseFloat(o.delivery_lat),
          deliveryLng: parseFloat(o.delivery_lng),
          subOrders: [],
          createdAt: o.created_at,
        })),
        meta: {
          currentPage: res.meta?.current_page || 1,
          lastPage: res.meta?.last_page || 1,
          perPage: res.meta?.per_page || 15,
          total: res.meta?.total || 0,
        },
      };
    } catch {
      return this.fallbackMock.getOrders(page);
    }
  }

  async getOrderById(id: string, token?: string): Promise<OrderRecord | null> {
    try {
      const res = await apiClient<any>(`/orders/${id}`, { token });
      const o = res.data;
      if (!o) return null;
      return {
        id: o.id,
        orderCode: o.order_code,
        customerId: o.customer_id,
        subtotal: parseFloat(o.subtotal),
        deliveryFee: parseFloat(o.delivery_fee),
        serviceFee: parseFloat(o.service_fee),
        totalAmount: parseFloat(o.total_amount),
        paymentType: o.payment_type,
        paymentStatus: o.payment_status,
        orderStatus: o.order_status,
        deliveryLat: parseFloat(o.delivery_lat),
        deliveryLng: parseFloat(o.delivery_lng),
        subOrders: [],
        createdAt: o.created_at,
      };
    } catch {
      return this.fallbackMock.getOrderById(id);
    }
  }

  async trackOrder(orderIdOrCode: string, token?: string): Promise<TrackingInfo | null> {
    try {
      const res = await apiClient<any>(`/orders/${orderIdOrCode}/track`, { token });
      const d = res.data;
      if (!d) return null;
      return {
        orderCode: d.order_code,
        status: d.status,
        statusLabel: d.status_label,
        courier: d.courier
          ? {
              name: d.courier.name,
              phone: d.courier.phone,
              vehicleType: d.courier.vehicle_type,
              livePosition: d.courier.live_position,
            }
          : null,
        pickupLocation: d.pickup_location,
        deliveryLocation: d.delivery_location,
      };
    } catch {
      return this.fallbackMock.trackOrder(orderIdOrCode);
    }
  }
}

export class HttpTrackingService implements ITrackingService {
  private orderService = new HttpOrderService();
  getRepLocation(orderId: string, token?: string) {
    return this.orderService.trackOrder(orderId, token);
  }
}

export class HttpVendorService implements IVendorService {
  private fallbackMock = new MockVendorService();

  async getVendors(limit?: number): Promise<Vendor[]> {
    try {
      const res = await apiClient<any[]>(`/merchants${limit ? `?per_page=${limit}` : ''}`);
      return (res.data || []).map((m: any) => ({
        id: m.id,
        name: m.store_name,
        storeName: m.store_name,
        slug: m.id,
        addressText: m.address_text || '',
        latitude: parseFloat(m.latitude) || 30.0444,
        longitude: parseFloat(m.longitude) || 31.2357,
        phone: m.phone || '01012345678',
        rating: 4.9,
        reviewCount: m.products_count ? m.products_count * 5 : 85,
        isActive: Boolean(m.is_active),
      }));
    } catch {
      return this.fallbackMock.getVendors(limit);
    }
  }

  async getVendorBySlug(slug: string): Promise<Vendor | null> {
    const all = await this.getVendors();
    return all.find((v) => v.slug === slug || v.id === slug) || null;
  }

  async getVendorProducts(vendorId: string, page = 1): Promise<PaginatedResult<Product>> {
    const catalog = new HttpCatalogService();
    return catalog.searchProducts({ vendor: vendorId, page });
  }
}

