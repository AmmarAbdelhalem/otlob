<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Enums\ProductCondition;
use App\Enums\RemittanceMethod;
use App\Enums\RemittanceStatus;
use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Enums\VehicleType;
use App\Enums\WalletType;
use App\Models\CourierProfile;
use App\Models\CourierRemittance;
use App\Models\CustomerVehicle;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductCompatibility;
use App\Models\User;
use App\Models\Wallet;
use App\Services\LedgerService;
use App\Services\OrderAccountingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---------------------------------------------------------------------
        // 1. System Platform Wallets
        // ---------------------------------------------------------------------
        $escrowWallet = Wallet::platformEscrow();
        $escrowWallet->update(['balance' => 50000.00]);

        $earningsWallet = Wallet::platformEarnings();
        $earningsWallet->update(['balance' => 8450.00]);

        // ---------------------------------------------------------------------
        // 2. Admin User
        // ---------------------------------------------------------------------
        $admin = User::firstOrCreate(
            ['phone' => '01000000000'],
            [
                'name' => 'General Admin',
                'email' => 'admin@otlob.com',
                'password' => 'secret123',
                'role' => UserType::ADMIN,
                'status' => UserStatus::ACTIVE,
            ]
        );

        // ---------------------------------------------------------------------
        // 3. Merchants
        // ---------------------------------------------------------------------
        // Merchant 1: Apex German Auto Spares (Downtown Cairo)
        $userM1 = User::firstOrCreate(
            ['phone' => '01011110001'],
            [
                'name' => 'Hazem Mostafa',
                'email' => 'apex@germanspares.com',
                'password' => 'secret123',
                'role' => UserType::MERCHANT,
                'status' => UserStatus::ACTIVE,
            ]
        );
        $m1Wallet = $userM1->getWallet(WalletType::MERCHANT);
        $m1Wallet->update(['balance' => 12400.00]);

        $merchant1 = Merchant::firstOrCreate(
            ['user_id' => $userM1->id],
            [
                'store_name' => 'Apex German Auto Spares',
                'commercial_register_number' => 'CR-EGY-98210',
                'address_text' => '14 Ramses Street, Downtown, Cairo',
                'latitude' => 30.0444,
                'longitude' => 31.2357,
                'is_active' => true,
            ]
        );

        // Merchant 2: Nile Japanese & Korean Parts (Nasr City)
        $userM2 = User::firstOrCreate(
            ['phone' => '01011110002'],
            [
                'name' => 'Mahmoud El-Sayed',
                'email' => 'nile@japaneseparts.com',
                'password' => 'secret123',
                'role' => UserType::MERCHANT,
                'status' => UserStatus::ACTIVE,
            ]
        );
        $m2Wallet = $userM2->getWallet(WalletType::MERCHANT);
        $m2Wallet->update(['balance' => 8950.00]);

        $merchant2 = Merchant::firstOrCreate(
            ['user_id' => $userM2->id],
            [
                'store_name' => 'Nile Japanese & Korean Parts',
                'commercial_register_number' => 'CR-EGY-77341',
                'address_text' => '58 Abbas El-Akkad, Nasr City, Cairo',
                'latitude' => 30.0561,
                'longitude' => 31.3301,
                'is_active' => true,
            ]
        );

        // Merchant 3: Pending approval
        $userM3 = User::firstOrCreate(
            ['phone' => '01011110003'],
            [
                'name' => 'Adel Basha',
                'email' => 'bavaria@parts.com',
                'password' => 'secret123',
                'role' => UserType::MERCHANT,
                'status' => UserStatus::ACTIVE,
            ]
        );
        $merchant3 = Merchant::firstOrCreate(
            ['user_id' => $userM3->id],
            [
                'store_name' => 'Bavaria Motors Spares (Pending Approval)',
                'commercial_register_number' => 'CR-EGY-55412',
                'address_text' => 'Ring Road, Maadi, Cairo',
                'latitude' => 29.9800,
                'longitude' => 31.2900,
                'is_active' => false,
            ]
        );

        // ---------------------------------------------------------------------
        // 4. Products & Fitments
        // ---------------------------------------------------------------------
        $productsData = [
            // Merchant 1 (German)
            [
                'merchant' => $merchant1,
                'name' => 'Brembo Ceramic Front Brake Pads',
                'sku' => 'BRM-P06024',
                'oem_number' => '34116774692',
                'description' => 'Original Brembo premium ceramic front brake pads. Zero dust, noiseless stopping power.',
                'price' => 1450.00,
                'stock' => 15,
                'weight' => 2.2,
                'l' => 20.0, 'w' => 14.0, 'h' => 8.5,
                'compatibilities' => [
                    ['make' => 'BMW', 'model' => '3 Series (320i)', 'from' => 2012, 'to' => 2022],
                    ['make' => 'BMW', 'model' => '5 Series (528i)', 'from' => 2011, 'to' => 2020],
                ],
            ],
            [
                'merchant' => $merchant1,
                'name' => 'Mann-Filter Oil Filter Element',
                'sku' => 'MAN-HU816X',
                'oem_number' => '11427566327',
                'description' => 'OE replacement oil filter element with synthetic seals for high thermal durability.',
                'price' => 380.00,
                'stock' => 40,
                'weight' => 0.35,
                'l' => 10.0, 'w' => 10.0, 'h' => 14.0,
                'compatibilities' => [
                    ['make' => 'BMW', 'model' => '3 Series (320i)', 'from' => 2010, 'to' => 2023],
                    ['make' => 'Mercedes-Benz', 'model' => 'C-Class (C180)', 'from' => 2014, 'to' => 2022],
                ],
            ],
            [
                'merchant' => $merchant1,
                'name' => 'Bosch Double Iridium Spark Plugs (Pack of 4)',
                'sku' => 'BSH-0242145541',
                'oem_number' => '12120039664',
                'description' => 'Laser welded 0.6mm iridium center electrode and platinum ground pin.',
                'price' => 980.00,
                'stock' => 25,
                'weight' => 0.45,
                'l' => 12.0, 'w' => 8.0, 'h' => 4.0,
                'compatibilities' => [
                    ['make' => 'BMW', 'model' => '3 Series (320i)', 'from' => 2014, 'to' => 2023],
                    ['make' => 'Volkswagen', 'model' => 'Golf 7', 'from' => 2013, 'to' => 2020],
                ],
            ],
            // Merchant 2 (Japanese & Korean)
            [
                'merchant' => $merchant2,
                'name' => 'Denso High Performance Alternator',
                'sku' => 'DNS-2100438',
                'oem_number' => '270600T040',
                'description' => '12V 100A heavy-duty OEM alternator with internal voltage regulator.',
                'price' => 4200.00,
                'stock' => 6,
                'weight' => 6.5,
                'l' => 30.0, 'w' => 25.0, 'h' => 22.0,
                'compatibilities' => [
                    ['make' => 'Toyota', 'model' => 'Corolla', 'from' => 2014, 'to' => 2023],
                    ['make' => 'Toyota', 'model' => 'Yaris', 'from' => 2015, 'to' => 2022],
                ],
            ],
            [
                'merchant' => $merchant2,
                'name' => 'Akebono Front Disc Brake Rotor Set',
                'sku' => 'AKB-BR31349',
                'oem_number' => '4351202250',
                'description' => 'Precision balanced vented brake rotor pair coated with rust-inhibitor finish.',
                'price' => 2100.00,
                'stock' => 12,
                'weight' => 14.0,
                'l' => 35.0, 'w' => 35.0, 'h' => 15.0,
                'compatibilities' => [
                    ['make' => 'Toyota', 'model' => 'Corolla', 'from' => 2016, 'to' => 2024],
                    ['make' => 'Hyundai', 'model' => 'Elantra', 'from' => 2017, 'to' => 2023],
                ],
            ],
            [
                'merchant' => $merchant2,
                'name' => 'Mobis OEM Cabin Air Filter',
                'sku' => 'MOB-97133D1000',
                'oem_number' => '97133F2000',
                'description' => 'Activated carbon cabin microfilter for allergen, PM2.5, and dust protection.',
                'price' => 290.00,
                'stock' => 50,
                'weight' => 0.25,
                'l' => 22.0, 'w' => 20.0, 'h' => 3.5,
                'compatibilities' => [
                    ['make' => 'Hyundai', 'model' => 'Elantra', 'from' => 2016, 'to' => 2023],
                    ['make' => 'Kia', 'model' => 'Cerato', 'from' => 2016, 'to' => 2022],
                ],
            ],
        ];

        foreach ($productsData as $p) {
            /** @var Product $product */
            $product = Product::firstOrCreate(
                ['sku' => $p['sku']],
                [
                    'merchant_id' => $p['merchant']->id,
                    'name' => $p['name'],
                    'oem_number' => $p['oem_number'],
                    'description' => $p['description'],
                    'price' => $p['price'],
                    'stock_quantity' => $p['stock'],
                    'weight_kg' => $p['weight'],
                    'length_cm' => $p['l'],
                    'width_cm' => $p['w'],
                    'height_cm' => $p['h'],
                    'condition' => ProductCondition::NEW,
                    'is_active' => true,
                ]
            );

            foreach ($p['compatibilities'] as $c) {
                ProductCompatibility::firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'make' => $c['make'],
                        'model' => $c['model'],
                    ],
                    [
                        'year_from' => $c['from'],
                        'year_to' => $c['to'],
                    ]
                );
            }
        }

        // ---------------------------------------------------------------------
        // 5. Couriers
        // ---------------------------------------------------------------------
        // Courier 1: Motorcycle (Downtown / active)
        $userC1 = User::firstOrCreate(
            ['phone' => '01022220001'],
            [
                'name' => 'Tarek Mansour (Motorcycle Courier)',
                'email' => 'tarek@couriers.com',
                'password' => 'secret123',
                'role' => UserType::COURIER,
                'status' => UserStatus::ACTIVE,
            ]
        );
        $c1Wallet = $userC1->getWallet(WalletType::COURIER);
        $c1Wallet->update(['balance' => 920.00]);

        $courier1 = CourierProfile::firstOrCreate(
            ['user_id' => $userC1->id],
            [
                'vehicle_type' => VehicleType::BIKE,
                'max_load_capacity' => 25.0,
                'max_volume_capacity' => 0.08,
                'max_cod_limit' => 3500.0,
                'collected_cash_in_hand' => 450.0,
                'is_cod_suspended' => false,
                'is_online' => true,
                'current_lat' => 30.0480,
                'current_lng' => 31.2390,
            ]
        );

        // Courier 2: Van (Nasr City / Heavy Cargo)
        $userC2 = User::firstOrCreate(
            ['phone' => '01022220002'],
            [
                'name' => 'Hassan Ezzat (Cargo Van Courier)',
                'email' => 'hassan@couriers.com',
                'password' => 'secret123',
                'role' => UserType::COURIER,
                'status' => UserStatus::ACTIVE,
            ]
        );
        $c2Wallet = $userC2->getWallet(WalletType::COURIER);
        $c2Wallet->update(['balance' => 1650.00]);

        $courier2 = CourierProfile::firstOrCreate(
            ['user_id' => $userC2->id],
            [
                'vehicle_type' => VehicleType::VAN,
                'max_load_capacity' => 250.0,
                'max_volume_capacity' => 1.8,
                'max_cod_limit' => 10000.0,
                'collected_cash_in_hand' => 1200.0,
                'is_cod_suspended' => false,
                'is_online' => true,
                'current_lat' => 30.0520,
                'current_lng' => 31.3200,
            ]
        );

        // Courier 3: Suspended for COD limit with pending remittance
        $userC3 = User::firstOrCreate(
            ['phone' => '01022220003'],
            [
                'name' => 'Karim Zaki (COD Suspended Courier)',
                'email' => 'karim@couriers.com',
                'password' => 'secret123',
                'role' => UserType::COURIER,
                'status' => UserStatus::ACTIVE,
            ]
        );
        $c3Wallet = $userC3->getWallet(WalletType::COURIER);
        $c3Wallet->update(['balance' => 340.00]);

        $courier3 = CourierProfile::firstOrCreate(
            ['user_id' => $userC3->id],
            [
                'vehicle_type' => VehicleType::CAR,
                'max_load_capacity' => 80.0,
                'max_volume_capacity' => 0.5,
                'max_cod_limit' => 3000.0,
                'collected_cash_in_hand' => 4500.0, // Exceeds 3000
                'is_cod_suspended' => true, // Suspended
                'is_online' => true,
                'current_lat' => 30.0100,
                'current_lng' => 31.2100,
            ]
        );

        // Remittance pending approval for Courier 3
        CourierRemittance::firstOrCreate(
            ['reference_number' => 'REM-EGY-78192'],
            [
                'courier_id' => $userC3->id,
                'amount' => 2500.00,
                'method' => RemittanceMethod::INSTAPAY,
                'status' => RemittanceStatus::PENDING,
                'proof_receipt_path' => 'receipts/instapay_proof_78192.png',
            ]
        );

        // ---------------------------------------------------------------------
        // 6. Customer & Garage
        // ---------------------------------------------------------------------
        $customer = User::firstOrCreate(
            ['phone' => '01012345678'],
            [
                'name' => 'Mohamed Ali',
                'email' => 'mohamed.ali@customer.com',
                'password' => 'secret123',
                'role' => UserType::CUSTOMER,
                'status' => UserStatus::ACTIVE,
            ]
        );
        $customer->getWallet(WalletType::CUSTOMER);

        CustomerVehicle::firstOrCreate(
            ['user_id' => $customer->id, 'vin' => 'JTDBR32E200192831'],
            [
                'make' => 'Toyota',
                'model' => 'Corolla',
                'year' => 2020,
                'is_default' => true,
            ]
        );

        CustomerVehicle::firstOrCreate(
            ['user_id' => $customer->id, 'vin' => 'WBA3A5C55FP102948'],
            [
                'make' => 'BMW',
                'model' => '3 Series (320i)',
                'year' => 2019,
                'is_default' => false,
            ]
        );

        // ---------------------------------------------------------------------
        // 7. Seed Sample Orders in different stages for live demonstration
        // ---------------------------------------------------------------------
        $prodBrembo = Product::where('sku', 'BRM-P06024')->first();
        $prodRotors = Product::where('sku', 'AKB-BR31349')->first();

        // Order 1: Ready for pickup / Offer Available
        $parentOrder1 = Order::firstOrCreate(
            ['order_code' => 'ORD-DEMO-001'],
            [
                'customer_id' => $customer->id,
                'subtotal' => 1450.00,
                'delivery_fee' => 45.00,
                'service_fee' => 15.00,
                'total_amount' => 1510.00,
                'payment_type' => PaymentType::COD,
                'payment_status' => PaymentStatus::PENDING,
                'order_status' => OrderStatus::READY_FOR_PICKUP,
                'delivery_lat' => 30.0600,
                'delivery_lng' => 31.2500,
                'delivery_otp' => '482103',
            ]
        );

        $subOrder1 = Order::firstOrCreate(
            ['order_code' => 'ORD-DEMO-001-SUB-1'],
            [
                'parent_id' => $parentOrder1->id,
                'customer_id' => $customer->id,
                'merchant_id' => $merchant1->id,
                'courier_id' => null, // Available for pickup
                'subtotal' => 1450.00,
                'delivery_fee' => 45.00,
                'service_fee' => 15.00,
                'total_amount' => 1510.00,
                'payment_type' => PaymentType::COD,
                'payment_status' => PaymentStatus::PENDING,
                'order_status' => OrderStatus::READY_FOR_PICKUP,
                'delivery_lat' => 30.0600,
                'delivery_lng' => 31.2500,
                'delivery_otp' => '482103',
            ]
        );

        if ($prodBrembo) {
            OrderItem::firstOrCreate(
                ['order_id' => $subOrder1->id, 'product_id' => $prodBrembo->id],
                [
                    'quantity' => 1,
                    'unit_price' => 1450.00,
                    'total_price' => 1450.00,
                ]
            );
        }

        // Order 2: In Transit by Courier 1
        $parentOrder2 = Order::firstOrCreate(
            ['order_code' => 'ORD-DEMO-002'],
            [
                'customer_id' => $customer->id,
                'subtotal' => 2100.00,
                'delivery_fee' => 60.00,
                'service_fee' => 15.00,
                'total_amount' => 2175.00,
                'payment_type' => PaymentType::COD,
                'payment_status' => PaymentStatus::PENDING,
                'order_status' => OrderStatus::IN_TRANSIT,
                'delivery_lat' => 30.0400,
                'delivery_lng' => 31.2200,
                'delivery_otp' => '719352',
            ]
        );

        $subOrder2 = Order::firstOrCreate(
            ['order_code' => 'ORD-DEMO-002-SUB-1'],
            [
                'parent_id' => $parentOrder2->id,
                'customer_id' => $customer->id,
                'merchant_id' => $merchant2->id,
                'courier_id' => $courier1->id,
                'subtotal' => 2100.00,
                'delivery_fee' => 60.00,
                'service_fee' => 15.00,
                'total_amount' => 2175.00,
                'payment_type' => PaymentType::COD,
                'payment_status' => PaymentStatus::PENDING,
                'order_status' => OrderStatus::IN_TRANSIT,
                'delivery_lat' => 30.0400,
                'delivery_lng' => 31.2200,
                'delivery_otp' => '719352',
            ]
        );

        if ($prodRotors) {
            OrderItem::firstOrCreate(
                ['order_id' => $subOrder2->id, 'product_id' => $prodRotors->id],
                [
                    'quantity' => 1,
                    'unit_price' => 2100.00,
                    'total_price' => 2100.00,
                ]
            );
        }
    }
}
