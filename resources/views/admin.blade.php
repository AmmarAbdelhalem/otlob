@extends('layouts.portal')

@section('title', 'Otlob Admin Operations & Financial Governance')

@section('content')
<div class="space-y-8" id="adminApp">

    <!-- Top Stats / Financial KPIs Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card rounded-2xl p-5 border border-cyan-500/30">
            <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span data-i18n="admin_kpi_earnings">Platform Service Revenue</span>
                <i class="fa-solid fa-sack-dollar text-emerald-400 text-base"></i>
            </div>
            <span id="kpiPlatformEarnings" class="font-display font-black text-2xl text-emerald-400">8,450.00 EGP</span>
            <span class="text-[10px] text-slate-400 block mt-1" data-i18n="admin_kpi_earnings_sub">Net platform service fees & commission</span>
        </div>

        <div class="glass-card rounded-2xl p-5 border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span data-i18n="admin_kpi_escrow">Active Escrow Vault</span>
                <i class="fa-solid fa-vault text-cyan-400 text-base"></i>
            </div>
            <span id="kpiEscrowBalance" class="font-display font-black text-2xl text-cyan-400">50,000.00 EGP</span>
            <span class="text-[10px] text-slate-400 block mt-1" data-i18n="admin_kpi_escrow_sub">Holding funds for pending card settlements</span>
        </div>

        <div class="glass-card rounded-2xl p-5 border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span data-i18n="admin_kpi_gmv">Gross Merchandise Value</span>
                <i class="fa-solid fa-chart-line text-brand-400 text-base"></i>
            </div>
            <span id="kpiGrossVolume" class="font-display font-black text-2xl text-white">142,800.00 EGP</span>
            <span class="text-[10px] text-slate-400 block mt-1" data-i18n="admin_kpi_gmv_sub">Lifetime marketplace transaction volume</span>
        </div>

        <div class="glass-card rounded-2xl p-5 border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span data-i18n="admin_kpi_delivered">Delivered Sub-Orders</span>
                <i class="fa-solid fa-circle-check text-emerald-400 text-base"></i>
            </div>
            <span id="kpiDeliveredCount" class="font-display font-black text-2xl text-white">68</span>
            <span class="text-[10px] text-emerald-400 block mt-1" data-i18n="admin_kpi_delivered_sub">100% Verified OTP settlements</span>
        </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-slate-800 space-x-4 text-sm font-semibold">
        <button onclick="switchAdminTab('merchants')" id="btnTabMerchants" class="pb-3 border-b-2 border-cyan-500 text-cyan-400 flex items-center">
            <i class="fa-solid fa-store mr-2"></i> <span data-i18n="admin_tab_merchants">Pending Stores</span> (<span id="pendingMerchantsCount">0</span>)
        </button>
        <button onclick="switchAdminTab('couriers')" id="btnTabCouriers" class="pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center">
            <i class="fa-solid fa-motorcycle mr-2"></i> <span data-i18n="admin_tab_couriers">Courier Fleet Audits</span>
        </button>
        <button onclick="switchAdminTab('remittances')" id="btnTabRemittances" class="pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center">
            <i class="fa-solid fa-money-bill-transfer mr-2"></i> <span data-i18n="admin_tab_remittances">Cash Remittances</span>
        </button>
        <button onclick="switchAdminTab('orders')" id="btnTabOrders" class="pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center">
            <i class="fa-solid fa-globe mr-2"></i> <span data-i18n="admin_tab_orders">Global Live Orders</span>
        </button>
    </div>

    <!-- TAB 1: Merchant Approvals -->
    <div id="contentTabMerchants" class="space-y-4">
        <div class="flex items-center justify-between">
            <h3 class="font-display font-bold text-lg text-white" data-i18n="admin_merchants_heading">Merchant Stores Awaiting Certification</h3>
            <button onclick="loadPendingMerchants()" class="text-xs text-cyan-400 hover:text-cyan-300 flex items-center">
                <i class="fa-solid fa-rotate mr-1"></i> <span data-i18n="admin_refresh_list">Refresh List</span>
            </button>
        </div>

        <div id="pendingMerchantsList" class="space-y-3">
            <!-- Cards injected via JS -->
        </div>
    </div>

    <!-- TAB 2: Courier Fleet & COD Auditing -->
    <div id="contentTabCouriers" class="space-y-4 hidden">
        <div class="flex items-center justify-between">
            <h3 class="font-display font-bold text-lg text-white" data-i18n="admin_couriers_heading">Courier Driver Fleet & COD Limits</h3>
            <span class="text-xs text-slate-400" data-i18n="admin_couriers_sub">Drivers exceeding COD limit are automatically suspended</span>
        </div>

        <div id="couriersAuditList" class="space-y-3">
            <!-- Couriers listed via JS -->
        </div>
    </div>

    <!-- TAB 3: Remittance Clearance -->
    <div id="contentTabRemittances" class="space-y-4 hidden">
        <div class="flex items-center justify-between">
            <h3 class="font-display font-bold text-lg text-white" data-i18n="admin_remittances_heading">Courier Remittance Deposits (Double-Entry Clearance)</h3>
            <span class="text-xs text-slate-400" data-i18n="admin_remittances_sub">Auditing deposit receipt clears driver liability in ledger</span>
        </div>

        <div id="remittancesList" class="space-y-3">
            <!-- Remittance Cards injected via JS -->
        </div>
    </div>

    <!-- TAB 4: Global Orders Oversight -->
    <div id="contentTabOrders" class="space-y-4 hidden">
        <div class="flex items-center justify-between">
            <h3 class="font-display font-bold text-lg text-white" data-i18n="admin_orders_heading">Global Order Flow Oversight</h3>
            <span class="text-xs text-slate-400" data-i18n="admin_orders_sub">Parent & Sub-Orders with OTP states</span>
        </div>

        <div id="globalOrdersList" class="space-y-3">
            <!-- Orders injected via JS -->
        </div>
    </div>

