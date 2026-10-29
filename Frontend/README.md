# Otlob Auto Parts — Production Next.js Storefront

A production-grade, highly customizable multi-vendor car spare-parts storefront built with **Next.js 15 (App Router)**, **React 19**, **TypeScript** (Strict Mode), and **Tailwind CSS**.

Reproduces the complete UX patterns and layout architecture of the **Partdo** automotive theme, tailored specifically for the **Egyptian market** (EGP currency, RTL-first Arabic + English LTR, VIN decoding, WhatsApp ordering, multi-vendor cart splitting, and live GPS courier tracking).

---

## Architecture & Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Server Components by default, streaming SSR, dynamic routing |
| **Language** | TypeScript 5.7+ | `strict: true`, zero `any` leaks in domain models |
| **Styling** | Tailwind CSS + CSS Tokens | Custom token engine in `src/styles/tokens.css` with 4 validated presets |
| **State Management** | Zustand (with `persist`) | Persistent client stores for Cart, Garage, Wishlist, Compare, and UI |
| **Validation** | Zod 3.24+ | Schema validation for all site configs, menus, and feature toggles |
| **Icons** | Lucide React | High performance SVG icon set |
| **Backend Integration** | Adapter Pattern | Seamless switching between Live Laravel 11 Backend & Resilient Mock Fallbacks |

---

## Quick Start & Running the Project

### Prerequisites
- Node.js LTS (v20+ or v22+)
- Windows or Linux environment

