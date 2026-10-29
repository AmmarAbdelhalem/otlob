# Otlob Auto Parts Marketplace — Backend Contract Specification

**Document Version:** 1.0.0  
**Backend Framework:** Laravel 11.x with Laravel Sanctum, Redis, and Reverb  
**Default Base URL:** `http://localhost:8000/api/v1`  
**API Mode:** `NEXT_PUBLIC_API_MODE=live|mock`

---

## 1. Architectural Overview & Conventions

### 1.1 Base Headers
Every request to the backend must provide:
```http
Accept: application/json
Content-Type: application/json
```
For authenticated requests:
```http
Authorization: Bearer <sanctum_personal_access_token>
```

### 1.2 Unified Response Format (`ApiResponseTrait`)

All endpoints return JSON wrapped in a predictable structure:

#### Success Response (Singular Object / Operation)
```json
{
  "success": true,
  "message": "Optional human-readable confirmation message",
  "data": { ... }
}
```

#### Paginated Success Response (`LengthAwarePaginator`)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 68
  },
  "message": null
}
```

#### Error Response
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "phone": ["The phone has already been taken."],
    "password": ["The password field must be at least 8 characters."]
  }
}
```

### 1.3 Money and Decimals
- Monetary amounts (`subtotal`, `delivery_fee`, `service_fee`, `total_amount`, `price`, `wallet->balance`) are stored in MySQL/PostgreSQL as `decimal:2` in Egyptian Pounds (**EGP**).
- For strict mathematical integrity in the Next.js frontend, amounts are normalized into integer minor units (piastres / millimes) or fixed 2-decimal floats and formatted using `Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' })` / `Intl.NumberFormat('en-EG', ...)`.

---

## 2. Authentication & User Profile (`AuthService`)

### 2.1 Register
- **Endpoint:** `POST /api/v1/auth/register`
- **Rate Limit:** 5 requests / minute (`throttle:auth`)
- **Headers:** `Accept: application/json`
- **Request Body (`RegisterRequest`):**
```json
{
  "name": "Ahmed Mohamed",
  "phone": "01012345678",
  "email": "ahmed@example.com",
  "password": "SecurePassword123",
  "role": "customer",
  "fcm_token": "optional_fcm_registration_token",
  
  "store_name": "Al-Amal Auto Spare Parts",
  "commercial_registration_number": "CRN-192837",
  "address_text": "25 Ramses Street, Cairo, Egypt",
  "latitude": 30.0561,
  "longitude": 31.2394,

  "vehicle_type": "motorcycle",
  "max_load_capacity": 20.0,
  "max_volume_capacity": 0.1,
  "max_cod_limit": 2000.0
}
```
- **Response (201 Created):** Returns user with token.

### 2.2 Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Rate Limit:** 5 requests / minute (`throttle:auth`)
- **Request Body (`LoginRequest`):**
```json
{
  "login": "01012345678",
  "password": "SecurePassword123",
  "device_name": "web-storefront"
}
```
- **Response (200 OK):** Returns user object and bearer token.

### 2.3 Current User (`/me`)
- **Endpoint:** `GET /api/v1/auth/me`
- **Auth:** Required (`auth:sanctum`)

### 2.4 Logout
- **Endpoint:** `POST /api/v1/auth/logout`
- **Auth:** Required (`auth:sanctum`)

### 2.5 Update FCM Token
- **Endpoint:** `POST /api/v1/auth/fcm-token`
- **Auth:** Required (`auth:sanctum`)

---

## 3. Product Catalog & Search (`CatalogService`, `SearchService`)

### 3.1 Public Product Search
- **Endpoint:** `GET /api/v1/products/search`
- **Auth:** Public (`throttle:api` 60 req/min)
- **Cache:** Redis cached for 5 minutes by query fingerprint
- **Query Parameters:** `q`, `make`, `model`, `year`, `oem_number`, `sku`, `page`, `per_page`
- **Returned Product Fields:** `id` (UUID), `merchant_id` (UUID), `name`, `sku`, `oem_number`, `description`, `price`, `stock_quantity`, `weight_kg`, `length_cm`, `width_cm`, `height_cm`, `condition`, `is_active`, `merchant`, `compatibilities`.

---

## 4. Customer Vehicle Garage (`VehicleService`)

### 4.1 List Registered Vehicles
- **Endpoint:** `GET /api/v1/customer/vehicles`
- **Auth:** `auth:sanctum` with ability `role:customer`

### 4.2 Add Vehicle to Garage
- **Endpoint:** `POST /api/v1/customer/vehicles`
- **Auth:** `auth:sanctum` with ability `role:customer`
- **Body:** `{ make, model, year, vin?, is_default? }`

---

## 5. Orders, Multi-Vendor Checkout & Real-Time Tracking

### 5.1 Multi-Merchant Split Checkout
- **Endpoint:** `POST /api/v1/orders/checkout`
- **Auth:** `auth:sanctum` with ability `role:customer`
- **Body:**
```json
{
  "items": [
    { "product_id": "uuid", "quantity": 2 }
  ],
  "delivery_lat": 30.0444,
  "delivery_lng": 31.2357,
  "payment_type": "cod"
}
```
Creates a parent Order with UUID and sub-orders per merchant with delivery fees calculated via Haversine distance, plus 15.00 EGP service fee per sub-order.

### 5.2 Customer Orders List
- **Endpoint:** `GET /api/v1/orders`

### 5.3 Customer Order Details
- **Endpoint:** `GET /api/v1/orders/{id}`

### 5.4 Live Delivery Tracking & Rep Position
- **Endpoint:** `GET /api/v1/orders/{id}/track`
- **Returns:** `order_code`, `status`, `status_label`, `courier` (with live GPS `latitude` & `longitude` from Redis `GEOPOS`), `pickup_location`, `delivery_location`.

### 5.5 Real-Time Broadcasting (Laravel Reverb / WebSockets)
- **Private Channel:** `private-orders.{orderId}`
- **Events:** `OrderStatusUpdatedEvent`, `CourierLocationUpdatedEvent`.
