# Backend Gap Analysis & Mock Adapter Strategy

**Project:** Otlob Auto Parts Marketplace Storefront  
**Date:** 2026-10-28  
**Contract Reference:** `docs/backend-contract.md`

This document details every feature requested by the Partdo auto-parts UX specification where the current Laravel backend lacks a direct database model or REST API endpoint. For each gap, we define:
1. **The Missing Backend Capability**
2. **The Frontend Domain Service Interface**
3. **The Mock Adapter Strategy** (`MockXxxService`) that fulfills the UI contract seamlessly
4. **The Migration Path** when the backend adds the endpoint

---

## Gap Matrix

| Service Interface | Method / Feature | Backend Status | Mock Adapter Behavior | Proposed Backend Route |
|---|---|---|---|---|
| `CatalogService` | `getCategories()` | ❌ No `categories` table | Returns tree of auto-parts categories (Engine, Brakes, Suspension, Electrical, Body, Filters) | `GET /api/v1/categories` |
| `CatalogService` | `getCategoryBySlug(slug)` | ❌ No category slug lookup | Filters mock category tree + queries compatible products | `GET /api/v1/categories/{slug}` |
| `CatalogService` | `getProduct(id \| slug)` | ⚠️ Only `/products/search` exists | Resolves product by UUID from search query or mock repository | `GET /api/v1/products/{id}` |
| `CatalogService` | `getFeatured()`, `getDeals()` | ❌ No promotion flags | Fetches active products and applies mock deal / stock progress | `GET /api/v1/products/featured` |
| `CatalogService` | Product image galleries | ❌ No image fields in migrations | Generates categorized, authentic auto-part SVG/WebP assets | Add `images` to `products` |
| `VehicleService` | `getMakes()` | ⚠️ Only in `product_compatibilities` | Returns distinct car makes (Toyota, Hyundai, Nissan, etc.) | `GET /api/v1/vehicles/makes` |
| `VehicleService` | `getModels(make)` | ⚠️ Only in `product_compatibilities` | Returns distinct models for make | `GET /api/v1/vehicles/models` |
| `VehicleService` | `getYears(make, model)` | ⚠️ In `year_from` / `year_to` | Returns valid year range for model | `GET /api/v1/vehicles/years` |
| `VehicleService` | `resolveByVin(vin)` | ❌ No VIN decoding endpoint | Decodes Egyptian/WMI VIN prefixes to make, model, year | `GET /api/v1/vehicles/vin/{vin}` |
| `VehicleService` | Fitment badge check | ⚠️ Queryable via search | Computes "Fits your {Make} {Model} {Year}" badge | `POST /api/v1/fitment/check` |
| `VendorService` | `getVendor(slug \| id)` | ⚠️ In `merchants` table, no public profile route | Returns merchant profile, banner, rating, product listing | `GET /api/v1/merchants/{id}` |
| `WishlistService` | `getWishlist()`, `toggle()` | ❌ No database table | Stores in persisted Zustand client state + Mock API sync | `GET/POST /api/v1/wishlist` |
| `ReviewService` | `getProductReviews()`, `submit()` | ❌ No reviews table | Mock reviews, ratings distribution, and review submission | `GET/POST /api/v1/reviews` |
| `CouponService` | `applyCoupon(code)` | ❌ No coupon engine | Validates coupon codes (e.g. `OTLOB10` for 10% off) | `POST /api/v1/coupons/apply` |
| `ContentService` | `getHeroSlides()`, `getBanners()` | ❌ No CMS tables | Serves configurable slides and promotional blocks | `GET /api/v1/content/home` |
| `ContentService` | `getBlogPosts()`, `getPost(slug)` | ❌ No blog tables | Serves maintenance & auto-care articles | `GET /api/v1/blog` |

---

## Detailed Gap Analyses & Mock Solutions

### 1. Categories & Navigation Hierarchy
- **Gap:** The backend `products` table has `name`, `sku`, `oem_number`, and `description`, but does not have a `category_id` foreign key.
- **Mock Solution:** `MockCatalogService` provides a structured 3-level taxonomy matching the Partdo layout (e.g., *Engine & Drivetrain* $\rightarrow$ *Belts & Pulleys* $\rightarrow$ *Timing Belts*). When products are returned from the live search, mock categories are heuristically inferred from keywords (e.g., "brake" $\rightarrow$ "Braking Systems").
- **Backend Fix:** Add `categories` table and `category_id` FK to `products`.

