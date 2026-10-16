@extends('layouts.portal')

@section('title', 'Otlob Merchant Portal — Store Manager & Fulfillment')

@section('content')
<div class="space-y-8" id="merchantApp">

    <!-- Store Profile Header -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-slate-800">
        <div class="flex items-center space-x-4">
            <div class="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-2xl shadow-lg shadow-purple-600/20">
                <i class="fa-solid fa-store"></i>
            </div>
            <div>
                <div class="flex items-center space-x-2">
                    <span id="merchantStoreName" class="font-display font-extrabold text-xl text-white">Apex German Auto Spares</span>
                    <span id="merchantStatusBadge" class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" data-i18n="merch_active_store">Active Store</span>
                </div>
                <p id="merchantStoreAddress" class="text-xs text-slate-400 mt-1 flex items-center">
                    <i class="fa-solid fa-location-dot mr-1 text-slate-500"></i> 14 Ramses Street, Downtown, Cairo • CR: CR-EGY-98210
                </p>
            </div>
        </div>

        <!-- Wallet Balance Card -->
        <div class="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <div class="glass-card px-4 py-2.5 rounded-xl border border-purple-500/30 text-right">
                <span class="text-[10px] uppercase font-bold tracking-wider text-slate-400 block" data-i18n="merch_wallet_balance">Store Wallet Balance</span>
                <span id="merchantWalletBalance" class="font-display font-black text-xl text-emerald-400">0.00 EGP</span>
            </div>
            <button onclick="openAddProductModal()" class="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center">
                <i class="fa-solid fa-plus mr-1.5"></i> <span data-i18n="merch_btn_add_product">Add New Auto Part</span>
            </button>
        </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-slate-800 space-x-4 text-sm font-semibold">
        <button onclick="switchTab('orders')" id="tabBtnOrders" class="pb-3 border-b-2 border-purple-500 text-purple-400 flex items-center">
            <i class="fa-solid fa-clipboard-list mr-2"></i> <span data-i18n="merch_tab_orders">Store Sub-Orders</span> (<span id="ordersCount">0</span>)
        </button>
        <button onclick="switchTab('catalog')" id="tabBtnCatalog" class="pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center">
            <i class="fa-solid fa-boxes-stacked mr-2"></i> <span data-i18n="merch_tab_catalog">Store Catalog</span>
        </button>
        <button onclick="switchTab('wallet')" id="tabBtnWallet" class="pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center">
            <i class="fa-solid fa-wallet mr-2"></i> <span data-i18n="merch_tab_wallet">Financial Wallet</span>
        </button>
    </div>

    <!-- TAB 1: Incoming Sub-Orders Fulfillment -->
    <div id="tabContentOrders" class="space-y-4">
        <div class="flex items-center justify-between">
            <h3 class="font-display font-bold text-lg text-white" data-i18n="merch_orders_title">Store Order Queue</h3>
            <button onclick="loadOrders()" class="text-xs text-purple-400 hover:text-purple-300 flex items-center">
                <i class="fa-solid fa-rotate mr-1"></i> <span data-i18n="merch_refresh_orders">Refresh Orders</span>
            </button>
        </div>

        <div id="ordersList" class="space-y-4">
            <!-- Order Cards injected via JS -->
        </div>
    </div>

    <!-- TAB 2: Product Catalog & Stock -->
    <div id="tabContentCatalog" class="space-y-4 hidden">
        <div class="flex items-center justify-between">
            <h3 class="font-display font-bold text-lg text-white" data-i18n="merch_catalog_title">Store Auto Parts Catalog</h3>
            <span class="text-xs text-slate-400" data-i18n="merch_catalog_hint">Click Edit Stock to update inventory levels instantly</span>
        </div>

        <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                        <tr>
                            <th class="py-3.5 px-4 font-bold" data-i18n="merch_th_part">Part Details</th>
                            <th class="py-3.5 px-4 font-bold" data-i18n="merch_th_sku">SKU / OEM</th>
                            <th class="py-3.5 px-4 font-bold" data-i18n="merch_th_specs">Cargo Dimensions</th>
                            <th class="py-3.5 px-4 font-bold" data-i18n="merch_th_price">Price</th>
                            <th class="py-3.5 px-4 font-bold" data-i18n="merch_th_stock">Stock Level</th>
                            <th class="py-3.5 px-4 font-bold text-right" data-i18n="th_actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="catalogTableBody" class="divide-y divide-slate-800/80 text-slate-300">
                        <!-- Table rows injected via JS -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- TAB 3: Financial Statement -->
    <div id="tabContentWallet" class="space-y-4 hidden">
        <div class="flex items-center justify-between">
            <h3 class="font-display font-bold text-lg text-white" data-i18n="merch_wallet_statement">Double-Entry Ledger Transactions</h3>
            <span class="text-xs text-emerald-400 font-semibold"><i class="fa-solid fa-shield-check mr-1"></i> <span data-i18n="merch_balanced">Mathematically Balanced</span></span>
        </div>

        <div class="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                        <tr>
                            <th class="py-3.5 px-4 font-bold" data-i18n="th_datetime">Date & Time</th>
                            <th class="py-3.5 px-4 font-bold" data-i18n="th_transaction">Transaction</th>
                            <th class="py-3.5 px-4 font-bold" data-i18n="th_entry_type">Entry Type</th>
                            <th class="py-3.5 px-4 font-bold" data-i18n="th_amount">Amount</th>
                            <th class="py-3.5 px-4 font-bold" data-i18n="th_running_balance">Running Balance</th>
                        </tr>
                    </thead>
                    <tbody id="walletTableBody" class="divide-y divide-slate-800/80 text-slate-300">
                        <!-- Table rows injected via JS -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

