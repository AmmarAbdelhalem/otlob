@extends('layouts.portal')

@section('title', 'Otlob Courier App — Driver Fleet & Deliveries')

@section('content')
<div class="space-y-8 max-w-4xl mx-auto" id="courierApp">

    <!-- Driver Fleet Status Header -->
    <div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center space-x-4">
                <div class="w-14 h-14 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-600/20">
                    <i class="fa-solid fa-motorcycle"></i>
                </div>
                <div>
                    <div class="flex items-center space-x-2">
                        <span id="courierName" class="font-display font-extrabold text-xl text-white">Tarek Mansour</span>
                        <span id="vehicleTypeBadge" class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            Motorcycle
                        </span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1 flex items-center">
                        <span class="w-2 h-2 rounded-full mr-2 bg-emerald-400" id="liveDot"></span>
                        <span id="statusLabel" data-i18n="courier_fleet_title">Ready for Dispatches</span>
                    </p>
                </div>
            </div>

            <!-- Online / Offline Toggle & GPS Ping -->
            <div class="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-end">
                <button onclick="pingGpsLocation()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center" data-i18n-title="courier_ping_gps" title="Ping GPS to Redis">
                    <i class="fa-solid fa-satellite-dish mr-1.5 text-amber-400"></i> <span data-i18n="courier_ping_gps">Ping GPS Beacon</span>
                </button>
                <button onclick="toggleOnlineState()" id="onlineToggleBtn" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center">
                    <i class="fa-solid fa-power-off mr-1.5"></i> <span id="onlineBtnText" data-i18n="courier_go_offline">Go Offline</span>
                </button>
            </div>
        </div>

        <!-- COD Safety Bar & Cash in Hand Alert -->
        <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div class="space-y-1">
                <div class="flex items-center space-x-2">
                    <span class="text-slate-400 font-semibold" data-i18n="courier_cod_cash_in_hand">Collected Cash in Hand (COD Debt):</span>
                    <span id="cashInHandDisplay" class="font-bold text-amber-400">450.00 EGP</span>
                    <span class="text-slate-500">/ <span data-i18n="courier_cod_limit">Limit:</span> <span id="maxCodLimitDisplay">3,500.00 EGP</span></span>
                </div>
                <div class="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div id="codProgressBar" class="bg-amber-400 h-full rounded-full" style="width: 15%"></div>
                </div>
            </div>

            <div class="flex items-center space-x-3">
                <span id="suspensionStatusPill" class="px-2.5 py-1 rounded-full font-bold text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" data-i18n="courier_cod_active">
                    COD Active
                </span>
                <button onclick="openRemittanceModal()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] border border-slate-700">
                    <i class="fa-solid fa-money-bill-transfer mr-1 text-emerald-400"></i> <span data-i18n="courier_btn_deposit_cash">Deposit Cash (Clear Debt)</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Active Delivery Task Card -->
    <div id="activeDeliveryCard" class="hidden glass-card rounded-2xl p-6 border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center space-x-2.5">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <i class="fa-solid fa-route"></i>
                </div>
                <div>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-emerald-400" data-i18n="courier_active_task_title">Active Delivery in Progress</span>
                    <h3 id="activeOrderTitle" class="font-display font-bold text-base text-white">Order #ORD-DEMO-002-SUB-1</h3>
                </div>
            </div>
            <span id="activeOrderStatusBadge" class="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/20 text-blue-300">
                In Transit
            </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80">
                <span class="text-slate-400 block mb-1 font-bold text-[10px] uppercase" data-i18n="courier_step_pickup">1. Store Pickup</span>
                <p id="pickupStoreName" class="font-bold text-white">Nile Japanese & Korean Parts</p>
                <p class="text-slate-400 text-[11px]">58 Abbas El-Akkad, Nasr City</p>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80">
                <span class="text-slate-400 block mb-1 font-bold text-[10px] uppercase" data-i18n="courier_step_drop">2. Customer Drop-off</span>
                <p id="customerDropName" class="font-bold text-white">Mohamed Ali</p>
                <p class="text-slate-400 text-[11px]">Downtown Cairo Destination</p>
            </div>
        </div>

        <!-- Flow step action -->
        <div class="pt-2 flex flex-col sm:flex-row gap-3">
            <button onclick="confirmPickup()" id="pickupBtn" class="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center">
                <i class="fa-solid fa-box mr-2"></i> <span id="pickupBtnText" data-i18n="courier_btn_confirm_pickup">Confirm Store Pickup (Start Transit)</span>
            </button>

            <!-- OTP Input Trigger -->
            <button onclick="openOtpModal()" id="finishDeliveryBtn" class="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center">
                <i class="fa-solid fa-key mr-2"></i> <span data-i18n="courier_btn_enter_otp">Enter Customer OTP to Complete</span>
            </button>
        </div>
    </div>

    <!-- Available Dispatched Order Offers -->
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h3 class="font-display font-bold text-lg text-white flex items-center">
                <i class="fa-solid fa-bell text-amber-400 mr-2"></i> <span data-i18n="courier_nearby_offers">Nearby Available Order Offers</span>
            </h3>
            <button onclick="loadDispatchedOffers()" class="text-xs text-amber-400 hover:text-amber-300 flex items-center">
                <i class="fa-solid fa-rotate mr-1"></i> <span data-i18n="courier_scan_proximity">Scan Proximity</span>
            </button>
        </div>

        <div id="offersList" class="space-y-3">
            <!-- Dispatched offers injected via JS -->
        </div>
    </div>

    <!-- Earnings & Statement -->
    <div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
                <span class="text-[10px] uppercase font-bold text-slate-400" data-i18n="courier_total_earnings">Courier Payout Earnings</span>
                <h3 id="courierEarningsDisplay" class="font-display font-black text-2xl text-emerald-400">920.00 EGP</h3>
            </div>
            <button onclick="loadCourierWallet()" class="text-xs text-slate-400 hover:text-white">
                <i class="fa-solid fa-rotate mr-1"></i> <span data-i18n="courier_refresh_stmt">Refresh Statement</span>
            </button>
        </div>

        <div id="courierStatementList" class="space-y-2 text-xs">
            <!-- Entries injected via JS -->
        </div>
    </div>

