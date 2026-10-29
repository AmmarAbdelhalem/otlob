import {
  Brand,
  Category,
  CustomerVehicle,
  OrderRecord,
  PaymentType,
  Product,
  TrackingInfo,
  UserProfile,
  VehicleMake,
  VehicleModel,
  Vendor,
} from '../types';

export interface CatalogFilterParams {
  category?: string;
  brand?: string;
  vendor?: string;
  make?: string;
  model?: string;
  year?: number;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  oemNumber?: string;
  sku?: string;
  q?: string;
  sortBy?: 'popularity' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
  page?: number;
  perPage?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

export interface ICatalogService {
  searchProducts(params: CatalogFilterParams): Promise<PaginatedResult<Product>>;
  getProductById(id: string): Promise<Product | null>;
  getProductBySku(sku: string): Promise<Product | null>;
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getDeals(limit?: number): Promise<Product[]>;
  getRelatedProducts(productId: string, limit?: number): Promise<Product[]>;
  getBrands(): Promise<Brand[]>;
}

export interface ISearchService {
  liveSearch(query: string, limit?: number): Promise<{ products: Product[]; categories: Category[] }>;
  findByPartNumber(partNumber: string): Promise<Product[]>;
  findByVin(vin: string): Promise<{ vehicle: Partial<CustomerVehicle> | null; products: Product[] }>;
}

export interface IVehicleService {
  getMakes(): Promise<VehicleMake[]>;
  getModels(makeIdOrName: string): Promise<VehicleModel[]>;
  getYears(make: string, model: string): Promise<number[]>;
  resolveByVin(vin: string): Promise<Partial<CustomerVehicle> | null>;
  getCustomerVehicles(token?: string): Promise<CustomerVehicle[]>;
  addCustomerVehicle(data: Omit<CustomerVehicle, 'id'>, token?: string): Promise<CustomerVehicle>;
}

export interface ICheckoutService {
  checkout(payload: {
    items: Array<{ productId: string; quantity: number }>;
    deliveryLat: number;
    deliveryLng: number;
    paymentType: PaymentType;
  }, token?: string): Promise<OrderRecord>;
}

export interface IOrderService {
  getOrders(page?: number, token?: string): Promise<PaginatedResult<OrderRecord>>;
  getOrderById(id: string, token?: string): Promise<OrderRecord | null>;
  trackOrder(orderIdOrCode: string, token?: string): Promise<TrackingInfo | null>;
}

export interface ITrackingService {
  getRepLocation(orderId: string, token?: string): Promise<TrackingInfo | null>;
}

export interface IVendorService {
  getVendors(limit?: number): Promise<Vendor[]>;
  getVendorBySlug(slug: string): Promise<Vendor | null>;
  getVendorProducts(vendorId: string, page?: number): Promise<PaginatedResult<Product>>;
}

export interface IAuthService {
  login(login: string, password: string): Promise<{ user: UserProfile; token: string }>;
  register(payload: any): Promise<{ user: UserProfile; token: string }>;
  logout(token?: string): Promise<void>;
  getProfile(token?: string): Promise<UserProfile | null>;
}

export interface IContentService {
  getHeroSlides(): Promise<any[]>;
  getPromoBanners(): Promise<any[]>;
  getTestimonials(): Promise<any[]>;
  getBlogTeasers(): Promise<any[]>;
}
