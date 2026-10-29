# Backend Gap Analysis & Mock Adapter Strategy

**Project:** Otlob Auto Parts Marketplace Storefront  
**Date:** 2026-10-28  
**Contract Reference:** `docs/backend-contract.md`

This document details every feature requested by the Partdo auto-parts UX specification where the current Laravel backend lacks a direct database model or REST API endpoint.

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
