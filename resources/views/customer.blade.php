@extends('layouts.portal')

@section('title', 'Otlob Parts — Customer Store & Garage')

@section('content')
<div class="space-y-8" id="customerApp">

    <!-- Top Banner: Garage Bar & Cart trigger -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel rounded-2xl p-5 border border-slate-800">
        <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center text-xl">
                <i class="fa-solid fa-car-side"></i>
            </div>
            <div>
                <div class="flex items-center space-x-2">
                    <span class="text-xs uppercase font-bold tracking-wider text-slate-400" data-i18n="cust_garage_selected">My Selected Garage Car:</span>
                    <span id="activeVehicleBadge" class="text-xs font-semibold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        Toyota Corolla (2020)
                    </span>
                </div>
                <h2 id="activeVehicleName" class="font-display font-bold text-lg text-white">Toyota Corolla 2020</h2>
            </div>
        </div>

        <div class="flex items-center space-x-3 w-full md:w-auto justify-end">
            <button onclick="openGarageModal()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center">
                <i class="fa-solid fa-warehouse mr-1.5 text-brand-400"></i> <span data-i18n="cust_my_garage">My Garage</span> (<span id="garageCount">0</span>)
            </button>
            <button onclick="toggleCartDrawer()" class="relative px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all flex items-center">
                <i class="fa-solid fa-cart-shopping mr-2 text-sm"></i> <span data-i18n="cust_cart">Cart</span>
                <span id="cartCountBadge" class="ml-2 px-1.5 py-0.2 rounded-full bg-white text-brand-600 text-[11px] font-black">0</span>
            </button>
        </div>
    </div>

    <!-- Live Track Banner (If active orders exist) -->
    <div id="activeOrdersBanner" class="hidden glass-card rounded-2xl p-4 border border-brand-500/30 bg-gradient-to-r from-brand-950/40 via-slate-900 to-slate-900">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3">
                <div class="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                    <i class="fa-solid fa-truck-fast"></i>
                </div>
                <div>
                    <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider" data-i18n="cust_active_order_banner">Active Order In Progress</span>
                    <h4 id="activeOrderHeadline" class="text-sm font-semibold text-white">Order ORD-DEMO-002 • In Transit</h4>
                </div>
            </div>
            <button onclick="openActiveOrderTracker()" class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow flex items-center">
                <i class="fa-solid fa-location-crosshairs mr-1"></i> <span data-i18n="cust_view_tracking">View Live Tracking & OTP</span>
            </button>
        </div>
    </div>

    <!-- Search & Filters Container -->
    <div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div class="flex flex-col md:flex-row gap-3">
            <div class="relative flex-1">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input type="text" id="searchInput" data-i18n-placeholder="cust_search_placeholder" placeholder="Search by Part Name, OEM Number (e.g. 34116774692), or SKU..." class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors">
            </div>

            <!-- Vehicle Fitment Filter inputs -->
            <div class="flex flex-wrap sm:flex-nowrap gap-2">
                <input type="text" id="filterMake" data-i18n-placeholder="cust_filter_make" placeholder="Make (e.g. BMW)" class="w-28 px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500">
                <input type="text" id="filterModel" data-i18n-placeholder="cust_filter_model" placeholder="Model (e.g. 3 Series)" class="w-32 px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500">
                <input type="number" id="filterYear" data-i18n-placeholder="cust_filter_year" placeholder="Year (2020)" class="w-24 px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500">
                <button onclick="loadProducts()" class="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors" data-i18n="cust_btn_filter">
                    Filter
                </button>
                <button onclick="clearFilters()" class="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors" data-i18n-title="reset_filters" title="Reset Filters">
                    <i class="fa-solid fa-rotate-left"></i>
                </button>
            </div>
        </div>

        <!-- Category Tags -->
        <div class="flex flex-wrap gap-2 text-xs">
            <span class="text-slate-400 py-1 mr-1" data-i18n="cust_quick_tags">Quick Tags:</span>
            <button onclick="setSearchTerm('Brake')" class="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700" data-i18n="cust_tag_brakes">Brakes & Rotors</button>
            <button onclick="setSearchTerm('Filter')" class="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700" data-i18n="cust_tag_filters">Filters & Fluids</button>
            <button onclick="setSearchTerm('Plugs')" class="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700" data-i18n="cust_tag_ignition">Ignition & Plugs</button>
            <button onclick="setSearchTerm('Alternator')" class="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700" data-i18n="cust_tag_alternator">Alternator & Starter</button>
        </div>
    </div>

    <!-- Products Catalog Grid -->
    <div>
        <div class="flex items-center justify-between mb-4">
            <h3 class="font-display font-bold text-xl text-white flex items-center">
                <i class="fa-solid fa-boxes-stacked text-brand-400 mr-2"></i> <span data-i18n="cust_catalog_title">Verified Auto Parts Catalog</span>
            </h3>
            <span id="catalogCount" class="text-xs text-slate-400 font-medium">...</span>
        </div>

        <div id="productsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <!-- Product Cards injected dynamically via JS -->
        </div>
    </div>