### 1. Environment Configuration
Create or inspect `.env.local`:
```bash
# Set to 'mock' for standalone frontend development with realistic auto-parts data
# Set to 'live' to connect to your Laravel backend (e.g., http://localhost:8000/api/v1)
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.
- Arabic (RTL): [http://localhost:3000/ar](http://localhost:3000/ar)
- English (LTR): [http://localhost:3000/en](http://localhost:3000/en)
- Theme & Fitment Playground: [http://localhost:3000/ar/dev/playground](http://localhost:3000/ar/dev/playground)

### 4. Build for Production
```bash
npm run typecheck   # Runs 'tsc --noEmit' (0 errors)
npm run build       # Creates optimized Next.js production build
npm run start       # Starts production server
```

---

## Route Map & Key Features

### Public Storefront
- **`/[locale]`**: Modular homepage with 13 configurable Partdo sections (Hero Slider, Top Offers Strip, Featured Category Tabs, Deals Progress Bar, Coupons Strip, Flash Deals, Testimonials, Blog Teasers, Partner Brands, Newsletter).
- **`/[locale]/shop`**: Catalog search & filtering:
  - 4 layout modes: `left-sidebar`, `right-sidebar`, `wide`, `top-filters`.
  - 2 to 6 column grids + list view toggle.
  - URL-driven filtering (Make, Model, Year, Brand, Vendor, Price range, Condition, OEM Number).
- **`/[locale]/category/[...slug]`**: Nested category hierarchy catch-all (e.g. `/category/brakes`, `/category/engine/filters`).
- **`/[locale]/product/[slug]`**: Product Detail Page (PDP):
  - Image gallery with thumbnails and zoom preview.
  - Live **Vehicle Fitment Checker** tied to active garage vehicle.
  - Direct **Egyptian WhatsApp Ordering** button (`wa.me` with pre-filled SKU, OEM & specs).
  - Sticky bottom purchase bar for mobile/desktop scrolling.
  - Multi-vendor seller card with store rating and address.
  - 5-tab technical specs: Description, OEM codes with 1-click copy, Fitment Table, Shipping & 14-day warranty policy, and Verified customer reviews.
  - Structured data (`schema.org/Product`) for Google Rich Snippets in EGP.

### Commerce & Multi-Vendor System
- **`/[locale]/cart`**:
  - Automatically splits items into merchant packages.
  - Calculates per-merchant delivery fees (`45 EGP`) + platform guarantee fee (`15 EGP`).
  - Quantity steppers & instant coupon code discount (`OTLOB10`, `RAMADAN`).
- **`/[locale]/checkout`**:
  - Egyptian phone validation (11 digits: `010`, `011`, `012`, `015`).
  - Egyptian governorates dropdown + instant GPS map pin preset simulation.
  - Multi-vendor shipment split preview.
  - Payment options: Cash on Delivery (`cod`), Cards (`card`), and Instapay / Mobile Wallets (`wallet`).
- **`/[locale]/order-tracking`**:
  - Real-time 4-step order progress stepper.
  - **Delivery Verification OTP Box** (`482910`) for customer safety upon inspection.
  - Simulated live GPS courier canvas with moving vehicle avatar and dynamic ETA countdown.

### Customer Account & Garage
- **`/[locale]/account`**: Overview dashboard showing saved vehicles count, active orders, and customer verification badge.
- **`/[locale]/account/garage`**: Interactive vehicle management:
  - Cascading Make $\rightarrow$ Model $\rightarrow$ Year selector.
  - 17-digit VIN decoder (`JTDBR...`, `KMH...`, `JN1...`, `ZFA...`).
  - Active vehicle toggle for 1-click catalog fitment checking.
- **`/[locale]/account/orders`**: Order history with sub-orders breakdown and live tracking links.
- **`/[locale]/wishlist`**: Saved parts grid with "Add All to Cart".
- **`/[locale]/compare`**: Side-by-side technical specification, OEM code, and price comparison table for up to 4 parts.

### Quality Assurance & Themes
- **`/[locale]/dev/playground`**: Live interactive testing sandbox for layout templates, column counts, vehicle simulators, and theme presets.
- **Floating Theme Customizer**: Floating corner button opening live slide-out drawer to toggle:
  - 4 Presets: `default`, `electric-blue`, `emerald-speed`, `monochrome-luxe`.
  - Mode: `light`, `dark`, `system`.
  - Border Radius: `none`, `sm`, `md`, `lg`, `full`.
  - Direction / Locale: `ar` (RTL) / `en` (LTR).

---

## Configuration System (`src/config/`)

All storefront branding, layout variants, menus, and feature toggles are centralized and validated using Zod:

```typescript
// src/config/site.config.ts
export const siteConfig = {
  brand: {
    name: { ar: 'اطلب لقطع الغيار', en: 'Otlob Auto Parts' },
    ...
  },
  theme: {
    preset: 'default', // 'default' | 'electric-blue' | 'emerald-speed' | 'monochrome-luxe'
    darkMode: 'system',
    radius: 'md',
  },
  shop: {
    layout: 'left-sidebar', // 'left-sidebar' | 'right-sidebar' | 'wide' | 'top-filters'
    columns: 4,             // 2 to 6
    perPage: 12,
    view: 'grid',           // 'grid' | 'list'
  },
  features: {
    enableVehicleFinder: true,
    enableLiveSearch: true,
    enableQuickView: true,
    enableCompare: true,
    enableWishlist: true,
    enableVinDecoder: true,
    enableCourierLiveTracking: true,
    enableWhatsappOrdering: true,
  },
  ...
};
```

---

## Backend Integration & Contract Mapping

The storefront connects to the Laravel backend via `src/lib/api/services/http.ts`:
- **Auth**: Sanctum token authentication with `httpOnly` secure cookies via Next.js Route Handlers (`/api/auth/*`).
- **Product Search**: Calls `GET /api/v1/products?q=...&category=...` mapping database rows into domain types.
- **Vehicle Fitment**: Resolves makes, models, and VINs against customer vehicle records.
- **Multi-Vendor Checkout**: Submits `{ items, delivery_lat, delivery_lng, payment_type }` to `POST /api/v1/orders/checkout` creating parent and sub-orders.
- **Live Courier Tracking**: Streams representative GPS positions from `GET /api/v1/orders/{id}/track`.
- **Resilient Fallback**: Automatically falls back to mock domain data if the backend server is temporarily unreachable, preventing any crashes or blank screens.
