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
  "email": "ahmed@example.com", // Optional, unique
  "password": "SecurePassword123",
  "role": "customer", // "customer" | "merchant" | "courier"
  "fcm_token": "optional_fcm_registration_token",
  
  // Required only if role === "merchant":
  "store_name": "Al-Amal Auto Spare Parts",
  "commercial_registration_number": "CRN-192837",
  "address_text": "25 Ramses Street, Cairo, Egypt",
  "latitude": 30.0561,
  "longitude": 31.2394,

  // Required only if role === "courier":
  "vehicle_type": "motorcycle", // "motorcycle" | "car" | "van"
  "max_load_capacity": 20.0,
  "max_volume_capacity": 0.1,
  "max_cod_limit": 2000.0
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "user": {
      "id": "9d3c5f2b-9e12-4c28-823d-0b73c4d79a01",
      "name": "Ahmed Mohamed",
      "phone": "01012345678",
      "email": "ahmed@example.com",
      "role": "customer",
      "status": "active",
      "merchant": null,
      "courierProfile": null,
      "wallets": [
        {
          "id": "7fa2a819-0128-4ad0-bb23-e18e8d89a421",
          "user_id": "9d3c5f2b-9e12-4c28-823d-0b73c4d79a01",
          "type": "customer",
          "currency": "EGP",
          "balance": "0.00"
        }
      ]
    },
    "token": "1|sanctum_plain_text_token_value_here"
  }
}
```

### 2.2 Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Rate Limit:** 5 requests / minute (`throttle:auth`)
- **Request Body (`LoginRequest`):**
```json
{
  "login": "01012345678", // Phone or Email address
  "password": "SecurePassword123",
  "device_name": "web-storefront"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "9d3c5f2b-9e12-4c28-823d-0b73c4d79a01",
      "name": "Ahmed Mohamed",
      "phone": "01012345678",
      "email": "ahmed@example.com",
      "role": "customer",
      "status": "active"
    },
    "token": "2|sanctum_plain_text_token_value_here"
  }
}
```

### 2.3 Current User (`/me`)
- **Endpoint:** `GET /api/v1/auth/me`
- **Auth:** Required (`auth:sanctum`)
- **Response (200 OK):**
Returns the authenticated user with loaded `merchant`, `courierProfile`, `vehicles`, and `wallets`.

### 2.4 Logout
- **Endpoint:** `POST /api/v1/auth/logout`
- **Auth:** Required (`auth:sanctum`)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": null
}
```

### 2.5 Update FCM Token
- **Endpoint:** `POST /api/v1/auth/fcm-token`
- **Auth:** Required (`auth:sanctum`)
- **Body:** `{ "fcm_token": "firebase_registration_token" }`

---

## 3. Product Catalog & Search (`CatalogService`, `SearchService`)

### 3.1 Public Product Search
- **Endpoint:** `GET /api/v1/products/search`
- **Auth:** Public (`throttle:api` 60 req/min)
- **Cache:** Redis cached for 5 minutes by query fingerprint
- **Query Parameters:**
  | Parameter | Type | Required | Description |
  |---|---|---|---|
  | `q` | `string` | No | Full-text query across name, description, SKU, OEM number |
  | `make` | `string` | No | Vehicle make (e.g. "Toyota", "Hyundai") |
  | `model` | `string` | No | Vehicle model (e.g. "Corolla", "Elantra") |
  | `year` | `integer` | No | Vehicle manufacture year (e.g. 2021) |
  | `oem_number`| `string` | No | Exact OEM part number match |
  | `sku` | `string` | No | Exact internal SKU match |
  | `page` | `integer` | No | Page number (default: 1) |
  | `per_page` | `integer` | No | Items per page (default: 15, max: 50) |

- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "a0f88dc9-1d3c-4b5b-9d41-2b04fcfd7449",
      "merchant_id": "e4a2d810-72bd-4b95-a249-16ec6f2e0861",
      "name": "Front Brake Pad Set (Ceramic)",
      "sku": "BP-TY-COR-01",
      "oem_number": "04465-02220",
      "description": "High performance ceramic front brake pads for Toyota Corolla 2014-2022. Low dust and noise.",
      "price": "950.00",
      "stock_quantity": 18,
      "weight_kg": "1.80",
      "length_cm": "15.00",
      "width_cm": "10.00",
      "height_cm": "6.00",
      "condition": "new", // "new" | "used" | "refurbished"
      "is_active": true,
      "merchant": {
        "id": "e4a2d810-72bd-4b95-a249-16ec6f2e0861",
        "store_name": "Al-Basha Auto Parts",
        "address_text": "Shubra, Cairo",
        "latitude": "30.0812000",
        "longitude": "31.2489000",
        "is_active": true
      },
      "compatibilities": [
        {
          "id": "c1f7b0a8-6b8f-4cfb-81e8-7a5e01b34a92",
          "product_id": "a0f88dc9-1d3c-4b5b-9d41-2b04fcfd7449",
          "make": "Toyota",
          "model": "Corolla",
          "year_from": 2014,
          "year_to": 2022
        }
      ]
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 42
  },
  "message": null
}
```

---

## 4. Customer Vehicle Garage (`VehicleService`)

### 4.1 List Registered Vehicles
- **Endpoint:** `GET /api/v1/customer/vehicles`
- **Auth:** `auth:sanctum` with ability `role:customer`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "v1e88bc1-12a4-4df3-a129-91a03f488210",
      "user_id": "9d3c5f2b-9e12-4c28-823d-0b73c4d79a01",
      "make": "Toyota",
      "model": "Corolla",
      "year": 2019,
      "vin": "JTDBR32E123456789",
      "is_default": true,
      "created_at": "2026-10-10T12:00:00.000000Z"
    }
  ]
}
```