</div>

<!-- Slide-Out Multi-Merchant Cart Drawer -->
<div id="cartDrawerBackdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden transition-opacity" onclick="toggleCartDrawer()"></div>
<div id="cartDrawer" class="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-slate-800 z-50 p-6 flex flex-col justify-between transform translate-x-full transition-transform duration-300 shadow-2xl">
    <div>
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center space-x-2">
                <i class="fa-solid fa-cart-shopping text-brand-400"></i>
                <h3 class="font-display font-bold text-lg text-white" data-i18n="cart_drawer_title">Your Shopping Cart</h3>
            </div>
            <button onclick="toggleCartDrawer()" class="p-2 text-slate-400 hover:text-white rounded-lg">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        <!-- Split Order Notice -->
        <div class="my-4 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300">
            <i class="fa-solid fa-circle-nodes mr-1 text-brand-400"></i>
            <strong data-i18n="cart_split_notice_title">Multi-Merchant Split Delivery:</strong> <span data-i18n="cart_split_notice_desc">Items from different stores will create independent sub-orders with dedicated courier dispatching.</span>
        </div>

        <!-- Cart Items grouped by Merchant -->
        <div id="cartItemsList" class="space-y-4 max-h-[48vh] overflow-y-auto pr-1">
            <!-- Items injected via JS -->
        </div>
    </div>

    <!-- Cart Summary & Checkout Form -->
    <div class="pt-4 border-t border-slate-800 space-y-4">
        <div class="space-y-1.5 text-xs text-slate-300">
            <div class="flex justify-between">
                <span data-i18n="cart_subtotal">Parts Subtotal:</span>
                <span id="cartSubtotal" class="font-bold text-white">0.00 EGP</span>
            </div>
            <div class="flex justify-between">
                <span data-i18n="cart_delivery_fees">Est. Delivery Fees (per store):</span>
                <span id="cartDeliveryFees" class="font-bold text-white">0.00 EGP</span>
            </div>
            <div class="flex justify-between">
                <span data-i18n="cart_service_fees">Platform Service Fees:</span>
                <span id="cartServiceFees" class="font-bold text-white">0.00 EGP</span>
            </div>
            <div class="flex justify-between text-sm font-black text-emerald-400 pt-2 border-t border-slate-800">
                <span data-i18n="cart_total">Total Amount:</span>
                <span id="cartTotal">0.00 EGP</span>
            </div>
        </div>

        <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1.5" data-i18n="cart_payment_method">Payment Method</label>
            <select id="paymentTypeSelect" class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500">
                <option value="cod" data-i18n="payment_cod">Cash On Delivery (COD)</option>
                <option value="card" data-i18n="payment_card">Credit / Debit Card (Online Escrow)</option>
                <option value="wallet" data-i18n="payment_wallet">Customer In-App Wallet</option>
            </select>
        </div>

        <button onclick="submitCheckout()" id="checkoutBtn" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all" data-i18n="cart_btn_checkout">
            Confirm & Place Split Order
        </button>
    </div>