</div>

<!-- Modal: Enter Customer Delivery OTP -->
<div id="otpModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl text-center">
        <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto shadow-lg shadow-emerald-500/20">
            <i class="fa-solid fa-shield-halved"></i>
        </div>

        <div>
            <h3 class="font-display font-bold text-xl text-white" data-i18n="otp_modal_title">Enter Customer OTP</h3>
            <p class="text-xs text-slate-400 mt-1" data-i18n="otp_modal_desc">Ask the customer for their 6-digit confirmation code to finish the delivery and trigger instant payment payout.</p>
        </div>

        <div>
            <input type="text" id="deliveryOtpInput" maxlength="6" placeholder="------" class="font-display font-black text-3xl tracking-widest text-center py-3 w-48 mx-auto rounded-2xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500">
        </div>

        <div class="flex space-x-3">
            <button onclick="closeOtpModal()" class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold" data-i18n="btn_cancel">
                Cancel
            </button>
            <button onclick="submitVerifyOtp()" id="verifyOtpBtn" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/30" data-i18n="otp_btn_verify">
                Verify & Settle
            </button>
        </div>
    </div>
</div>

<!-- Modal: Deposit Cash / Remittance Receipt -->
<div id="remittanceModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 class="font-display font-bold text-lg text-white flex items-center">
                <i class="fa-solid fa-money-bill-transfer text-emerald-400 mr-2"></i> <span data-i18n="remit_modal_title">Submit Cash Clearance</span>
            </h3>
            <button onclick="closeRemittanceModal()" class="text-slate-400 hover:text-white">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        <p class="text-xs text-slate-400" data-i18n="remit_modal_desc">Transfer collected COD cash to Otlob platform bank or InstaPay, then upload the deposit receipt below to clear your driver debt.</p>

        <div class="space-y-3 text-xs">
            <div>
                <label class="block font-semibold text-slate-400 mb-1" data-i18n="remit_lbl_amount">Deposit Amount (EGP)</label>
                <input type="number" id="remitAmount" step="10" placeholder="1000.00" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500">
            </div>

            <div>
                <label class="block font-semibold text-slate-400 mb-1" data-i18n="remit_lbl_method">Transfer Method</label>
                <select id="remitMethod" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500">
                    <option value="instapay" data-i18n="remit_opt_instapay">InstaPay App</option>
                    <option value="fawry" data-i18n="remit_opt_fawry">Fawry POS</option>
                    <option value="bank_transfer" data-i18n="remit_opt_bank">CIB Bank Transfer</option>
                    <option value="branch_cash" data-i18n="remit_opt_cash">Direct Branch Cash Deposit</option>
                </select>
            </div>

            <button onclick="submitRemittanceReceipt()" class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition-all" data-i18n="remit_btn_submit">
                Submit Receipt for Admin Audit
            </button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    let courierProfile = null;
    let activeDeliveryOrder = null;

    document.addEventListener('DOMContentLoaded', async () => {
        // Auto-login demo courier Tarek Mansour (Motorcycle) if not logged in
        if (!localStorage.getItem('otlob_token')) {
            await window.quickLogin('01022220001', 'secret123');
        }
        await loadCourierData();
        await loadDispatchedOffers();
        await loadCourierWallet();
    });

    // Re-render when language changes
    window.addEventListener('localeChanged', () => {
        loadCourierData(true);
        loadDispatchedOffers(true);
        loadCourierWallet();
    });

    async function loadCourierData(silent = false) {
        const curr = window.t('currency');
        try {
            const res = await window.api.get('/api/v1/auth/me');
            if (res.success) {
                courierProfile = res.data.courier_profile;
                if (courierProfile) {
                    document.getElementById('courierName').textContent = res.data.name;
                    document.getElementById('vehicleTypeBadge').textContent = courierProfile.vehicle_type?.toUpperCase() || 'VEHICLE';

                    const isOnline = !!courierProfile.is_online;
                    updateOnlineUI(isOnline);

                    // Cash in hand
                    const cash = parseFloat(courierProfile.collected_cash_in_hand || 0);
                    const limit = parseFloat(courierProfile.max_cod_limit || 3500);
                    document.getElementById('cashInHandDisplay').textContent = `${cash.toFixed(2)} ${curr}`;
                    document.getElementById('maxCodLimitDisplay').textContent = `${limit.toFixed(2)} ${curr}`;

                    const pct = Math.min(100, Math.round((cash / limit) * 100));
                    document.getElementById('codProgressBar').style.width = `${pct}%`;

                    const isSuspended = !!courierProfile.is_cod_suspended;
                    const pill = document.getElementById('suspensionStatusPill');
                    if (isSuspended) {
                        pill.className = 'px-2.5 py-1 rounded-full font-bold text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30';
                        pill.textContent = window.t('courier_cod_suspended');
                    } else {
                        pill.className = 'px-2.5 py-1 rounded-full font-bold text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                        pill.textContent = window.t('courier_cod_active');
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    function updateOnlineUI(isOnline) {
        const dot = document.getElementById('liveDot');
        const label = document.getElementById('statusLabel');
        const btnText = document.getElementById('onlineBtnText');
        const btn = document.getElementById('onlineToggleBtn');

        if (isOnline) {
            dot.className = 'w-2 h-2 rounded-full mr-2 bg-emerald-400 animate-pulse';
            label.textContent = window.t('courier_online_label');
            label.className = 'text-xs text-emerald-400 flex items-center';
            btnText.textContent = window.t('courier_go_offline');
            btn.className = 'px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all flex items-center';
        } else {
            dot.className = 'w-2 h-2 rounded-full mr-2 bg-slate-500';
            label.textContent = window.t('courier_offline_label');
            label.className = 'text-xs text-slate-500 flex items-center';
            btnText.textContent = window.t('courier_go_online');
            btn.className = 'px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center';
        }
    }

    async function toggleOnlineState() {
        try {
            const res = await window.api.post('/api/v1/courier/status', {});
            if (res.success) {
                updateOnlineUI(res.data.is_online);
                window.showToast(res.message, 'success');
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function pingGpsLocation() {
        // Cairo coordinates demo ping
        const lat = 30.0480 + (Math.random() - 0.5) * 0.01;
        const lng = 31.2390 + (Math.random() - 0.5) * 0.01;

        try {
            const res = await window.api.post('/api/v1/courier/location', { latitude: lat, longitude: lng });
            if (res.success) {
                window.showToast(window.tf('toast_gps_pinged', { lat: lat.toFixed(4), lng: lng.toFixed(4) }), 'success');
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function loadDispatchedOffers(silent = false) {
        const list = document.getElementById('offersList');
        if (!silent && !list.hasChildNodes()) {
            list.innerHTML = `<div class="text-center py-6 text-slate-500"><i class="fa-solid fa-circle-notch fa-spin text-xl mb-1 text-amber-500"></i><p class="text-xs">${window.t('courier_scanning')}</p></div>`;
        }

        try {
            const res = await window.api.get('/api/v1/courier/orders');
            if (res.success) {
                const { active_order, available_offers } = res.data;

                // 1. Manage Active Delivery Card
                if (active_order) {
                    showActiveDelivery(active_order);
                } else {
                    document.getElementById('activeDeliveryCard').classList.add('hidden');
                    activeDeliveryOrder = null;
                }

                // 2. Render Available Dispatched Offers
                if (!available_offers || available_offers.length === 0) {
                    list.innerHTML = `
                        <div class="glass-panel rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-800">
                            <i class="fa-solid fa-box-open text-2xl text-slate-600 mb-2 block"></i>
                            ${window.t('courier_no_offers')}<br>
                            ${window.t('courier_offers_auto')}
                        </div>
                    `;
                    return;
                }

                const curr = window.t('currency');
                const subWord = window.t('merch_suborder');
                const payoutLabel = window.t('courier_payout');
                const claimLabel = window.t('courier_btn_claim_offer');
                const cargoWord = window.t('courier_cargo');
                const itemsWord = window.t('courier_items');
                const dropWord = window.t('courier_dropoff');

                list.innerHTML = available_offers.map(offer => {
                    const storeName = offer.merchant?.store_name || 'Auto Parts Merchant';
                    const itemsCount = (offer.items || []).reduce((acc, i) => acc + i.quantity, 0);
                    const itemsDesc = (offer.items || []).map(i => i.product?.name).filter(Boolean).slice(0, 2).join(', ');
                    const fee = parseFloat(offer.delivery_fee || 45.00).toFixed(2);
                    const statusLabel = window.getOrderStatusLabel(offer.order_status);

                    return `
                        <div class="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-amber-500/30 transition-all">
                            <div>
                                <div class="flex items-center space-x-2">
                                    <span class="font-bold text-white text-sm">${storeName}</span>
                                    <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">${subWord} #${offer.order_code}</span>
                                    <span class="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-800 text-amber-300">${statusLabel}</span>
                                </div>
                                <p class="text-xs text-slate-400 mt-1">
                                    ${cargoWord}: ${itemsCount} ${itemsWord} (${itemsDesc || 'Auto Components'}) • ${dropWord}: ${offer.customer?.name || 'Customer'}
                                </p>
                            </div>
                            <div class="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                                <div class="text-right">
                                    <span class="text-[10px] text-slate-400 block">${payoutLabel}</span>
                                    <span class="font-display font-black text-emerald-400 text-base">${fee} ${curr}</span>
                                </div>
                                <button onclick="acceptOrderOffer('${offer.id}')" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center">
                                    ${claimLabel}
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (e) {
            if (!silent) {
                list.innerHTML = '<div class="text-rose-400 text-xs py-4 text-center">Failed to load offers.</div>';
            }
        }
    }

    function showActiveDelivery(order) {
        activeDeliveryOrder = order;
        const orderWord = window.t('track_order');
        document.getElementById('activeOrderTitle').textContent = `${orderWord} #${order.order_code}`;
        document.getElementById('pickupStoreName').textContent = order.merchant?.store_name || 'Merchant Counter';
        document.getElementById('customerDropName').textContent = order.customer?.name || 'Customer Destination';

        const badge = document.getElementById('activeOrderStatusBadge');
        const pickupBtn = document.getElementById('pickupBtn');
        const finishBtn = document.getElementById('finishDeliveryBtn');

        if (order.order_status === 'assigned_to_courier') {
            badge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30';
            badge.textContent = window.t('merch_status_enroute');
            pickupBtn.disabled = false;
            pickupBtn.className = 'flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center';
            pickupBtn.innerHTML = `<i class="fa-solid fa-box mr-2"></i> ${window.t('courier_btn_confirm_pickup')}`;
            finishBtn.className = 'flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs transition-all flex items-center justify-center cursor-not-allowed';
            finishBtn.disabled = true;
        } else if (order.order_status === 'in_transit') {
            badge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30';
            badge.textContent = window.t('status_in_transit');
            pickupBtn.disabled = true;
            pickupBtn.className = 'flex-1 py-3 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs transition-all flex items-center justify-center cursor-not-allowed';
            pickupBtn.innerHTML = `<i class="fa-solid fa-check mr-2"></i> ${window.t('courier_btn_picked_up')}`;
            finishBtn.className = 'flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center';
            finishBtn.disabled = false;
        }

        document.getElementById('activeDeliveryCard').classList.remove('hidden');
    }

    async function acceptOrderOffer(orderId) {
        try {
            window.showToast(window.t('toast_claiming_offer'), 'info');
            const res = await window.api.post(`/api/v1/courier/orders/${orderId}/accept`, {});
            if (res.success) {
                window.showToast(window.t('toast_offer_accepted'), 'success');
                await loadCourierData();
                await loadDispatchedOffers();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function confirmPickup() {
        if (!activeDeliveryOrder) return;
        try {
            window.showToast(window.t('toast_confirming_pickup'), 'info');
            const res = await window.api.post(`/api/v1/courier/orders/${activeDeliveryOrder.id}/pickup`, {});
            if (res.success) {
                window.showToast(window.t('toast_picked_up'), 'success');
                await loadDispatchedOffers();
            }
        } catch (e) {
            console.error(e);
        }
    }

    function openOtpModal() {
        document.getElementById('otpModal').classList.remove('hidden');
    }
    function closeOtpModal() {
        document.getElementById('otpModal').classList.add('hidden');
    }

    async function submitVerifyOtp() {
        const otp = document.getElementById('deliveryOtpInput').value.trim();
        if (otp.length !== 6) {
            window.showToast(window.t('toast_enter_otp_digits'), 'error');
            return;
        }

        if (!activeDeliveryOrder) {
            window.showToast(window.t('toast_no_active_delivery'), 'error');
            return;
        }

        const btn = document.getElementById('verifyOtpBtn');
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-1"></i> ${window.t('otp_settling')}`;

        try {
            const res = await window.api.post(`/api/v1/courier/orders/${activeDeliveryOrder.id}/verify-otp`, { otp: otp });
            if (res.success) {
                window.showToast(window.t('toast_delivery_verified'), 'success');
                closeOtpModal();
                document.getElementById('deliveryOtpInput').value = '';
                document.getElementById('activeDeliveryCard').classList.add('hidden');
                activeDeliveryOrder = null;
                await loadCourierData();
                await loadDispatchedOffers();
                await loadCourierWallet();
            }
        } catch (e) {
            console.error(e);
        } finally {
            btn.disabled = false;
            btn.innerHTML = window.t('otp_btn_verify');
        }
    }

    async function loadCourierWallet() {
        const curr = window.t('currency');
        try {
            const res = await window.api.get('/api/v1/courier/wallet');
            if (res.success) {
                const w = res.data;
                document.getElementById('courierEarningsDisplay').textContent = `${parseFloat(w.balance).toFixed(2)} ${curr}`;

                const list = document.getElementById('courierStatementList');
                if (w.statement && w.statement.length) {
                    list.innerHTML = w.statement.map(s => `
                        <div class="p-2.5 rounded-lg bg-slate-900/60 flex items-center justify-between border border-slate-800">
                            <div>
                                <span class="font-bold text-white block">${s.transaction?.description || 'Delivery Payout'}</span>
                                <span class="text-slate-400 text-[10px]">${new Date(s.created_at).toLocaleString()}</span>
                            </div>
                            <span class="font-bold text-emerald-400">+${parseFloat(s.amount).toFixed(2)} ${curr}</span>
                        </div>
                    `).join('');
                } else {
                    list.innerHTML = `<div class="text-slate-500 text-center py-4 text-xs">${window.t('courier_no_stmt')}</div>`;
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    function openRemittanceModal() { document.getElementById('remittanceModal').classList.remove('hidden'); }
    function closeRemittanceModal() { document.getElementById('remittanceModal').classList.add('hidden'); }

    async function submitRemittanceReceipt() {
        const amount = document.getElementById('remitAmount').value;
        const method = document.getElementById('remitMethod').value;

        if (!amount || parseFloat(amount) <= 0) {
            window.showToast(window.t('toast_valid_deposit'), 'error');
            return;
        }

        try {
            const res = await window.api.post('/api/v1/courier/remittances', {
                amount: parseFloat(amount),
                method: method
            });
            if (res.success) {
                window.showToast(window.t('toast_remit_submitted'), 'success');
                closeRemittanceModal();
                await loadCourierData();
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Auto-refresh courier dashboard every 3 seconds for live dispatch offers and status updates
    setInterval(async () => {
        if (!document.hidden) {
            await loadDispatchedOffers(true);
            await loadCourierData(true);
        }
    }, 3000);
</script>
@endpush
