import {
  ICatalogService,
  ISearchService,
  IVehicleService,
  ICheckoutService,
  IOrderService,
  ITrackingService,
  IVendorService,
  IContentService,
} from './services';
import {
  MockCatalogService,
  MockSearchService,
  MockVehicleService,
  MockCheckoutService,
  MockOrderService,
  MockTrackingService,
  MockVendorService,
  MockContentService,
} from './mock';
import {
  HttpCatalogService,
  HttpSearchService,
  HttpVehicleService,
  HttpCheckoutService,
  HttpOrderService,
  HttpTrackingService,
  HttpVendorService,
} from './services/http';

export const API_MODE = process.env.NEXT_PUBLIC_API_MODE === 'live' ? 'live' : 'mock';

export interface ServiceContainer {
  catalog: ICatalogService;
  search: ISearchService;
  vehicle: IVehicleService;
  checkout: ICheckoutService;
  order: IOrderService;
  tracking: ITrackingService;
  vendor: IVendorService;
  content: IContentService;
}

export function createServices(): ServiceContainer {
  if (API_MODE === 'live') {
    return {
      catalog: new HttpCatalogService(),
      search: new HttpSearchService(),
      vehicle: new HttpVehicleService(),
      checkout: new HttpCheckoutService(),
      order: new HttpOrderService(),
      tracking: new HttpTrackingService(),
      vendor: new HttpVendorService(),
      content: new MockContentService(), // gap fallback
    };
  }

  // Default Mock Mode
  return {
    catalog: new MockCatalogService(),
    search: new MockSearchService(),
    vehicle: new MockVehicleService(),
    checkout: new MockCheckoutService(),
    order: new MockOrderService(),
    tracking: new MockTrackingService(),
    vendor: new MockVendorService(),
    content: new MockContentService(),
  };
}

export const services = createServices();