### 4.2 Add Vehicle to Garage
- **Endpoint:** `POST /api/v1/customer/vehicles`
- **Auth:** `auth:sanctum` with ability `role:customer`
- **Body (`AddVehicleRequest`):**
```json
{
  "make": "Hyundai",
  "model": "Elantra HD",
  "year": 2018,
  "vin": "KMHDH41DBHU123456", // Optional, 17 chars
  "is_default": true // Optional, clears other default if true
}
```

---

## 5. Orders, Multi-Vendor Checkout & Real-Time Tracking

### 5.1 Multi-Merchant Split Checkout
- **Endpoint:** `POST /api/v1/orders/checkout`
- **Auth:** `auth:sanctum` with ability `role:customer`
- **Body (`CheckoutRequest`):**
```json
{
  "items": [
    {
      "product_id": "a0f88dc9-1d3c-4b5b-9d41-2b04fcfd7449",
      "quantity": 2
    },
    {
      "product_id": "b1e99fc0-2e4d-5c6c-0e52-3c15gdfd8550",
      "quantity": 1
    }
  ],
  "delivery_lat": 30.0444,
  "delivery_lng": 31.2357,
  "payment_type": "cod" // "cod" | "card" | "wallet"
}
```

#### Order Execution Logic:
1. `CheckoutService` locks requested products via `lockForUpdate()`.
2. Validates `is_active` and `stock_quantity >= quantity`.
3. Groups items by `merchant_id`.
4. Calculates delivery fee per merchant based on Haversine distance from merchant location to delivery location.
5. Adds fixed platform service fee (15.00 EGP per merchant sub-order).
6. Atomically creates a **Parent Order** and individual **Sub-Orders** per merchant.
7. Sub-orders each receive a unique 6-digit `delivery_otp`.
8. Automatically triggers `SendSmsOtpJob` and `DispatchOrderToCouriersJob`.

- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "id": "ord-parent-uuid-12345",
    "order_code": "ORD-AB78C910DE",
    "customer_id": "9d3c5f2b-9e12-4c28-823d-0b73c4d79a01",
    "subtotal": "2400.00",
    "delivery_fee": "90.00",
    "service_fee": "30.00",
    "total_amount": "2520.00",
    "payment_type": "cod",
    "payment_status": "pending",
    "order_status": "pending",
    "delivery_lat": "30.0444000",
    "delivery_lng": "31.2357000",
    "sub_orders": [
      {
        "id": "ord-sub-uuid-1",
        "parent_id": "ord-parent-uuid-12345",
        "order_code": "ORD-AB78C910DE-SUB-1A2B3C",
        "merchant_id": "e4a2d810-72bd-4b95-a249-16ec6f2e0861",
        "subtotal": "1900.00",
        "delivery_fee": "45.00",
        "service_fee": "15.00",
        "total_amount": "1960.00",
        "order_status": "pending",
        "merchant": { "store_name": "Al-Basha Auto Parts" },
        "items": [
          {
            "product_id": "a0f88dc9-1d3c-4b5b-9d41-2b04fcfd7449",
            "quantity": "2.00",
            "unit_price": "950.00",
            "total_price": "1900.00",
            "product": { "name": "Front Brake Pad Set (Ceramic)" }
          }
        ]
      }
    ]
  }
}
```

### 5.2 Customer Orders List
- **Endpoint:** `GET /api/v1/orders`
- **Auth:** `auth:sanctum` with ability `role:customer`
- **Response:** Paginated list of parent orders with child sub-orders and items.

### 5.3 Customer Order Details
- **Endpoint:** `GET /api/v1/orders/{id}`
- **Auth:** `auth:sanctum` with ability `role:customer`
- **Response:** Full parent order hierarchy with sub-orders, items, merchant, and courier.

### 5.4 Live Delivery Tracking & Rep Position
- **Endpoint:** `GET /api/v1/orders/{id}/track`
- **Auth:** `auth:sanctum` with ability `role:customer`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "order_code": "ORD-AB78C910DE-SUB-1A2B3C",
    "status": "in_transit",
    "status_label": "In Transit",
    "courier": {
      "name": "Mahmoud Hassan",
      "phone": "01234567890",
      "vehicle_type": "motorcycle",
      "live_position": {
        "latitude": 30.0521,
        "longitude": 31.2341
      }
    },
    "pickup_location": {
      "latitude": 30.0812,
      "longitude": 31.2489
    },
    "delivery_location": {
      "latitude": 30.0444,
      "longitude": 31.2357
    }
  }
}
```

### 5.5 Real-Time Broadcasting (Laravel Reverb / WebSockets)
- **Private Channel:** `private-orders.{orderId}`
- **Events:**
  1. `OrderStatusUpdatedEvent`: Emitted when order status changes (`preparing`, `in_transit`, `delivered`).
  2. `CourierLocationUpdatedEvent`: Emitted on live courier movement with updated latitude and longitude.
- **Frontend Fallback:** The storefront polls `GET /api/v1/orders/{id}/track` every 5-10 seconds when out for delivery if WebSockets are unavailable.

---

## 6. Order Status State Machine

```
[ pending ] 
   │
   ▼
[ accepted_by_merchant ]
   │
   ▼
[ preparing ]
   │
   ▼
[ ready_for_pickup ]
   │
   ▼
[ assigned_to_courier ]
   │
   ▼
[ in_transit ]
   │
   ▼
[ delivered ] (Terminal)

* Note: Any non-terminal state may transition to [ cancelled ].
```