</div>

<!-- Modal: Garage Vehicles -->
<div id="garageModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 class="font-display font-bold text-lg text-white flex items-center">
                <i class="fa-solid fa-warehouse text-brand-400 mr-2"></i> <span data-i18n="garage_modal_title">My Car Garage</span>
            </h3>
            <button onclick="closeGarageModal()" class="text-slate-400 hover:text-white">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        <div id="garageList" class="space-y-2.5 max-h-56 overflow-y-auto">
            <!-- Vehicles listed here -->
        </div>

        <!-- Add Vehicle Form -->
        <div class="pt-4 border-t border-slate-800 space-y-3">
            <h4 class="text-xs uppercase font-bold text-slate-400 tracking-wider" data-i18n="garage_add_heading">Add Vehicle to Garage</h4>
            <div class="grid grid-cols-3 gap-2">
                <input type="text" id="newCarMake" data-i18n-placeholder="garage_make" placeholder="Make (e.g. BMW)" class="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500">
                <input type="text" id="newCarModel" data-i18n-placeholder="garage_model" placeholder="Model (e.g. 320i)" class="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500">
                <input type="number" id="newCarYear" data-i18n-placeholder="garage_year" placeholder="Year (2020)" class="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500">
            </div>
            <input type="text" id="newCarVin" data-i18n-placeholder="garage_vin" placeholder="VIN (Optional 17-char code)" maxlength="17" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500">
            <button onclick="saveNewVehicle()" class="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors" data-i18n="garage_btn_save">
                Save Car to Garage
            </button>
        </div>
    </div>
</div>