</div>
@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', async () => {
        // Auto-login demo admin if not logged in
        if (!localStorage.getItem('otlob_token')) {
            await window.quickLogin('01000000000', 'secret123');
        }
        await loadFinancialReports();
        await loadPendingMerchants();
        await loadCouriersAudit();
        await loadRemittances();
        await loadGlobalOrders();
    });

    // Re-render when language changes
    window.addEventListener('localeChanged', () => {
        loadFinancialReports();
        loadGlobalOrders();
        loadPendingMerchants();
        loadRemittances();
        loadCouriersAudit();
    });

    async function loadFinancialReports() {
        const curr = window.t('currency');
        try {
            const res = await window.api.get('/api/v1/admin/reports/financials');
            if (res.success) {
                const f = res.data;
                document.getElementById('kpiPlatformEarnings').textContent = `${parseFloat(f.platform_earnings_balance || 8450).toFixed(2)} ${curr}`;
                document.getElementById('kpiEscrowBalance').textContent = `${parseFloat(f.platform_escrow_balance || 50000).toFixed(2)} ${curr}`;
                if (f.total_gross_merchandise_value) {
                    document.getElementById('kpiGrossVolume').textContent = `${parseFloat(f.total_gross_merchandise_value).toFixed(2)} ${curr}`;
                }
                if (f.total_delivered_sub_orders) {
                    document.getElementById('kpiDeliveredCount').textContent = f.total_delivered_sub_orders;
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function loadPendingMerchants() {
        const list = document.getElementById('pendingMerchantsList');
        const ownerWord = window.t('admin_owner');
        const crWord = window.t('merch_cr');
        const reviewWord = window.t('admin_pending_review');
        const approveBtnWord = window.t('admin_btn_approve_store');

        try {
            const res = await window.api.get('/api/v1/admin/merchants/pending');
            if (res.success) {
                const merchants = res.data;
                document.getElementById('pendingMerchantsCount').textContent = merchants.length;

                if (merchants.length === 0) {
                    list.innerHTML = `<div class="glass-panel rounded-2xl p-8 text-center text-slate-500 text-xs">${window.t('admin_no_pending_stores')}</div>`;
                    return;
                }

                list.innerHTML = merchants.map(m => `
                    <div class="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div class="flex items-center space-x-2">
                                <span class="font-display font-bold text-white text-base">${m.store_name}</span>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">${reviewWord}</span>
                            </div>
                            <p class="text-xs text-slate-400 mt-1">${ownerWord}: ${m.user?.name} (${m.user?.phone}) • ${crWord}: <span class="font-mono text-slate-300">${m.commercial_register_number}</span></p>
                            <p class="text-[11px] text-slate-500 mt-0.5"><i class="fa-solid fa-location-dot mr-1"></i> ${m.address_text} (${m.latitude}, ${m.longitude})</p>
                        </div>
                        <button onclick="approveMerchantStore('${m.id}')" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all flex items-center">
                            <i class="fa-solid fa-circle-check mr-1.5"></i> ${approveBtnWord}
                        </button>
                    </div>
                `).join('');
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function approveMerchantStore(merchantId) {
        try {
            const res = await window.api.patch(`/api/v1/admin/merchants/${merchantId}/approve`, {});
            if (res.success) {
                window.showToast(window.t('toast_store_approved'), 'success');
                await loadPendingMerchants();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function loadCouriersAudit() {
        const list = document.getElementById('couriersAuditList');
        const curr = window.t('currency');
        const suspendedTag = window.t('courier_cod_suspended');
        const activeTag = window.t('admin_active_fleet');
        const unfreezeBtn = window.t('admin_btn_unfreeze_courier');
        const normalTag = window.t('admin_normal_standing');
        const vehWord = window.t('track_vehicle');
        const limitWord = window.t('courier_cod_limit');

        list.innerHTML = `
            <div class="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="font-bold text-white text-base">Karim Zaki</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">${suspendedTag}</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">${vehWord}: Sedan Car • Cash: <span class="font-bold text-rose-400">4,500.00 ${curr}</span> (${limitWord} 3,000.00 ${curr})</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Submitted InstaPay remittance receipt #REM-EGY-78192 for 2,500 ${curr}.</p>
                </div>
                <button onclick="unfreezeCourierDemo()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all">
                    ${unfreezeBtn}
                </button>
            </div>
            <div class="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="font-bold text-white text-base">Tarek Mansour</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">${activeTag}</span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">${vehWord}: Motorcycle • Cash: <span class="font-bold text-emerald-400">450.00 ${curr}</span> (${limitWord} 3,500.00 ${curr})</p>
                </div>
                <span class="text-xs text-emerald-400 font-semibold"><i class="fa-solid fa-check mr-1"></i> ${normalTag}</span>
            </div>
        `;
    }

    function unfreezeCourierDemo() {
        window.showToast(window.t('toast_courier_unfrozen'), 'success');
    }

    async function loadRemittances() {
        const list = document.getElementById('remittancesList');
        const curr = window.t('currency');
        const viaWord = window.t('admin_via');
        const submittedWord = window.t('admin_submitted');
        const settleBtnWord = window.t('admin_btn_audit_settle');

        try {
            const res = await window.api.get('/api/v1/admin/remittances');
            if (res.success) {
                const remittances = res.data;
                if (!remittances || remittances.length === 0) {
                    list.innerHTML = `<div class="glass-panel rounded-2xl p-6 text-center text-slate-500 text-xs">${window.t('admin_no_pending_remit')}</div>`;
                    return;
                }

                list.innerHTML = remittances.map(r => `
                    <div class="glass-card rounded-2xl p-5 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div class="flex items-center space-x-2">
                                <span class="font-mono text-xs text-cyan-400 font-bold">#${r.reference_number}</span>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 uppercase">${r.status}</span>
                            </div>
                            <h4 class="font-bold text-white text-sm mt-1">${r.courier?.name || 'Courier'} — ${parseFloat(r.amount).toFixed(2)} ${curr} ${viaWord} ${r.method?.toUpperCase()}</h4>
                            <p class="text-xs text-slate-400 mt-0.5">${submittedWord}: ${new Date(r.created_at).toLocaleString()}</p>
                        </div>
                        <button onclick="approveRemittance('${r.id}')" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center">
                            <i class="fa-solid fa-check-double mr-1.5"></i> ${settleBtnWord}
                        </button>
                    </div>
                `).join('');
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function approveRemittance(id) {
        try {
            const res = await window.api.post(`/api/v1/admin/remittances/${id}/approve`, {});
            if (res.success) {
                window.showToast(res.message, 'success');
                await loadRemittances();
                await loadCouriersAudit();
                await loadFinancialReports();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function loadGlobalOrders() {
        const list = document.getElementById('globalOrdersList');
        const curr = window.t('currency');
        const orderWord = window.t('track_order');
        const custWord = window.t('merch_customer');
        const totWord = window.t('admin_total');
        const courWord = window.t('merch_courier_assigned');
        const awaitCour = window.t('merch_awaiting_courier');

        try {
            const res = await window.api.get('/api/v1/admin/orders');
            if (res.success) {
                const orders = res.data;
                if (!orders || orders.length === 0) {
                    list.innerHTML = `<div class="glass-panel rounded-2xl p-8 text-center text-slate-500 text-xs">${window.t('admin_no_orders')}</div>`;
                    return;
                }

                list.innerHTML = orders.map(o => {
                    const statusClass = o.order_status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                        o.order_status === 'in_transit' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                        o.order_status === 'assigned_to_courier' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                                        o.order_status === 'ready_for_pickup' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                        'bg-purple-500/20 text-purple-300 border border-purple-500/30';

                    const statusLabel = window.getOrderStatusLabel(o.order_status);

                    return `
                        <div class="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                            <div>
                                <div class="flex items-center space-x-2">
                                    <span class="font-bold text-white text-sm">${orderWord} #${o.order_code}</span>
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${statusClass}">
                                        ${statusLabel}
                                    </span>
                                </div>
                                <span class="text-slate-400 block mt-1">${custWord}: ${o.customer?.name || 'Customer'} • ${totWord}: <strong class="text-emerald-400">${parseFloat(o.total_amount).toFixed(2)} ${curr}</strong></span>
                            </div>
                            <div class="text-right">
                                <span class="font-mono text-cyan-400 block font-bold">${o.delivery_otp ? `OTP: ${o.delivery_otp}` : ''}</span>
                                <span class="text-[11px] text-slate-400">${o.courier ? `${courWord}: ${o.courier.user?.name || 'Assigned'}` : awaitCour}</span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (e) {
            console.error(e);
        }
    }

    function switchAdminTab(tab) {
        document.getElementById('contentTabMerchants').classList.toggle('hidden', tab !== 'merchants');
        document.getElementById('contentTabCouriers').classList.toggle('hidden', tab !== 'couriers');
        document.getElementById('contentTabRemittances').classList.toggle('hidden', tab !== 'remittances');
        document.getElementById('contentTabOrders').classList.toggle('hidden', tab !== 'orders');

        document.getElementById('btnTabMerchants').className = tab === 'merchants' ? 'pb-3 border-b-2 border-cyan-500 text-cyan-400 flex items-center' : 'pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center';
        document.getElementById('btnTabCouriers').className = tab === 'couriers' ? 'pb-3 border-b-2 border-cyan-500 text-cyan-400 flex items-center' : 'pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center';
        document.getElementById('btnTabRemittances').className = tab === 'remittances' ? 'pb-3 border-b-2 border-cyan-500 text-cyan-400 flex items-center' : 'pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center';
        document.getElementById('btnTabOrders').className = tab === 'orders' ? 'pb-3 border-b-2 border-cyan-500 text-cyan-400 flex items-center' : 'pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center';
    }

    // Auto-refresh admin KPI reports and global orders every 4 seconds
    setInterval(async () => {
        if (!document.hidden) {
            await loadFinancialReports();
            await loadGlobalOrders();
            await loadPendingMerchants();
        }
    }, 4000);
</script>
@endpush