### 2. Vehicle Selector (Make $\rightarrow$ Model $\rightarrow$ Year Cascading)
- **Gap:** The backend has `product_compatibilities` with `make`, `model`, `year_from`, and `year_to`. However, there is no public endpoint to list all available makes or cascading models.
- **Mock Solution:** `MockVehicleService` provides a comprehensive database of Egyptian market vehicles (Toyota Corolla/Yaris, Hyundai Elantra/Tucson/Verna, Nissan Sunny/Qashqai, Fiat Tipo, Chevrolet Optra/Aveo, Kia Cerato/Sportage, Renault Logan/Megane, Mitsubishi Lancer/Attrage, Mercedes-Benz, BMW). In live mode, it can also query `products/search` to extract matching vehicles.
- **Backend Fix:** Expose `GET /api/v1/vehicles/catalog` aggregated from `product_compatibilities`.

### 3. Chassis / VIN Search
- **Gap:** Customers can register vehicles with `vin` in `/customer/vehicles`, but there is no VIN decoder endpoint to parse vehicle details from a 17-digit VIN.
- **Mock Solution:** `MockVehicleService.resolveByVin(vin)` contains an algorithmic VIN decoder for North American and European/Egyptian ISO 3779 VIN standards:
  - WMI (World Manufacturer Identifier, chars 1-3) $\rightarrow$ Manufacturer (e.g., `AHT` $\rightarrow$ Toyota South Africa, `KMH` $\rightarrow$ Hyundai Korea, `NMT` $\rightarrow$ Toyota Turkey, `VF1` $\rightarrow$ Renault France, `1HG` $\rightarrow$ Honda USA).
  - Model year encoded in 10th character (e.g., `K` = 2019, `L` = 2020, `M` = 2021, `N` = 2022).
  - Graceful fallback: when an unrecognizable VIN is entered, the UI politely prompts the user to select Make/Model/Year manually.

### 4. Product Media & Images
- **Gap:** The `products` database table does not store image URLs.
- **Mock Solution:** A dedicated image helper maps product categories and part types to high-quality auto-parts vector/WebP artwork (brake discs, oil filters, spark plugs, alternators, shock absorbers, headlights). In live mode, if `image_url` is missing from the API response, this fallback seamlessly ensures no broken image icons appear anywhere on the storefront.

### 5. Multi-Vendor Storefronts (`/vendors/[slug]`)
- **Gap:** Merchants exist in the backend (`merchants` table) and are included in `products/search` as `merchant: { id, store_name, address_text, ... }`. However, there is no public endpoint to fetch a single merchant by slug or view their full store page with ratings and policies.
- **Mock Solution:** `MockVendorService` and `HttpVendorService` load merchant information and query `searchProducts` filtered by merchant, providing store banners, location maps, rating stars, and merchant policy tabs.

### 6. WhatsApp Ordering ("Order on WhatsApp")
- **Gap:** Direct customer-to-merchant WhatsApp checkout links require merchant phone numbers.
- **Mock Solution:** The WhatsApp action builder formats an Arabic/English pre-filled message:
  ```
  مرحباً، أود الاستفسار عن شراء القطعة التالية:
  - المنتج: Front Brake Pad Set (Ceramic)
  - كود القطعة (SKU): BP-TY-COR-01
  - السعر: 950 جنيه
  - الرابط: https://otlob-parts.com/ar/product/BP-TY-COR-01
  ```
  It links directly to `https://wa.me/{phone}?text={encoded}` using the merchant's phone or store customer support fallback configured in `siteConfig`.

### 7. Rep Live Tracking & OpenStreetMap MapProvider
- **Backend Status:** Live! `GET /api/v1/orders/{id}/track` provides the courier's live Redis GPS coordinates, vehicle type, and pickup/delivery locations.
- **Storefront Implementation:** A leaf-level Leaflet map dynamically tracks the rep position with auto-panning, custom courier vehicle marker icons (motorcycle, car, van), customer delivery pin, and an ETA distance calculator.