</div>

<!-- Modal: Add New Product -->
<div id="addProductModal" class="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 class="font-display font-bold text-lg text-white flex items-center">
                <i class="fa-solid fa-plus text-purple-400 mr-2"></i> <span data-i18n="merch_modal_add_title">Add New Automotive Part</span>
            </h3>
            <button onclick="closeAddProductModal()" class="text-slate-400 hover:text-white">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        <div class="space-y-3.5 text-xs">
            <div>
                <label class="block font-semibold text-slate-400 mb-1" data-i18n="merch_lbl_name">Part Name</label>
                <input type="text" id="newProdName" data-i18n-placeholder="merch_name_ph" placeholder="e.g. Brembo Front Brake Disc Set" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-semibold text-slate-400 mb-1" data-i18n="merch_lbl_sku">SKU Code</label>
                    <input type="text" id="newProdSku" data-i18n-placeholder="merch_sku_ph" placeholder="e.g. BRM-P06024" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500">
                </div>
                <div>
                    <label class="block font-semibold text-slate-400 mb-1" data-i18n="merch_lbl_oem">OEM Number</label>
                    <input type="text" id="newProdOem" data-i18n-placeholder="merch_oem_ph" placeholder="e.g. 34116774692" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500">
                </div>
            </div>

            <div>
                <label class="block font-semibold text-slate-400 mb-1" data-i18n="merch_lbl_desc">Description</label>
                <textarea id="newProdDesc" rows="2" data-i18n-placeholder="merch_desc_ph" placeholder="Full part specifications..." class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-semibold text-slate-400 mb-1" data-i18n="merch_lbl_price">Price (EGP)</label>
                    <input type="number" id="newProdPrice" step="0.5" data-i18n-placeholder="merch_price_ph" placeholder="1250.00" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500">
                </div>
                <div>
                    <label class="block font-semibold text-slate-400 mb-1" data-i18n="merch_lbl_stock">Initial Stock</label>
                    <input type="number" id="newProdStock" data-i18n-placeholder="merch_stock_ph" placeholder="20" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-purple-500">
                </div>
            </div>

            <!-- Volumetric & Weight Cargo Dimensions -->
            <div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span class="block font-bold text-slate-300 text-[11px] uppercase tracking-wider" data-i18n="merch_lbl_cargo_dims">Cargo & Volumetric Dimensions (For Dispatch Engine)</span>
                <div class="grid grid-cols-4 gap-2">
                    <div>
                        <span class="text-[10px] text-slate-400 block" data-i18n="merch_lbl_weight">Weight (kg)</span>
                        <input type="number" id="newProdWeight" step="0.1" placeholder="2.5" class="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs">
                    </div>
                    <div>
                        <span class="text-[10px] text-slate-400 block" data-i18n="merch_lbl_len">Length (cm)</span>
                        <input type="number" id="newProdL" placeholder="25" class="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs">
                    </div>
                    <div>
                        <span class="text-[10px] text-slate-400 block" data-i18n="merch_lbl_width">Width (cm)</span>
                        <input type="number" id="newProdW" placeholder="20" class="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs">
                    </div>
                    <div>
                        <span class="text-[10px] text-slate-400 block" data-i18n="merch_lbl_height">Height (cm)</span>
                        <input type="number" id="newProdH" placeholder="10" class="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs">
                    </div>
                </div>
            </div>

            <!-- Vehicle Fitment -->
            <div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span class="block font-bold text-slate-300 text-[11px] uppercase tracking-wider" data-i18n="merch_lbl_fitment">Vehicle Compatibility Model</span>
                <div class="grid grid-cols-4 gap-2">
                    <input type="text" id="newFitMake" data-i18n-placeholder="merch_fit_make" placeholder="Make (BMW)" class="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs">
                    <input type="text" id="newFitModel" data-i18n-placeholder="merch_fit_model" placeholder="Model (320i)" class="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs">
                    <input type="number" id="newFitFrom" data-i18n-placeholder="merch_fit_from" placeholder="From (2012)" class="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs">
                    <input type="number" id="newFitTo" data-i18n-placeholder="merch_fit_to" placeholder="To (2022)" class="px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs">
                </div>
            </div>

            <button onclick="saveNewProduct()" class="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all" data-i18n="merch_btn_publish">
                Publish Product to Marketplace
            </button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    let merchantData = null;
    let storeOrders = [];

    document.addEventListener('DOMContentLoaded', async () => {
        // Auto-login demo merchant Hazem (Apex German Spares) if not logged in
        if (!localStorage.getItem('otlob_token')) {
            await window.quickLogin('01011110001', 'secret123');
        }
        await loadMerchantProfile();
        await loadOrders();
        await loadCatalog();
        await loadWallet();
    });

    // Re-render when language changes
    window.addEventListener('localeChanged', () => {
        loadOrders(true);
        loadCatalog();
        loadWallet(true);
    });

    async function loadMerchantProfile() {
        try {
            const res = await window.api.get('/api/v1/auth/me');
            if (res.success) {
                merchantData = res.data.merchant;
                if (merchantData) {
                    document.getElementById('merchantStoreName').textContent = merchantData.store_name;
                    document.getElementById('merchantStoreAddress').innerHTML = `<i class="fa-solid fa-location-dot mr-1 text-slate-500"></i> ${merchantData.address_text} • ${window.t('merch_cr')}: ${merchantData.commercial_register_number}`;
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function loadOrders(silent = false) {
        const list = document.getElementById('ordersList');
        if (!silent && !list.hasChildNodes()) {
            list.innerHTML = `<div class="text-center py-6 text-slate-500"><i class="fa-solid fa-circle-notch fa-spin text-xl mb-1 text-purple-500"></i><p class="text-xs">${window.t('merch_fetching_orders')}</p></div>`;
        }

        try {
            const res = await window.api.get('/api/v1/merchant/orders');
            if (res.success) {
                storeOrders = res.data;
                document.getElementById('ordersCount').textContent = storeOrders.length;

                if (storeOrders.length === 0) {
                    list.innerHTML = `<div class="text-center py-12 glass-panel rounded-2xl text-slate-500 text-xs">${window.t('merch_no_orders')}</div>`;
                    return;
                }

                const curr = window.t('currency');
                const subWord = window.t('merch_suborder');
                const custWord = window.t('merch_customer');
                const placedWord = window.t('merch_placed');
                const payoutWord = window.t('merch_subtotal_payout');
                const courWord = window.t('merch_courier_assigned');
                const awaitCourWord = window.t('merch_awaiting_courier');

                list.innerHTML = storeOrders.map(order => {
                    const statusClass = order.order_status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                        order.order_status === 'in_transit' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                        order.order_status === 'assigned_to_courier' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                                        order.order_status === 'ready_for_pickup' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                        'bg-purple-500/20 text-purple-300 border border-purple-500/30';

                    const statusLabel = window.getOrderStatusLabel(order.order_status);

                    return `
                        <div class="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                                <div>
                                    <div class="flex items-center space-x-2">
                                        <span class="font-display font-bold text-white text-sm">${subWord} #${order.order_code}</span>
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${statusClass}">
                                            ${statusLabel}
                                        </span>
                                    </div>
                                    <span class="text-[11px] text-slate-400">${custWord}: ${order.customer?.name || 'Customer'} • ${placedWord}: ${new Date(order.created_at).toLocaleTimeString()}</span>
                                </div>
                                <div class="text-right">
                                    <span class="text-[10px] text-slate-400 block">${payoutWord}</span>
                                    <span class="font-display font-bold text-base text-emerald-400">${parseFloat(order.subtotal).toFixed(2)} ${curr}</span>
                                </div>
                            </div>

                            <!-- Items in sub-order -->
                            <div class="space-y-1.5 text-xs text-slate-300">
                                ${(order.items || []).map(i => `
                                    <div class="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
                                        <span>${i.product?.name || 'Auto Part'} <span class="text-slate-500">x${i.quantity}</span></span>
                                        <span class="font-mono text-slate-300">${parseFloat(i.total_price).toFixed(2)} ${curr}</span>
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Action Controls for fulfillment transitions -->
                            <div class="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <span class="text-[11px] ${order.courier ? 'text-cyan-400 font-semibold' : 'text-slate-500'}">
                                    <i class="fa-solid fa-motorcycle mr-1 ${order.courier ? 'text-cyan-400' : 'text-slate-500'}"></i> ${order.courier ? `${courWord}: ${order.courier.user?.name || 'Assigned Courier'} (${order.courier.vehicle_type?.toUpperCase() || 'DRIVER'})` : awaitCourWord}
                                </span>

                                <div class="flex items-center space-x-2">
                                    ${order.order_status === 'pending' ? `
                                        <button onclick="updateOrderStatus('${order.id}', 'accepted_by_merchant')" class="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center">
                                            <i class="fa-solid fa-check mr-1"></i> ${window.t('merch_btn_accept')}
                                        </button>
                                    ` : ''}

                                    ${order.order_status === 'accepted_by_merchant' ? `
                                        <button onclick="updateOrderStatus('${order.id}', 'preparing')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold transition-colors">
                                            ${window.t('merch_btn_preparing')}
                                        </button>
                                    ` : ''}

                                    ${order.order_status === 'preparing' ? `
                                        <button onclick="updateOrderStatus('${order.id}', 'ready_for_pickup')" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center">
                                            <i class="fa-solid fa-bell mr-1"></i> ${window.t('merch_btn_ready')}
                                        </button>
                                    ` : ''}

                                    ${order.order_status === 'ready_for_pickup' ? `
                                        <span class="text-amber-400 text-xs font-semibold flex items-center animate-pulse bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                            <i class="fa-solid fa-satellite-dish mr-1.5"></i> ${window.t('merch_status_dispatched')}
                                        </span>
                                    ` : ''}

                                    ${order.order_status === 'assigned_to_courier' ? `
                                        <span class="text-cyan-400 text-xs font-semibold flex items-center bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                                            <i class="fa-solid fa-person-biking mr-1.5 animate-bounce"></i> ${window.t('merch_status_enroute')}
                                        </span>
                                    ` : ''}

                                    ${order.order_status === 'in_transit' ? `
                                        <span class="text-blue-400 text-xs font-semibold flex items-center bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                                            <i class="fa-solid fa-truck-fast mr-1.5"></i> ${window.t('merch_status_intransit')}
                                        </span>
                                    ` : ''}

                                    ${order.order_status === 'delivered' ? `
                                        <span class="text-emerald-400 text-xs font-semibold flex items-center bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                            <i class="fa-solid fa-circle-check mr-1.5"></i> ${window.t('merch_status_delivered')}
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (e) {
            if (!silent) {
                list.innerHTML = '<div class="text-rose-400 text-xs py-4 text-center">Failed to load orders.</div>';
            }
        }
    }

    async function updateOrderStatus(orderId, nextStatus) {
        try {
            window.showToast(window.tf('toast_transitioning', { status: window.getOrderStatusLabel(nextStatus) }), 'info');
            const res = await window.api.patch(`/api/v1/merchant/orders/${orderId}/status`, { status: nextStatus });
            if (res.success) {
                window.showToast(window.t('toast_order_updated'), 'success');
                await loadOrders();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function loadCatalog() {
        const tbody = document.getElementById('catalogTableBody');
        const curr = window.t('currency');
        const editStockLabel = window.t('merch_btn_update_stock');

        try {
            const res = await window.api.get('/api/v1/products/search?per_page=50');
            if (res.success) {
                const products = res.data;
                tbody.innerHTML = products.map(p => `
                    <tr class="hover:bg-slate-800/40 transition-colors">
                        <td class="py-3 px-4 font-bold text-white">${p.name}</td>
                        <td class="py-3 px-4 font-mono text-[11px] text-slate-400">${p.sku} / ${p.oem_number}</td>
                        <td class="py-3 px-4 text-slate-400">${p.weight_kg}kg (${p.length_cm}x${p.width_cm}x${p.height_cm}cm)</td>
                        <td class="py-3 px-4 text-emerald-400 font-bold">${parseFloat(p.price).toFixed(2)} ${curr}</td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-0.5 rounded text-[11px] font-bold ${p.stock_quantity > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}">
                                ${p.stock_quantity}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-right">
                            <button onclick="promptUpdateStock('${p.id}', ${p.stock_quantity})" class="text-purple-400 hover:text-purple-300 font-bold">
                                ${editStockLabel}
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function promptUpdateStock(productId, currentStock) {
        const newStock = prompt(window.t('merch_prompt_stock'), currentStock);
        if (newStock !== null && !isNaN(newStock)) {
            try {
                const res = await window.api.patch(`/api/v1/merchant/products/${productId}/stock`, {
                    stock_quantity: parseInt(newStock)
                });
                if (res.success) {
                    window.showToast(window.t('toast_stock_updated'), 'success');
                    await loadCatalog();
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    async function loadWallet() {
        const curr = window.t('currency');
        try {
            const res = await window.api.get('/api/v1/merchant/wallet');
            if (res.success) {
                const w = res.data;
                document.getElementById('merchantWalletBalance').textContent = `${parseFloat(w.balance).toFixed(2)} ${curr}`;

                const tbody = document.getElementById('walletTableBody');
                if (w.statement && w.statement.length) {
                    tbody.innerHTML = w.statement.map(s => `
                        <tr>
                            <td class="py-3 px-4 text-slate-400">${new Date(s.created_at).toLocaleString()}</td>
                            <td class="py-3 px-4 font-mono text-[11px]">${s.transaction?.description || 'Payment Settlement'}</td>
                            <td class="py-3 px-4 uppercase font-bold text-[10px] ${s.entry_type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}">${s.entry_type}</td>
                            <td class="py-3 px-4 font-bold ${s.entry_type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}">
                                ${s.entry_type === 'credit' ? '+' : '-'}${parseFloat(s.amount).toFixed(2)} ${curr}
                            </td>
                            <td class="py-3 px-4 text-white font-mono">${parseFloat(s.running_balance).toFixed(2)} ${curr}</td>
                        </tr>
                    `).join('');
                } else {
                    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-500">${window.t('merch_no_trans')}</td></tr>`;
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    function switchTab(tab) {
        document.getElementById('tabContentOrders').classList.toggle('hidden', tab !== 'orders');
        document.getElementById('tabContentCatalog').classList.toggle('hidden', tab !== 'catalog');
        document.getElementById('tabContentWallet').classList.toggle('hidden', tab !== 'wallet');

        document.getElementById('tabBtnOrders').className = tab === 'orders' ? 'pb-3 border-b-2 border-purple-500 text-purple-400 flex items-center' : 'pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center';
        document.getElementById('tabBtnCatalog').className = tab === 'catalog' ? 'pb-3 border-b-2 border-purple-500 text-purple-400 flex items-center' : 'pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center';
        document.getElementById('tabBtnWallet').className = tab === 'wallet' ? 'pb-3 border-b-2 border-purple-500 text-purple-400 flex items-center' : 'pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center';
    }

    function openAddProductModal() { document.getElementById('addProductModal').classList.remove('hidden'); }
    function closeAddProductModal() { document.getElementById('addProductModal').classList.add('hidden'); }

    async function saveNewProduct() {
        const name = document.getElementById('newProdName').value;
        const sku = document.getElementById('newProdSku').value;
        const oem_number = document.getElementById('newProdOem').value;
        const description = document.getElementById('newProdDesc').value;
        const price = parseFloat(document.getElementById('newProdPrice').value);
        const stock_quantity = parseInt(document.getElementById('newProdStock').value);
        const weight_kg = parseFloat(document.getElementById('newProdWeight').value);
        const length_cm = parseFloat(document.getElementById('newProdL').value);
        const width_cm = parseFloat(document.getElementById('newProdW').value);
        const height_cm = parseFloat(document.getElementById('newProdH').value);

        const fitMake = document.getElementById('newFitMake').value;
        const fitModel = document.getElementById('newFitModel').value;
        const fitFrom = parseInt(document.getElementById('newFitFrom').value);
        const fitTo = parseInt(document.getElementById('newFitTo').value);

        if (!name || !sku || !oem_number || !price) {
            window.showToast(window.t('toast_fill_mandatory'), 'error');
            return;
        }

        const payload = {
            name, sku, oem_number, description, price, stock_quantity,
            weight_kg, length_cm, width_cm, height_cm, condition: 'new',
            compatibilities: (fitMake && fitModel && fitFrom && fitTo) ? [{
                make: fitMake, model: fitModel, year_from: fitFrom, year_to: fitTo
            }] : []
        };

        try {
            const res = await window.api.post('/api/v1/merchant/products', payload);
            if (res.success) {
                window.showToast(window.t('toast_product_uploaded'), 'success');
                closeAddProductModal();
                await loadCatalog();
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Auto-refresh merchant dashboard every 3 seconds for instant updates when couriers accept or deliver orders
    setInterval(async () => {
        if (!document.hidden) {
            await loadOrders(true);
            await loadWallet(true);
        }
    }, 3000);
</script>
@endpush
