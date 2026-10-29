/**
 * Domain types for Otlob Auto Parts Storefront.
 * Decoupled from raw backend database shapes via mappers & adapter interfaces.
 */

export type Locale = 'ar' | 'en';

export type HomeSectionType =
  | 'hero'
  | 'top-offers'
  | 'featured-categories-tabs'
  | 'promo-banners-row'
  | 'latest-deals-stock-progress'
  | 'coupon-strip'
  | 'wide-banner-product-row'
  | 'flash-deal-countdown'
  | 'category-tiles-grid'
  | 'testimonials'
  | 'blog-teaser'
  | 'partner-brands-row'
  | 'newsletter';

export interface LocalizedString {
  ar: string;
  en: string;
}

export type ProductCondition = 'new' | 'used' | 'refurbished';

export interface VehicleCompatibility {
  id: string;
  productId: string;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
}

export interface Vendor {
  id: string;
  name: string;
  storeName: string;
  slug: string;
  addressText: string;
  latitude: number;
  longitude: number;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
  bannerImage?: string;
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  sku: string;
  oemNumber: string;
  description: string;
  price: number; // in EGP
  originalPrice?: number;
  discountPercentage?: number;
  stockQuantity: number;
  availableStock?: number;
  soldCount?: number;
  weightKg: number;
  dimensionsCm: {
    length: number;
    width: number;
    height: number;
  };
  condition: ProductCondition;
  isActive: boolean;
  images: string[];
  thumbnail: string;
  categorySlug?: string;
  categoryName?: LocalizedString;
  brand?: string;
  merchant?: Vendor;
  compatibilities: VehicleCompatibility[];
  rating?: number;
  reviewCount?: number;
  badges?: Array<{
    text: LocalizedString;
    variant: 'danger' | 'warning' | 'success' | 'primary';
  }>;
}

export interface Category {
  id: string;
  name: LocalizedString;
  slug: string;
  description?: LocalizedString;
  icon?: string;
  image?: string;
  itemCount?: number;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  country?: string;
}

export interface VehicleMake {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface VehicleModel {
  id: string;
  makeId: string;
  name: string;
  slug: string;
}

export interface CustomerVehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartVendorGroup {
  merchantId: string;
  merchantName: string;
  items: CartItem[];
  subtotal: number;
  estimatedDeliveryFee: number;
  estimatedDeliveryEta: string;
}

export interface Cart {
  items: CartItem[];
  vendorGroups: CartVendorGroup[];
  subtotal: number;
  totalDeliveryFee: number;
  platformServiceFee: number;
  discountAmount: number;
  totalAmount: number;
  itemCount: number;
}

export type OrderStatus =
  | 'pending'
  | 'accepted_by_merchant'
  | 'preparing'
  | 'ready_for_pickup'
  | 'assigned_to_courier'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type PaymentType = 'cod' | 'card' | 'wallet';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
}

export interface SubOrderRecord {
  id: string;
  parentId: string;
  orderCode: string;
  merchantId: string;
  merchant?: Vendor;
  courierId?: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  deliveryOtp?: string;
  items: OrderItemRecord[];
}

export interface OrderRecord {
  id: string;
  orderCode: string;
  customerId: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  totalAmount: number;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryLat: number;
  deliveryLng: number;
  subOrders: SubOrderRecord[];
  createdAt: string;
}

export interface RepLocation {
  latitude: number;
  longitude: number;
}

export interface CourierInfo {
  name: string;
  phone: string;
  vehicleType: 'motorcycle' | 'car' | 'van';
  livePosition: RepLocation | null;
}

export interface TrackingInfo {
  orderCode: string;
  status: OrderStatus;
  statusLabel: string;
  courier: CourierInfo | null;
  pickupLocation: RepLocation;
  deliveryLocation: RepLocation;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'merchant' | 'courier' | 'admin';
  status: 'active' | 'pending' | 'suspended';
  vehicles?: CustomerVehicle[];
  merchant?: Vendor;
}