<!-- Modal: Order Placed / Tracking Details -->
<div id="trackingModal" class="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
                    <i class="fa-solid fa-receipt"></i>
                </div>
                <div>
                    <h3 class="font-display font-bold text-lg text-white" data-i18n="track_modal_title">Live Order Tracking</h3>
                    <p id="trackingOrderCode" class="text-xs text-slate-400">Order #ORD-...</p>
                </div>
            </div>
            <button onclick="closeTrackingModal()" class="text-slate-400 hover:text-white">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        <!-- Secret Delivery OTP Highlight Box -->
        <div class="p-5 rounded-2xl bg-gradient-to-br from-brand-950/80 to-slate-900 border border-brand-500/40 text-center space-y-1">
            <span class="text-xs font-bold uppercase tracking-widest text-brand-400" data-i18n="track_otp_label">Your Secret Delivery Verification OTP</span>
            <div id="trackingOtpCode" class="font-display font-black text-4xl text-white tracking-widest py-1">------</div>
            <p class="text-xs text-slate-400" data-i18n="track_otp_hint">Give this 6-digit code to your driver when the parts arrive to confirm delivery.</p>
        </div>

        <!-- Status Timeline Progress -->
        <div class="space-y-3">
            <h4 class="text-xs uppercase font-bold text-slate-400 tracking-wider" data-i18n="track_suborders_heading">Sub-Orders & Delivery Status</h4>
            <div id="trackingSubOrdersList" class="space-y-2 text-xs">
                <!-- Sub order cards -->
            </div>
        </div>

        <!-- Live Courier Status -->
        <div id="trackingCourierInfo" class="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between text-xs">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <i class="fa-solid fa-motorcycle"></i>
                </div>
                <div>
                    <span id="trackingCourierName" class="font-bold text-white">Assigned Courier</span>
                    <p id="trackingCourierPhone" class="text-slate-400">Looking for nearby drivers...</p>
                </div>
            </div>
            <span id="trackingStatusPill" class="px-2.5 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300">Preparing</span>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    // State management
    let cart = [];
    let vehicles = [];
    let activeVehicle = null;

    // Load Initial Data
    document.addEventListener('DOMContentLoaded', async () => {
        // Auto-check customer login; if not logged in, auto-login demo customer Mohamed
        if (!localStorage.getItem('otlob_token')) {
            await window.quickLogin('01012345678', 'secret123');
        }
        await loadGarage();
        await loadProducts();
        await checkActiveOrders();
    });

    // Re-render dynamic components on locale switch
    window.addEventListener('localeChanged', () => {
        loadProducts();
        updateCartUI();
        if (activeVehicle) {
            const defLabel = activeVehicle.is_default ? ` (${window.t('cust_default_car')})` : '';
            document.getElementById('activeVehicleName').textContent = `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}${defLabel}`;
        }
        if (activeCustomerOrder) {
            renderTrackingModalContent(activeCustomerOrder);
        }
    });

    async function loadGarage() {
        try {
            const res = await window.api.get('/api/v1/customer/vehicles');
            if (res.success) {
                vehicles = res.data;
                document.getElementById('garageCount').textContent = vehicles.length;
                if (vehicles.length > 0) {
                    activeVehicle = vehicles.find(v => v.is_default) || vehicles[0];
                    const defLabel = activeVehicle.is_default ? ` (${window.t('cust_default_car')})` : '';
                    document.getElementById('activeVehicleName').textContent = `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}${defLabel}`;
                    document.getElementById('activeVehicleBadge').textContent = `${activeVehicle.make} ${activeVehicle.model}`;
                }
            }
        } catch (e) {
            console.warn(e);
        }
    }

    async function loadProducts() {
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = `<div class="col-span-3 text-center py-10 text-slate-500"><i class="fa-solid fa-circle-notch fa-spin text-2xl mb-2 text-brand-500"></i><p>${window.t('cust_loading_catalog')}</p></div>`;

        const q = document.getElementById('searchInput').value;
        const make = document.getElementById('filterMake').value || (activeVehicle?.make || '');
        const model = document.getElementById('filterModel').value;
        const year = document.getElementById('filterYear').value;

        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (make) params.append('make', make);
        if (model) params.append('model', model);
        if (year) params.append('year', year);

        try {
            const res = await window.api.get(`/api/v1/products/search?${params.toString()}`);
            if (res.success) {
                const items = res.data;
                document.getElementById('catalogCount').textContent = window.tf('cust_showing_parts', { count: items.length });

                if (items.length === 0) {
                    grid.innerHTML = `
                        <div class="col-span-3 text-center py-12 glass-panel rounded-2xl text-slate-400">
                            <i class="fa-solid fa-car-tunnel text-3xl mb-3 text-slate-600"></i>
                            <p class="font-bold">${window.t('cust_no_compatible')}</p>
                            <p class="text-xs text-slate-500 mt-1">${window.t('cust_clear_filters_hint')}</p>
                        </div>
                    `;
                    return;
                }

                const curr = window.t('currency');
                const inStockLabel = window.t('cust_in_stock');
                const outOfStockLabel = window.t('cust_out_of_stock');
                const unitPriceLabel = window.t('cust_unit_price');
                const addBtnLabel = window.t('cust_add_to_cart');

                grid.innerHTML = items.map(p => `
                    <div class="glass-card rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all group">
                        <div>
                            <div class="flex items-center justify-between text-xs mb-2">
                                <span class="font-mono text-[11px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-800">OEM: ${p.oem_number}</span>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.stock_quantity > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}">
                                    ${p.stock_quantity > 0 ? `${p.stock_quantity} ${inStockLabel}` : outOfStockLabel}
                                </span>
                            </div>

                            <h4 class="font-display font-bold text-white text-base group-hover:text-brand-400 transition-colors">${p.name}</h4>
                            <p class="text-xs text-slate-400 mt-1 line-clamp-2">${p.description}</p>

                            <div class="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                                <span class="flex items-center"><i class="fa-solid fa-store mr-1 text-purple-400"></i> ${p.merchant?.store_name || 'Store'}</span>
                                <span class="flex items-center"><i class="fa-solid fa-box text-slate-500 mr-1"></i> ${p.weight_kg} kg</span>
                            </div>

                            ${p.compatibilities && p.compatibilities.length ? `
                                <div class="mt-2 flex flex-wrap gap-1">
                                    ${p.compatibilities.slice(0, 2).map(c => `
                                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-brand-300 font-medium">
                                            ${c.make} ${c.model} (${c.year_from}-${c.year_to})
                                        </span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>

                        <div class="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                            <div>
                                <span class="text-[10px] text-slate-400 block">${unitPriceLabel}</span>
                                <span class="font-display font-bold text-lg text-emerald-400">${parseFloat(p.price).toFixed(2)} ${curr}</span>
                            </div>
                            <button onclick='addToCart(${JSON.stringify(p).replace(/'/g, "&apos;")})' class="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all flex items-center">
                                <i class="fa-solid fa-cart-plus mr-1.5"></i> ${addBtnLabel}
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        } catch (e) {
            grid.innerHTML = '<div class="col-span-3 text-center py-8 text-rose-400 text-sm">Error loading parts catalog. Please check connection.</div>';
        }
    }

    function setSearchTerm(term) {
        document.getElementById('searchInput').value = term;
        loadProducts();
    }

    function clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('filterMake').value = '';
        document.getElementById('filterModel').value = '';
        document.getElementById('filterYear').value = '';
        loadProducts();
    }

    // Cart Management
    function addToCart(product) {
        const existing = cart.find(i => i.product.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ product, quantity: 1 });
        }
        updateCartUI();
        window.showToast(window.tf('toast_added_to_cart', { name: product.name }), 'success');
    }

    function updateCartUI() {
        document.getElementById('cartCountBadge').textContent = cart.reduce((acc, i) => acc + i.quantity, 0);

        const curr = window.t('currency');

        // Group by merchant
        const groups = {};
        let partsTotal = 0;

        cart.forEach(item => {
            const mId = item.product.merchant_id;
            if (!groups[mId]) {
                groups[mId] = {
                    merchantName: item.product.merchant?.store_name || 'Store',
                    items: []
                };
            }
            groups[mId].items.push(item);
            partsTotal += (parseFloat(item.product.price) * item.quantity);
        });

        const listContainer = document.getElementById('cartItemsList');
        if (cart.length === 0) {
            listContainer.innerHTML = `<div class="text-center py-10 text-slate-500 text-xs">${window.t('cart_empty')}</div>`;
            document.getElementById('cartSubtotal').textContent = `0.00 ${curr}`;
            document.getElementById('cartDeliveryFees').textContent = `0.00 ${curr}`;
            document.getElementById('cartServiceFees').textContent = `0.00 ${curr}`;
            document.getElementById('cartTotal').textContent = `0.00 ${curr}`;
            return;
        }

        const merchantCount = Object.keys(groups).length;
        const estDeliveryPerMerchant = 35.00;
        const serviceFeePerMerchant = 15.00;

        const totalDelivery = merchantCount * estDeliveryPerMerchant;
        const totalService = merchantCount * serviceFeePerMerchant;
        const grandTotal = partsTotal + totalDelivery + totalService;

        document.getElementById('cartSubtotal').textContent = `${partsTotal.toFixed(2)} ${curr}`;
        document.getElementById('cartDeliveryFees').textContent = `${totalDelivery.toFixed(2)} ${curr}`;
        document.getElementById('cartServiceFees').textContent = `${totalService.toFixed(2)} ${curr}`;
        document.getElementById('cartTotal').textContent = `${grandTotal.toFixed(2)} ${curr}`;

        const delivLabel = window.t('cart_delivery_est');

        listContainer.innerHTML = Object.entries(groups).map(([mId, group]) => `
            <div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div class="flex items-center justify-between text-xs font-bold text-purple-300 border-b border-slate-700 pb-1.5">
                    <span class="flex items-center"><i class="fa-solid fa-store mr-1.5 text-purple-400"></i> ${group.merchantName}</span>
                    <span class="text-[10px] text-slate-400 font-normal">${delivLabel}: ~${estDeliveryPerMerchant} ${curr}</span>
                </div>
                ${group.items.map(i => `
                    <div class="flex items-center justify-between text-xs py-1">
                        <div class="flex-1 pr-2">
                            <span class="text-white font-medium block">${i.product.name}</span>
                            <span class="text-emerald-400 text-[11px]">${parseFloat(i.product.price).toFixed(2)} ${curr}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button onclick="changeQty('${i.product.id}', -1)" class="w-6 h-6 rounded bg-slate-700 text-slate-300 hover:text-white">-</button>
                            <span class="font-bold text-white">${i.quantity}</span>
                            <button onclick="changeQty('${i.product.id}', 1)" class="w-6 h-6 rounded bg-slate-700 text-slate-300 hover:text-white">+</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    function changeQty(productId, delta) {
        const item = cart.find(i => i.product.id === productId);
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.product.id !== productId);
        }
        updateCartUI();
    }

    function toggleCartDrawer() {
        const drawer = document.getElementById('cartDrawer');
        const backdrop = document.getElementById('cartDrawerBackdrop');
        const isOpen = !drawer.classList.contains('translate-x-full');

        if (isOpen) {
            drawer.classList.add('translate-x-full');
            backdrop.classList.add('hidden');
        } else {
            drawer.classList.remove('translate-x-full');
            backdrop.classList.remove('hidden');
            updateCartUI();
        }
    }

    async function submitCheckout() {
        if (cart.length === 0) {
            window.showToast(window.t('toast_cart_empty'), 'error');
            return;
        }

        const btn = document.getElementById('checkoutBtn');
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> ${window.t('cart_placing_order')}`;

        try {
            const payload = {
                items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
                delivery_lat: 30.0500, // Cairo center drop-off coordinates
                delivery_lng: 31.2400,
                payment_type: document.getElementById('paymentTypeSelect').value
            };

            const res = await window.api.post('/api/v1/orders/checkout', payload);
            if (res.success) {
                window.showToast(window.t('toast_order_placed'), 'success');
                cart = [];
                updateCartUI();
                toggleCartDrawer();
                showTrackingModal(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            btn.disabled = false;
            btn.innerHTML = window.t('cart_btn_checkout');
        }
    }

    let activeCustomerOrder = null;

    // Tracking Modal
    function renderTrackingModalContent(order) {
        const curr = window.t('currency');
        const orderWord = window.t('track_order');
        document.getElementById('trackingOrderCode').textContent = `${orderWord} #${order.order_code}`;

        const subOrders = order.sub_orders || order.subOrders || [];
        const firstOtp = (subOrders.length > 0 && subOrders[0].delivery_otp) ? subOrders[0].delivery_otp : (order.delivery_otp || '482103');
        document.getElementById('trackingOtpCode').textContent = firstOtp;

        const subOrdersList = document.getElementById('trackingSubOrdersList');
        if (subOrders.length) {
            subOrdersList.innerHTML = subOrders.map(sub => {
                const courierName = sub.courier?.user?.name;
                const statusColor = sub.order_status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                    sub.order_status === 'in_transit' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                    sub.order_status === 'assigned_to_courier' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                                    'bg-amber-500/20 text-amber-300 border border-amber-500/30';

                const statusLabel = window.getOrderStatusLabel(sub.order_status);
                const subWord = window.t('track_suborder');
                const feeWord = window.t('track_fee');
                const courWord = window.t('track_courier');

                return `
                    <div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                            <span class="font-bold text-white block text-sm">${sub.merchant?.store_name || 'Store'}</span>
                            <span class="text-slate-400 text-[11px]">${subWord} #${sub.order_code} • ${feeWord}: ${parseFloat(sub.delivery_fee || 35).toFixed(2)} ${curr}</span>
                            ${courierName ? `<p class="text-cyan-400 text-[11px] mt-0.5"><i class="fa-solid fa-motorcycle mr-1"></i> ${courWord}: ${courierName}</p>` : ''}
                        </div>
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${statusColor}">
                            ${statusLabel}
                        </span>
                    </div>
                `;
            }).join('');

            // Highlight courier info from the most active sub-order
            const assignedSub = subOrders.find(s => s.courier) || subOrders[0];
            if (assignedSub && assignedSub.courier) {
                document.getElementById('trackingCourierName').textContent = assignedSub.courier.user?.name || window.t('track_assigned_driver');
                document.getElementById('trackingCourierPhone').textContent = `${window.t('track_vehicle')}: ${assignedSub.courier.vehicle_type?.toUpperCase() || 'MOTORCYCLE'} • ${window.t('track_phone')}: ${assignedSub.courier.user?.phone || 'Available'}`;
                document.getElementById('trackingStatusPill').textContent = window.getOrderStatusLabel(assignedSub.order_status).toUpperCase();
            } else {
                document.getElementById('trackingCourierName').textContent = window.t('track_looking_courier');
                document.getElementById('trackingCourierPhone').textContent = window.t('track_dispatched_hint');
                document.getElementById('trackingStatusPill').textContent = window.t('track_searching');
            }
        }
    }

    function showTrackingModal(order) {
        renderTrackingModalContent(order);
        document.getElementById('trackingModal').classList.remove('hidden');
    }

    function closeTrackingModal() {
        document.getElementById('trackingModal').classList.add('hidden');
    }

    async function checkActiveOrders(silent = false) {
        try {
            const res = await window.api.get('/api/v1/orders');
            if (res.success && res.data && res.data.length > 0) {
                // Find latest active or in-progress order
                const active = res.data.find(o => !['delivered', 'cancelled'].includes(o.order_status)) || res.data[0];
                if (active) {
                    activeCustomerOrder = active;
                    const banner = document.getElementById('activeOrdersBanner');
                    if (banner) {
                        banner.classList.remove('hidden');
                        const statusLabel = window.getOrderStatusLabel(active.order_status).toUpperCase();
                        const orderWord = window.t('track_order');
                        document.getElementById('activeOrderHeadline').textContent = `${orderWord} #${active.order_code} • ${statusLabel}`;
                    }

                    // If tracking modal is currently open, live refresh it!
                    const modal = document.getElementById('trackingModal');
                    if (modal && !modal.classList.contains('hidden')) {
                        renderTrackingModalContent(active);
                    }
                    return;
                }
            }
            const banner = document.getElementById('activeOrdersBanner');
            if (banner) banner.classList.add('hidden');
        } catch (e) {
            console.warn('checkActiveOrders error:', e);
        }
    }

    function openActiveOrderTracker() {
        if (activeCustomerOrder) {
            showTrackingModal(activeCustomerOrder);
        }
    }

    // Garage Modal
    function openGarageModal() {
        const list = document.getElementById('garageList');
        const defTag = window.t('garage_default_badge');
        list.innerHTML = vehicles.map(v => `
            <div class="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                <div>
                    <span class="font-bold text-white text-xs block">${v.make} ${v.model} (${v.year})</span>
                    <span class="text-[10px] text-slate-400 font-mono">VIN: ${v.vin || 'N/A'}</span>
                </div>
                ${v.is_default ? `<span class="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold">${defTag}</span>` : ''}
            </div>
        `).join('');
        document.getElementById('garageModal').classList.remove('hidden');
    }

    function closeGarageModal() {
        document.getElementById('garageModal').classList.add('hidden');
    }

    async function saveNewVehicle() {
        const make = document.getElementById('newCarMake').value;
        const model = document.getElementById('newCarModel').value;
        const year = document.getElementById('newCarYear').value;
        const vin = document.getElementById('newCarVin').value;

        if (!make || !model || !year) {
            window.showToast(window.t('toast_fill_car'), 'error');
            return;
        }

        try {
            const res = await window.api.post('/api/v1/customer/vehicles', {
                make, model, year: parseInt(year), vin: vin || null, is_default: false
            });
            if (res.success) {
                window.showToast(window.t('toast_car_saved'), 'success');
                closeGarageModal();
                await loadGarage();
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Auto-refresh active order status & delivery progress every 3 seconds
    setInterval(async () => {
        if (!document.hidden) {
            await checkActiveOrders(true);
        }
    }, 3000);
</script>
@endpush
