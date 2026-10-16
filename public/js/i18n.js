/**
 * Otlob Auto Parts Platform — Comprehensive Arabic & English Localization Engine
 * Provides instant clientside translation, RTL/LTR layout flipping, and localized formatting.
 */
(function() {
    const translations = {
        en: {
            // Header & Navigation
            brand_name: "OTLOB",
            brand_tag: "Parts",
            nav_customer: "Customer Store",
            nav_merchant: "Merchant Portal",
            nav_courier: "Courier App",
            nav_admin: "Admin Ops",
            nav_hub: "Platform Hub",
            logged_in: "Logged in",
            logout: "Logout",
            lang_toggle_btn: "العربية",
            role_customer: "Customer",
            role_merchant: "Merchant",
            role_courier: "Courier",
            role_admin: "Admin",
            currency: "EGP",

            // Footer
            footer_rights: "Otlob On-Demand Auto Parts Marketplace © 2026 — Built with Laravel 12, Redis, & Double-Entry Accounting",
            footer_scale: "Scalable for 5M+ Users",
            footer_ledger: "Micro-second Ledger Integrity",

            // Hub Launchpad
            hub_badge: "Backend Live & Tested • 4 Integrated Frontends",
            hub_title: "One Platform. Four Unified Ecosystems.",
            hub_subtitle: "Seamless auto parts on-demand delivery connecting Customers, Merchants, and Couriers under strict Double-Entry Financial Accounting and Admin Operations.",
            hub_btn_customer: "Launch Customer Store",
            hub_btn_merchant: "Launch Merchant Portal",
            hub_btn_courier: "Launch Courier App",
            hub_btn_admin: "Admin Operations",

            card_customer_title: "Customer App",
            card_customer_role: "Storefront",
            card_customer_desc: "Vehicle garage selection, OEM & fitment catalog search, multi-merchant split cart, delivery fee calculator, and real-time GPS tracking.",
            card_customer_f1: "Auto Order-Splitting by Merchant",
            card_customer_f2: "Unique 6-Digit Delivery OTP",
            card_customer_f3: "Garage Car Management",
            card_customer_action: "Enter Customer Store →",
            card_customer_demo: "1-Click Demo Login (Mohamed)",

            card_merchant_title: "Merchant Portal",
            card_merchant_role: "Store Manager",
            card_merchant_desc: "Publish automotive parts with dimensions (m³) and vehicle compatibility models, live inventory adjust, sub-order fulfillment, and wallet statements.",
            card_merchant_f1: "Vehicle Fitment Year Ranges",
            card_merchant_f2: "Order Preparation Kanban",
            card_merchant_f3: "Wallet Statement & Balance",
            card_merchant_action: "Enter Merchant Portal →",
            card_merchant_demo: "1-Click Demo Login (Apex Auto)",

            card_courier_title: "Courier App",
            card_courier_role: "Delivery Fleet",
            card_courier_desc: "Online beacon status, Redis GPS broadcast, dispatched sub-order discovery, cargo weight/volume checks, OTP delivery verification, and cash remittance.",
            card_courier_f1: "Volumetric Cargo Filtering",
            card_courier_f2: "COD Limit Safety Shield",
            card_courier_f3: "OTP Ledger Auto-Settlement",
            card_courier_action: "Enter Courier App →",
            card_courier_demo: "1-Click Demo Login (Tarek Bike)",

            card_admin_title: "Admin Operations",
            card_admin_role: "Governance",
            card_admin_desc: "Live system GMV, escrow balance, service fee revenue, merchant approvals, courier COD audits, and 1-click cash remittance double-entry clearance.",
            card_admin_f1: "Double-Entry Journal Audit",
            card_admin_f2: "Merchant & Driver Approvals",
            card_admin_f3: "Global Sub-Orders Oversight",
            card_admin_action: "Enter Admin Operations →",
            card_admin_demo: "1-Click Demo Login (Admin)",

            flow_title: "End-to-End Split-Delivery Lifecycle",
            flow_subtitle: "Watch how every action in one portal immediately affects the others through shared database state, Redis tracking, and automated double-entry ledger settlement:",
            flow_step1_title: "Cart Split Checkout",
            flow_step1_desc: "Customer places order. Items group by merchant. Individual sub-orders generate with separate delivery fees and secret OTPs.",
            flow_step2_title: "Store Preparation",
            flow_step2_desc: "Merchants see their sub-orders. Once marked 'Ready for Pickup', Redis proximity discovery alerts nearby qualified couriers.",
            flow_step3_title: "Courier Fleet Claim",
            flow_step3_desc: "Courier accepts order, picks up items, and starts live GPS tracking towards customer drop-off location.",
            flow_step4_title: "OTP Settlement",
            flow_step4_desc: "Courier enters customer's 6-digit OTP. Ledger atomically disburses courier shipping, merchant parts payment, and platform service fees.",

            // Customer Portal
            cust_garage_selected: "My Selected Garage Car:",
            cust_my_garage: "My Garage",
            cust_cart: "Cart",
            cust_active_order_banner: "Active Order In Progress",
            cust_view_tracking: "View Live Tracking & OTP",
            cust_search_placeholder: "Search by Part Name, OEM Number (e.g. 34116774692), or SKU...",
            cust_filter_make: "Make (e.g. BMW)",
            cust_filter_model: "Model (e.g. 3 Series)",
            cust_filter_year: "Year (2020)",
            cust_btn_filter: "Filter",
            cust_quick_tags: "Quick Tags:",
            cust_tag_brakes: "Brakes & Rotors",
            cust_tag_filters: "Filters & Fluids",
            cust_tag_ignition: "Ignition & Plugs",
            cust_tag_alternator: "Alternator & Starter",
            cust_catalog_title: "Verified Auto Parts Catalog",
            cust_loading_catalog: "Loading catalog...",
            cust_unit_price: "Unit Price",
            cust_add_to_cart: "Add",
            cust_in_stock: "In Stock",
            cust_out_of_stock: "Out of Stock",
            cust_no_compatible: "No compatible parts found matching filters.",
            cust_clear_filters_hint: "Try clearing filters to view all available parts.",
            cust_showing_parts: "Showing {count} parts in stock",

            // Cart Drawer
            cart_drawer_title: "Your Shopping Cart",
            cart_split_notice_title: "Multi-Merchant Split Delivery:",
            cart_split_notice_desc: "Items from different stores will create independent sub-orders with dedicated courier dispatching.",
            cart_empty: "Your cart is empty. Add parts from the catalog.",
            cart_subtotal: "Parts Subtotal:",
            cart_delivery_fees: "Est. Delivery Fees (per store):",
            cart_service_fees: "Platform Service Fees:",
            cart_total: "Total Amount:",
            cart_payment_method: "Payment Method",
            payment_cod: "Cash On Delivery (COD)",
            payment_card: "Credit / Debit Card (Online Escrow)",
            payment_wallet: "Customer In-App Wallet",
            cart_btn_checkout: "Confirm & Place Split Order",
            cart_placing_order: "Placing Split Order...",

            // Garage Modal
            garage_modal_title: "My Car Garage",
            garage_add_heading: "Add Vehicle to Garage",
            garage_make: "Make (e.g. BMW)",
            garage_model: "Model (e.g. 320i)",
            garage_year: "Year (2020)",
            garage_vin: "VIN (Optional 17-char code)",
            garage_btn_save: "Save Car to Garage",
            garage_default_badge: "Default",

            // Tracking Modal
            track_modal_title: "Live Order Tracking",
            track_otp_label: "Your Secret Delivery Verification OTP",
            track_otp_hint: "Give this 6-digit code to your driver when the parts arrive to confirm delivery.",
            track_suborders_heading: "Sub-Orders & Delivery Status",
            track_looking_courier: "Looking for Nearby Couriers",
            track_dispatched_hint: "Dispatched to nearby fleet...",
            track_assigned_driver: "Assigned Courier",
            track_suborder: "Sub-Order",
            track_fee: "Fee",
            track_courier: "Courier",
            track_vehicle: "Vehicle",
            track_phone: "Phone",
            track_searching: "SEARCHING",
            track_in_progress: "IN PROGRESS",
            track_order: "Order",
            cart_delivery_est: "Delivery",
            reset_filters: "Reset Filters",
            cust_default_car: "Default",

            // Merchant Portal
            merch_store: "Merchant Store",
            merch_cr: "CR",
            merch_tab_orders: "Store Sub-Orders",
            merch_tab_catalog: "Store Catalog",
            merch_tab_wallet: "Financial Wallet",
            merch_btn_add_product: "Add New Auto Part",
            merch_orders_count: "incoming orders",
            merch_orders_title: "Store Order Queue",
            merch_refresh_orders: "Refresh Orders",
            merch_catalog_title: "Store Auto Parts Catalog",
            merch_catalog_hint: "Click Edit Stock to update inventory levels instantly",
            merch_active_store: "Active Store",
            merch_suborder: "Sub-Order",
            merch_customer: "Customer",
            merch_placed: "Placed",
            merch_subtotal_payout: "Subtotal Payout",
            merch_btn_accept: "Accept Order",
            merch_btn_preparing: "Start Preparing",
            merch_btn_ready: "Ready for Pickup (Dispatch)",
            merch_status_dispatched: "Dispatched to Couriers",
            merch_status_enroute: "Courier En Route to Store",
            merch_status_intransit: "Picked Up & In Transit",
            merch_status_delivered: "Delivered & Settled",
            merch_courier_assigned: "Courier",
            merch_awaiting_courier: "Awaiting courier assignment",
            merch_no_orders: "No sub-orders received yet. Waiting for customer checkouts.",
            merch_fetching_orders: "Fetching store sub-orders...",
            merch_name_ph: "e.g. Brembo Front Brake Disc Set",
            merch_sku_ph: "e.g. BRM-P06024",
            merch_oem_ph: "e.g. 34116774692",
            merch_desc_ph: "Full part specifications...",
            merch_price_ph: "1250.00",
            merch_stock_ph: "20",
            merch_prompt_stock: "Enter new stock quantity:",
            merch_balanced: "Mathematically Balanced",
            th_actions: "Actions",
            th_datetime: "Date & Time",
            th_transaction: "Transaction",
            th_entry_type: "Entry Type",
            th_amount: "Amount",
            th_running_balance: "Running Balance",

            // Merchant Catalog & Add Product Modal
            merch_th_part: "Part Details",
            merch_th_sku: "SKU / OEM",
            merch_th_specs: "Cargo Dimensions",
            merch_th_price: "Price",
            merch_th_stock: "Stock Level",
            merch_btn_update_stock: "Update Stock",
            merch_modal_add_title: "Add New Automotive Part",
            merch_lbl_name: "Part Name",
            merch_lbl_sku: "SKU Code",
            merch_lbl_oem: "OEM Number",
            merch_lbl_desc: "Description",
            merch_lbl_price: "Price (EGP)",
            merch_lbl_stock: "Initial Stock",
            merch_lbl_cargo_dims: "Cargo & Volumetric Dimensions (For Dispatch Engine)",
            merch_lbl_weight: "Weight (kg)",
            merch_lbl_len: "Length (cm)",
            merch_lbl_width: "Width (cm)",
            merch_lbl_height: "Height (cm)",
            merch_lbl_fitment: "Vehicle Compatibility Model",
            merch_fit_make: "Make (e.g. BMW)",
            merch_fit_model: "Model (e.g. 320i)",
            merch_fit_from: "From (2012)",
            merch_fit_to: "To (2022)",
            merch_btn_publish: "Publish Product to Marketplace",

            // Merchant Wallet
            merch_wallet_balance: "Available Merchant Balance",
            merch_wallet_escrow: "In-Transit Escrow",
            merch_wallet_statement: "Double-Entry Ledger Transactions",
            merch_no_trans: "No wallet transactions recorded yet.",

            // Courier Portal
            courier_fleet_title: "Ready for Dispatches",
            courier_ping_gps: "Ping GPS Beacon",
            courier_go_offline: "Go Offline",
            courier_go_online: "Go Online",
            courier_online_label: "Online • Ready for Dispatches",
            courier_offline_label: "Offline (Beacon Inactive)",
            courier_cod_cash_in_hand: "Collected Cash in Hand (COD Debt):",
            courier_cod_limit: "Limit:",
            courier_cod_active: "COD Active",
            courier_cod_suspended: "COD Suspended (Limit Exceeded)",
            courier_btn_deposit_cash: "Deposit Cash (Clear Debt)",
            courier_active_task_title: "Active Delivery in Progress",
            courier_step_pickup: "1. Store Pickup",
            courier_step_drop: "2. Customer Drop-off",
            courier_btn_confirm_pickup: "Confirm Store Pickup (Start Transit)",
            courier_btn_picked_up: "Picked Up from Store",
            courier_btn_enter_otp: "Enter Customer OTP to Complete",
            courier_nearby_offers: "Nearby Available Order Offers",
            courier_scan_proximity: "Scan Proximity",
            courier_scanning: "Scanning available orders...",
            courier_payout: "Courier Payout",
            courier_btn_claim_offer: "Claim Offer →",
            courier_cargo: "Cargo",
            courier_items: "items",
            courier_dropoff: "Drop-off",
            courier_no_offers: "No orders awaiting courier pickup in your area right now.",
            courier_offers_auto: "Ready orders marked by merchants will automatically appear here.",
            courier_total_earnings: "Courier Payout Earnings",
            courier_refresh_stmt: "Refresh Statement",
            courier_no_stmt: "No recent delivery transactions.",

            // Courier Modals
            otp_modal_title: "Enter Customer OTP",
            otp_modal_desc: "Ask the customer for their 6-digit confirmation code to finish the delivery and trigger instant payment payout.",
            otp_btn_verify: "Verify & Settle",
            otp_settling: "Settling...",
            btn_cancel: "Cancel",
            remit_modal_title: "Submit Cash Clearance",
            remit_modal_desc: "Transfer collected COD cash to Otlob platform bank or InstaPay, then upload the deposit receipt below to clear your driver debt.",
            remit_lbl_amount: "Deposit Amount (EGP)",
            remit_lbl_method: "Transfer Method",
            remit_opt_instapay: "InstaPay App",
            remit_opt_fawry: "Fawry POS",
            remit_opt_bank: "CIB Bank Transfer",
            remit_opt_cash: "Direct Branch Cash Deposit",
            remit_btn_submit: "Submit Receipt for Admin Audit",

            // Admin Portal
            admin_kpi_earnings: "Platform Service Revenue",
            admin_kpi_earnings_sub: "Net platform service fees & commission",
            admin_kpi_escrow: "Active Escrow Vault",
            admin_kpi_escrow_sub: "Holding funds for pending card settlements",
            admin_kpi_gmv: "Gross Merchandise Value",
            admin_kpi_gmv_sub: "Lifetime marketplace transaction volume",
            admin_kpi_delivered: "Delivered Sub-Orders",
            admin_kpi_delivered_sub: "100% Verified OTP settlements",
            admin_tab_merchants: "Pending Stores",
            admin_tab_couriers: "Courier Fleet Audits",
            admin_tab_remittances: "Cash Remittances",
            admin_tab_orders: "Global Live Orders",
            admin_btn_approve_store: "Approve Store",
            admin_btn_unfreeze_courier: "Manual Unfreeze",
            admin_btn_audit_settle: "Audit & Settle Debt",
            admin_no_pending_stores: "No pending merchant applications. All stores are verified.",
            admin_no_pending_remit: "All remittance deposit receipts have been audited and settled.",
            admin_no_orders: "No orders recorded in the platform yet.",
            admin_submitted: "Submitted",
            admin_merchants_heading: "Merchant Stores Awaiting Certification",
            admin_refresh_list: "Refresh List",
            admin_pending_review: "Pending Review",
            admin_owner: "Owner",
            admin_couriers_heading: "Courier Driver Fleet & COD Limits",
            admin_couriers_sub: "Drivers exceeding COD limit are automatically suspended",
            admin_remittances_heading: "Courier Remittance Deposits (Double-Entry Clearance)",
            admin_remittances_sub: "Auditing deposit receipt clears driver liability in ledger",
            admin_orders_heading: "Global Order Flow Oversight",
            admin_orders_sub: "Parent & Sub-Orders with OTP states",
            admin_total: "Total",
            admin_via: "via",
            admin_normal_standing: "Normal Standing",
            admin_active_fleet: "Active Fleet",

            // Order Statuses
            status_pending: "Pending",
            status_accepted_by_merchant: "Accepted by Merchant",
            status_preparing: "Preparing",
            status_ready_for_pickup: "Ready for Pickup",
            status_assigned_to_courier: "Assigned to Courier",
            status_in_transit: "In Transit",
            status_delivered: "Delivered",
            status_cancelled: "Cancelled",

            // Toasts & Messages
            toast_auth_demo: "Authenticating demo account...",
            toast_login_success: "Login successful!",
            toast_logout_success: "Logged out.",
            toast_added_to_cart: "Added {name} to cart.",
            toast_cart_empty: "Your cart is empty.",
            toast_order_placed: "Order confirmed and split successfully!",
            toast_fill_car: "Please fill make, model, and year.",
            toast_car_saved: "Car added to garage!",
            toast_transitioning: "Transitioning order to {status}...",
            toast_order_updated: "Order status updated and couriers notified!",
            toast_product_uploaded: "Product uploaded successfully!",
            toast_fill_mandatory: "Please fill all mandatory product fields.",
            toast_stock_updated: "Stock updated successfully.",
            toast_gps_pinged: "GPS Beacon pinged to Redis ({lat}, {lng})",
            toast_claiming_offer: "Claiming order offer...",
            toast_offer_accepted: "Order offer accepted! Heading to store for pickup.",
            toast_confirming_pickup: "Confirming store pickup...",
            toast_picked_up: "Parts confirmed! Order is now in transit to customer.",
            toast_enter_otp_digits: "Please enter the 6-digit OTP code.",
            toast_no_active_delivery: "No active delivery to settle.",
            toast_delivery_verified: "Delivery verified! Double-entry ledger settled.",
            toast_invalid_otp: "Invalid OTP. Please verify with customer.",
            toast_valid_deposit: "Please enter a valid deposit amount.",
            toast_remit_submitted: "Remittance submitted for admin clearance!",
            toast_store_approved: "Merchant store approved and activated!",
            toast_courier_unfrozen: "Courier profile unfrozen and COD limit refreshed."
        },
        ar: {
            // Header & Navigation
            brand_name: "اطلب",
            brand_tag: "قطع غيار",
            nav_customer: "متجر العملاء",
            nav_merchant: "بوابة التجار",
            nav_courier: "تطبيق المندوبين",
            nav_admin: "لوحة الإدارة",
            nav_hub: "المنصة الرئيسية",
            logged_in: "متصل الآن",
            logout: "خروج",
            lang_toggle_btn: "English",
            role_customer: "عميل",
            role_merchant: "تاجر",
            role_courier: "مندوب",
            role_admin: "مدير المنصة",
            currency: "ج.م",

            // Footer
            footer_rights: "سوق اطلب لقطع غيار السيارات الفورية © 2026 — بنية برمجية متطورة بـ Laravel 12 و Redis وقيود دفتر أستاذ مزدوج",
            footer_scale: "مهيأ لتحمل +5 مليون مستخدم",
            footer_ledger: "نزاهة مالية فورية بالمللي ثانية",

            // Hub Launchpad
            hub_badge: "النظام البرمجي نشط ومفحوص • 4 واجهات ويب متكاملة",
            hub_title: "منصة واحدة. أربعة أنظمة بيئية متكاملة.",
            hub_subtitle: "منظومة فورية متكاملة لتوصيل قطع غيار السيارات تربط بين العملاء والتجار والمناديب تحت حوكمة مالية بدفتر أستاذ مزدوج وإدارة تشغيلية عليا.",
            hub_btn_customer: "تشغيل متجر العملاء",
            hub_btn_merchant: "تشغيل بوابة التجار",
            hub_btn_courier: "تشغيل تطبيق المندوبين",
            hub_btn_admin: "لوحة تحكم الإدارة",

            card_customer_title: "تطبيق العملاء",
            card_customer_role: "واجهة التسوق",
            card_customer_desc: "اختيار سيارة من المرآب، بحث برقم القطعة الأصلية والموديل، سلة تسوق مشتتة للمتاجر المتعددة، احتساب رسوم التوصيل، وتتبع حي عبر الخريطة.",
            card_customer_f1: "تقسيم تلقائي للطلبات بحسب المتجر",
            card_customer_f2: "رمز سري فريد (OTP) من 6 أرقام للتسليم",
            card_customer_f3: "إدارة مرآب سيارات العميل",
            card_customer_action: "دخول متجر العملاء ←",
            card_customer_demo: "دخول تجريبي بضغطة واحدة (محمد)",

            card_merchant_title: "بوابة التجار",
            card_merchant_role: "إدارة المتجر",
            card_merchant_desc: "إضافة قطع غيار بالأبعاد الحجمية والوزن وموديلات السيارات المتوافقة، تعديل المخزون، معالجة الطلبات الفرعية، وكشف حساب المحفظة.",
            card_merchant_f1: "تحديد سنوات توافق السيارات",
            card_merchant_f2: "لوحة متابعة مراحل التجهيز",
            card_merchant_f3: "رصيد المحفظة وكشف المعاملات",
            card_merchant_action: "دخول بوابة التجار ←",
            card_merchant_demo: "دخول تجريبي بضغطة واحدة (أبيكس أوتو)",

            card_courier_title: "تطبيق المناديب",
            card_courier_role: "أسطول التوصيل",
            card_courier_desc: "إرسال إحداثيات GPS حية، استكشاف عروض الطلبات المتاحة، فحص أوزان وأحجام الشحنات، التحقق من رمز التسليم، وتسوية التوريدات النقدية.",
            card_courier_f1: "فلترة الشحنات بحسب طاقة المركبة",
            card_courier_f2: "حماية سقف المديونية النقدية (COD)",
            card_courier_f3: "تسوية مالية تلقائية بالدفتر فور رمز OTP",
            card_courier_action: "دخول تطبيق المندوب ←",
            card_courier_demo: "دخول تجريبي بضغطة واحدة (طارق - دراجة نارية)",

            card_admin_title: "لوحة العمليات الإدارية",
            card_admin_role: "الحوكمة والإشراف",
            card_admin_desc: "متابعة إجمالي قيمة التداول، رصيد الضمان المعلق، عمولات المنصة، اعتماد المتاجر، تدقيق مديونيات المناديب، وتسوية التوريدات المالية.",
            card_admin_f1: "تدقيق قيود اليومية ودفتر الأستاذ",
            card_admin_f2: "اعتماد طلبات انضمام التجار والمناديب",
            card_admin_f3: "رقابة شاملة على جميع الطلبات الفرعية",
            card_admin_action: "دخول لوحة الإدارة ←",
            card_admin_demo: "دخول تجريبي بضغطة واحدة (المدير)",

            flow_title: "دورة حياة الطلب المقسم من البداية حتى التسليم",
            flow_subtitle: "شاهد كيف تؤثر كل خطوة في إحدى البوابات فورياً على باقي البوابات عبر قاعدة بيانات موحدة، وتتبع Redis، وتسوية دفتر الأستاذ المزدوج:",
            flow_step1_title: "تقسيم السلة والدفع",
            flow_step1_desc: "يقوم العميل بالطلب، فتتجمع المنتجات بحسب التاجر، وتنشأ طلبات فرعية مستقلة برسوم شحن ورموز OTP خاصة بكل تاجر.",
            flow_step2_title: "تجهيز المتجر",
            flow_step2_desc: "يستقبل التاجر طلبه الفرعي، وعند تأكيد 'جاهز للاستلام'، ينبه محرك البحث الجغرافي المناديب المؤهلين في المحيط.",
            flow_step3_title: "قبول المندوب للشحنة",
            flow_step3_desc: "يقبل المندوب العرض، ويستلم القطع من المتجر، ويبدأ بث إحداثيات موقعه الحي متوجهاً لعنوان العميل.",
            flow_step4_title: "التسليم ورمز OTP",
            flow_step4_desc: "يدخل المندوب رمز OTP السري المسلم من العميل، فيقوم دفتر الأستاذ تلقائياً بتحويل مستحقات المندوب والمتجر والمنصة.",

            // Customer Portal
            cust_garage_selected: "السيارة المحددة من المرآب:",
            cust_my_garage: "مرآبي",
            cust_cart: "السلة",
            cust_active_order_banner: "طلبك قيد التنفيذ حالياً",
            cust_view_tracking: "متابعة التتبع الحي ورمز التسليم",
            cust_search_placeholder: "ابحث باسم القطعة، أو رقم OEM (مثال: 34116774692)، أو الكود...",
            cust_filter_make: "الشركة (مثل BMW)",
            cust_filter_model: "الموديل (مثل الفئة 3)",
            cust_filter_year: "السنة (2020)",
            cust_btn_filter: "تصفية",
            cust_quick_tags: "تصنيفات سريعة:",
            cust_tag_brakes: "الفرامل وتيل الفرامل",
            cust_tag_filters: "الفلاتر والزيوت",
            cust_tag_ignition: "البوجيهات والإشعال",
            cust_tag_alternator: "الدينامو والمارش",
            cust_catalog_title: "كتالوج قطع الغيار المعتمدة",
            cust_loading_catalog: "جاري تحميل الكتالوج...",
            cust_unit_price: "سعر الوحدة",
            cust_add_to_cart: "إضافة",
            cust_in_stock: "متوفر",
            cust_out_of_stock: "غير متوفر",
            cust_no_compatible: "لم يتم العثور على قطع متوافقة مع الفلاتر.",
            cust_clear_filters_hint: "جرب إعادة تعيين الفلاتر لعرض جميع القطع المتاحة.",
            cust_showing_parts: "عرض {count} قطعة متوفرة في المخزون",

            // Cart Drawer
            cart_drawer_title: "سلة المشتريات الخاصة بك",
            cart_split_notice_title: "توصيل مقسم من متاجر متعددة:",
            cart_split_notice_desc: "القطع المشتراة من متاجر مختلفة ستنشئ طلبات فرعية مستقلة مع مندوب توصيل خاص لكل متجر.",
            cart_empty: "سلتك فارغة حالياً. أضف قطع الغيار من الكتالوج.",
            cart_subtotal: "مجموع قطع الغيار:",
            cart_delivery_fees: "رسوم التوصيل المقدرة (لكل متجر):",
            cart_service_fees: "رسوم خدمة المنصة:",
            cart_total: "المبلغ الإجمالي:",
            cart_payment_method: "طريقة الدفع",
            payment_cod: "الدفع نقداً عند الاستلام (COD)",
            payment_card: "بطاقة بنكية / فيزا (دفع إلكتروني معلق)",
            payment_wallet: "رصيد محفظة العميل",
            cart_btn_checkout: "تأكيد وإنشاء الطلبات المقسمة",
            cart_placing_order: "جاري إنشاء وتوجيه الطلبات...",

            // Garage Modal
            garage_modal_title: "مرآب سياراتي",
            garage_add_heading: "إضافة سيارة جديدة للمرآب",
            garage_make: "الشركة (مثال: تويوتا)",
            garage_model: "الموديل (مثال: كورولا)",
            garage_year: "سنة الصنع (2020)",
            garage_vin: "رقم الشاسيه VIN (اختياري 17 حرف)",
            garage_btn_save: "حفظ السيارة في المرآب",
            garage_default_badge: "الافتراضية",

            // Tracking Modal
            track_modal_title: "التتبع المباشر للطلب",
            track_otp_label: "رمز التحقق السري لتسليم الطلب (OTP)",
            track_otp_hint: "أعطِ هذا الرمز السري المكون من 6 أرقام للمندوب عند وصول القطع لتأكيد الاستلام وإنهاء الشحنة.",
            track_suborders_heading: "الطلبات الفرعية وحالة كل شحنة",
            track_looking_courier: "جاري البحث عن مندوب قريب",
            track_dispatched_hint: "تم إرسال العرض لمناديب المنطقة...",
            track_assigned_driver: "المندوب المعين",
            track_suborder: "طلب فرعي",
            track_fee: "أجرة التوصيل",
            track_courier: "المندوب",
            track_vehicle: "نوع المركبة",
            track_phone: "الهاتف",
            track_searching: "جاري البحث",
            track_in_progress: "قيد التنفيذ",
            track_order: "طلب",
            cart_delivery_est: "توصيل",
            reset_filters: "إعادة ضبط الفلاتر",
            cust_default_car: "الافتراضية",

            // Merchant Portal
            merch_store: "متجر التاجر",
            merch_cr: "س.ت",
            merch_tab_orders: "طلبات المتجر الفرعية",
            merch_tab_catalog: "كتالوج المنتجات",
            merch_tab_wallet: "المحفظة والحساب المالي",
            merch_btn_add_product: "إضافة قطعة غيار جديدة",
            merch_orders_count: "طلبات واردة",
            merch_orders_title: "قائمة طلبات المتجر",
            merch_refresh_orders: "تحديث الطلبات",
            merch_catalog_title: "كتالوج قطع غيار المتجر",
            merch_catalog_hint: "اضغط على تعديل المخزون لتحديث الكميات فورياً",
            merch_active_store: "متجر معتمد ونشط",
            merch_suborder: "طلب فرعي",
            merch_customer: "العميل",
            merch_placed: "تاريخ الطلب",
            merch_subtotal_payout: "مستحقات المتجر",
            merch_btn_accept: "قبول الطلب",
            merch_btn_preparing: "بدء التجهيز",
            merch_btn_ready: "جاهز للاستلام (توجيه للمناديب)",
            merch_status_dispatched: "معروض على المناديب",
            merch_status_enroute: "المندوب في الطريق للمتجر",
            merch_status_intransit: "تم الاستلام وجاري التوصيل",
            merch_status_delivered: "تم التسليم للعميل والتسوية",
            merch_courier_assigned: "المندوب",
            merch_awaiting_courier: "بانتظار قبول المندوب",
            merch_no_orders: "لا توجد طلبات واردة حالياً. بانتظار طلبات العملاء.",
            merch_fetching_orders: "جاري استرداد طلبات المتجر...",
            merch_name_ph: "مثال: طقم تيل فرامل أمامي بريمبو",
            merch_sku_ph: "مثال: BRM-P06024",
            merch_oem_ph: "مثال: 34116774692",
            merch_desc_ph: "المواصفات الكاملة للقطعة...",
            merch_price_ph: "1250.00",
            merch_stock_ph: "20",
            merch_prompt_stock: "أدخل كمية المخزون الجديدة:",
            merch_balanced: "متزن رياضياً بالكامل",
            th_actions: "إجراءات",
            th_datetime: "التاريخ والوقت",
            th_transaction: "المعاملة",
            th_entry_type: "نوع القيد",
            th_amount: "المبلغ",
            th_running_balance: "الرصيد التراكمي",

            // Merchant Catalog & Add Product Modal
            merch_th_part: "بيانات القطعة",
            merch_th_sku: "كود القطعة / رقم OEM",
            merch_th_specs: "أبعاد الشحنة",
            merch_th_price: "السعر",
            merch_th_stock: "المخزون",
            merch_btn_update_stock: "تحديث المخزون",
            merch_modal_add_title: "إضافة قطعة غيار جديدة للكتالوج",
            merch_lbl_name: "اسم القطعة",
            merch_lbl_sku: "كود المنتج (SKU)",
            merch_lbl_oem: "رقم القطعة الأصلي (OEM)",
            merch_lbl_desc: "الوصف والمواصفات",
            merch_lbl_price: "السعر (ج.م)",
            merch_lbl_stock: "الكمية الأولية بالمخزون",
            merch_lbl_cargo_dims: "أبعاد ووزن الشحنة (لمحرك الفلترة والتوجيه)",
            merch_lbl_weight: "الوزن (كجم)",
            merch_lbl_len: "الطول (سم)",
            merch_lbl_width: "العرض (سم)",
            merch_lbl_height: "الارتفاع (سم)",
            merch_lbl_fitment: "موديل السيارة المتوافقة",
            merch_fit_make: "الشركة (مثل BMW)",
            merch_fit_model: "الموديل (مثل 320i)",
            merch_fit_from: "من سنة",
            merch_fit_to: "إلى سنة",
            merch_btn_publish: "نشر القطعة في السوق الإلكتروني",

            // Merchant Wallet
            merch_wallet_balance: "رصيد التاجر المتاح",
            merch_wallet_escrow: "رصيد معلق قيد التوصيل",
            merch_wallet_statement: "كشف حركات دفتر الأستاذ المزدوج",
            merch_no_trans: "لا توجد معاملات مسجلة في المحفظة حتى الآن.",

            // Courier Portal
            courier_fleet_title: "جاهز لتلقي الطلبات",
            courier_ping_gps: "إرسال إشارة GPS الحية",
            courier_go_offline: "تعيين غير متصل",
            courier_go_online: "تعيين متصل",
            courier_online_label: "متصل • جاهز لاستقبال الطلبات",
            courier_offline_label: "غير متصل (الإشارة متوقفة)",
            courier_cod_cash_in_hand: "المبالغ النقدية المحصلة (مديونية COD):",
            courier_cod_limit: "الحد الأقصى:",
            courier_cod_active: "تحصيل COD مفعل",
            courier_cod_suspended: "تحصيل COD معلق (تجاوز الحد)",
            courier_btn_deposit_cash: "توريد نقدية (تسوية العهدة)",
            courier_active_task_title: "شحنة جارية قيد التوصيل",
            courier_step_pickup: "1. استلام من المتجر",
            courier_step_drop: "2. تسليم للعميل",
            courier_btn_confirm_pickup: "تأكيد الاستلام من المتجر (بدء الرحلة)",
            courier_btn_picked_up: "تم الاستلام من المتجر",
            courier_btn_enter_otp: "إدخال رمز OTP الخاص بالعميل للإنهاء",
            courier_nearby_offers: "عروض الطلبات المتاحة بالجوار",
            courier_scan_proximity: "فحص المحيط الجغرافي",
            courier_scanning: "جاري فحص الطلبات المتاحة...",
            courier_payout: "أجرة التوصيل للمندوب",
            courier_btn_claim_offer: "قبول العرض ←",
            courier_cargo: "الحمولة",
            courier_items: "قطع",
            courier_dropoff: "مكان التسليم",
            courier_no_offers: "لا توجد طلبات بانتظار استلام مناديب في منطقتك حالياً.",
            courier_offers_auto: "الطلبات الجاهزة من المتاجر ستظهر هنا تلقائياً فور تجهيزها.",
            courier_total_earnings: "إجمالي أرباح التوصيل",
            courier_refresh_stmt: "تحديث كشف الحساب",
            courier_no_stmt: "لا توجد معاملات تسليم سابقة.",

            // Courier Modals
            otp_modal_title: "أدخل رمز التحقق (OTP) من العميل",
            otp_modal_desc: "اطلب من العميل كود التأكيد المكون من 6 أرقام لإنهاء التسليم وإيداع أجرة التوصيل فورياً.",
            otp_btn_verify: "تحقق وتسوية الأرباح",
            otp_settling: "جاري التسوية...",
            btn_cancel: "إلغاء",
            remit_modal_title: "تسجيل إيصال توريد نقدية (تصفية عهدة)",
            remit_modal_desc: "قم بتحويل مبالغ الدفع عند الاستلام المحصلة إلى حساب المنصة عبر إنستاباي أو البنك، ثم سجل تفاصيل الإيصال لتصفية عهدتك المالية.",
            remit_lbl_amount: "مبلغ التوريد (ج.م)",
            remit_lbl_method: "طريقة التحويل",
            remit_opt_instapay: "تطبيق إنستاباي (InstaPay)",
            remit_opt_fawry: "فوري (Fawry)",
            remit_opt_bank: "تحويل بنكي (CIB)",
            remit_opt_cash: "إيداع نقدي مباشر بالفرع",
            remit_btn_submit: "إرسال الإيصال لتدقيق الإدارة",

            // Admin Portal
            admin_kpi_earnings: "إيرادات عمولات المنصة",
            admin_kpi_earnings_sub: "صافي رسوم الخدمة والعمولات للمنصة",
            admin_kpi_escrow: "خزينة الضمان المعلق",
            admin_kpi_escrow_sub: "أموال محجوزة بانتظار تسوية بطاقات الدفع",
            admin_kpi_gmv: "إجمالي قيمة التداول (GMV)",
            admin_kpi_gmv_sub: "إجمالي قيمة المعاملات التراكمية في السوق",
            admin_kpi_delivered: "الطلبات الفرعية المسلمة",
            admin_kpi_delivered_sub: "تسويات مالية مؤكدة برمز OTP بنسبة 100%",
            admin_tab_merchants: "متاجر بانتظار الاعتماد",
            admin_tab_couriers: "تدقيق أسطول المناديب",
            admin_tab_remittances: "توريدات النقدية المعلقة",
            admin_tab_orders: "مراقبة الطلبات المباشرة",
            admin_btn_approve_store: "اعتماد المتجر",
            admin_btn_unfreeze_courier: "إلغاء التجميد يدوياً",
            admin_btn_audit_settle: "تدقيق واعتماد التسوية",
            admin_no_pending_stores: "لا توجد طلبات متاجر معلقة. جميع المتاجر معتمدة.",
            admin_no_pending_remit: "تم تدقيق وتسوية جميع إيصالات توريد النقدية.",
            admin_no_orders: "لا توجد طلبات مسجلة في المنصة بعد.",
            admin_submitted: "تاريخ التقديم",
            admin_merchants_heading: "متاجر بانتظار المراجعة والاعتماد الرسمي",
            admin_refresh_list: "تحديث القائمة",
            admin_pending_review: "قيد المراجعة",
            admin_owner: "المالك",
            admin_couriers_heading: "أسطول المناديب ومتابعة مديونيات الدفع عند الاستلام",
            admin_couriers_sub: "يتم تعليق المناديب المتجاوزين لسقف العهدة تلقائياً",
            admin_remittances_heading: "توريدات النقدية من المناديب (تصفية الدفتر المزدوج)",
            admin_remittances_sub: "تدقيق إيصال الإيداع يسوي التزام السائق فورياً في الدفتر",
            admin_orders_heading: "مراقبة مسار الطلبات المباشرة في المنصة",
            admin_orders_sub: "الطلبات الأصلية والفرعية وحالات أكواد OTP",
            admin_total: "الإجمالي",
            admin_via: "عبر",
            admin_normal_standing: "حالة نظامية سليمة",
            admin_active_fleet: "أسطول نشط",

            // Order Statuses
            status_pending: "قيد المراجعة",
            status_accepted_by_merchant: "مقبول من المتجر",
            status_preparing: "قيد التجهيز",
            status_ready_for_pickup: "جاهز للاستلام والتوجيه",
            status_assigned_to_courier: "تم تعيين مندوب",
            status_in_transit: "في الطريق للتسليم",
            status_delivered: "تم التسليم بنجاح",
            status_cancelled: "ملغي",

            // Toasts & Messages
            toast_auth_demo: "جاري تسجيل الدخول بالحساب التجريبي...",
            toast_login_success: "تم تسجيل الدخول بنجاح!",
            toast_logout_success: "تم تسجيل الخروج بنجاح.",
            toast_added_to_cart: "تمت إضافة {name} إلى السلة.",
            toast_cart_empty: "سلة التسوق فارغة.",
            toast_order_placed: "تم تأكيد وتقسيم الطلب بنجاح!",
            toast_fill_car: "يرجى ملء اسم الشركة والموديل وسنة الصنع.",
            toast_car_saved: "تمت إضافة السيارة إلى المرآب!",
            toast_transitioning: "جاري تغيير حالة الطلب إلى {status}...",
            toast_order_updated: "تم تحديث حالة الطلب وإشعار المناديب!",
            toast_product_uploaded: "تم نشر المنتج في الكتالوج بنجاح!",
            toast_fill_mandatory: "يرجى ملء جميع الحقول الإلزامية.",
            toast_stock_updated: "تم تحديث كمية المخزون بنجاح.",
            toast_gps_pinged: "تم بث إشارة GPS إلى سيرفر Redis بنجاح ({lat}, {lng})",
            toast_claiming_offer: "جاري حجز وقبول عرض الطلب...",
            toast_offer_accepted: "تم قبول العرض بنجاح! توجه إلى المتجر لاستلام الشحنة.",
            toast_confirming_pickup: "جاري تأكيد الاستلام من المتجر...",
            toast_picked_up: "تم استلام الشحنة من المتجر وهي الآن في الطريق للعميل.",
            toast_enter_otp_digits: "يرجى إدخال رمز OTP المكون من 6 أرقام.",
            toast_no_active_delivery: "لا توجد شحنة نشطة لتسويتها.",
            toast_delivery_verified: "تم التحقق من الرمز وتسوية قيود الدفتر المزدوج بنجاح!",
            toast_invalid_otp: "رمز OTP غير صحيح. يرجى التأكد من العميل.",
            toast_valid_deposit: "يرجى إدخال مبلغ توريد صحيح.",
            toast_remit_submitted: "تم تقديم إيصال التوريد للمراجعة والاعتماد الإداري!",
            toast_store_approved: "تم اعتماد المتجر وتفعيله في السوق بنجاح!",
            toast_courier_unfrozen: "تم فك تجميد حساب المندوب وإعادة تعيين سقف الائتمان."
        }
    };

    // Current state
    let currentLocale = localStorage.getItem('otlob_locale') || 'en';

    window.i18n = translations;

    window.getLocale = function() {
        return currentLocale;
    };

    window.t = function(key, fallback = '') {
        const dict = translations[currentLocale] || translations.en;
        return dict[key] !== undefined ? dict[key] : (fallback || key);
    };

    window.tf = function(key, params = {}, fallback = '') {
        let str = window.t(key, fallback);
        Object.keys(params).forEach(k => {
            str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
        });
        return str;
    };

    window.getOrderStatusLabel = function(status) {
        const key = 'status_' + (status || '').toLowerCase();
        return window.t(key, (status || '').replace(/_/g, ' '));
    };

    window.setLocale = function(lang) {
        if (!translations[lang]) return;
        currentLocale = lang;
        localStorage.setItem('otlob_locale', lang);

        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === 'ar' ? 'rtl' : 'ltr');

        // Update body font classes
        if (lang === 'ar') {
            document.body.classList.add('font-arabic');
        } else {
            document.body.classList.remove('font-arabic');
        }

        // Update language toggle button text in header
        const btnText = document.getElementById('langToggleText');
        if (btnText) {
            btnText.textContent = lang === 'ar' ? 'English' : 'العربية';
        }

        window.applyTranslations();

        // Dispatch global event for interactive portal views
        window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale: lang } }));
    };

    window.toggleLocale = function() {
        window.setLocale(currentLocale === 'en' ? 'ar' : 'en');
    };

    window.applyTranslations = function() {
        // 1. Text elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = window.t(key);
            if (translation) {
                el.textContent = translation;
            }
        });

        // 2. Placeholder elements
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = window.t(key);
            if (translation) {
                el.placeholder = translation;
            }
        });

        // 3. Title / tooltip elements
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = window.t(key);
            if (translation) {
                el.title = translation;
            }
        });

        // 4. Directional icons (arrows)
        document.querySelectorAll('[data-i18n-arrow]').forEach(el => {
            if (currentLocale === 'ar') {
                el.innerHTML = '&larr;';
            } else {
                el.innerHTML = '&rarr;';
            }
        });
    };

    // Initialize as soon as DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        window.setLocale(currentLocale);
    });
})();
