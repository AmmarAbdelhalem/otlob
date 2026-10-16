@extends('layouts.portal')

@section('title', 'Otlob Platform Hub — 4 Integrated Ecosystems')

@section('content')
<div class="space-y-10 py-4">

    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-12 border border-slate-800">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 max-w-3xl">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span data-i18n="hub_badge">Backend Live & Tested • 4 Integrated Frontends</span>
            </div>
            <h1 class="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight leading-tight" data-i18n="hub_title">
                One Platform. Four Unified Ecosystems.
            </h1>
            <p class="mt-4 text-slate-300 text-lg leading-relaxed" data-i18n="hub_subtitle">
                Seamless auto parts on-demand delivery connecting Customers, Merchants, and Couriers under strict Double-Entry Financial Accounting and Admin Operations.
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
                <a href="/customer" class="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] transition-all flex items-center">
                    <i class="fa-solid fa-cart-shopping mr-2"></i> <span data-i18n="hub_btn_customer">Launch Customer Store</span>
                </a>
                <a href="/merchant" class="px-5 py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 hover:scale-[1.02] transition-all flex items-center">
                    <i class="fa-solid fa-store mr-2"></i> <span data-i18n="hub_btn_merchant">Launch Merchant Portal</span>
                </a>
                <a href="/courier" class="px-5 py-3 rounded-xl bg-amber-600 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:scale-[1.02] transition-all flex items-center">
                    <i class="fa-solid fa-motorcycle mr-2"></i> <span data-i18n="hub_btn_courier">Launch Courier App</span>
                </a>
                <a href="/admin" class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 hover:scale-[1.02] transition-all flex items-center">
                    <i class="fa-solid fa-shield-halved mr-2"></i> <span data-i18n="hub_btn_admin">Admin Operations</span>
                </a>
            </div>
        </div>
    </div>

    <!-- 4 Portals Interactive Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <!-- Card 1: Customer -->
        <div class="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-brand-500/40 transition-all group">
            <div>
                <div class="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                    <i class="fa-solid fa-user-astronaut"></i>
                </div>
                <div class="flex items-center justify-between">
                    <h3 class="font-display font-bold text-xl text-white" data-i18n="card_customer_title">Customer App</h3>
                    <span class="text-xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-semibold" data-i18n="card_customer_role">Storefront</span>
                </div>
                <p class="text-slate-400 text-sm mt-3 leading-relaxed" data-i18n="card_customer_desc">
                    Vehicle garage selection, OEM & fitment catalog search, multi-merchant split cart, delivery fee calculator, and real-time GPS tracking.
                </p>
                <div class="mt-4 pt-4 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                    <p><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> <span data-i18n="card_customer_f1">Auto Order-Splitting by Merchant</span></p>
                    <p><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> <span data-i18n="card_customer_f2">Unique 6-Digit Delivery OTP</span></p>
                    <p><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> <span data-i18n="card_customer_f3">Garage Car Management</span></p>
                </div>
            </div>
            <div class="mt-6 pt-4 border-t border-slate-800/80 flex flex-col space-y-2">
                <a href="/customer" class="w-full text-center py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-colors flex items-center justify-center">
                    <span data-i18n="card_customer_action">Enter Customer Store &rarr;</span>
                </a>
                <button onclick="quickLogin('01012345678', 'secret123', '/customer')" class="w-full text-center py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center justify-center">
                    <i class="fa-solid fa-bolt mr-1 text-amber-400"></i> <span data-i18n="card_customer_demo">1-Click Demo Login (Mohamed)</span>
                </button>
            </div>
        </div>

        <!-- Card 2: Merchant -->
        <div class="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/40 transition-all group">
            <div>
                <div class="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                    <i class="fa-solid fa-store"></i>
                </div>
                <div class="flex items-center justify-between">
                    <h3 class="font-display font-bold text-xl text-white" data-i18n="card_merchant_title">Merchant Portal</h3>
                    <span class="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold" data-i18n="card_merchant_role">Store Manager</span>
                </div>
                <p class="text-slate-400 text-sm mt-3 leading-relaxed" data-i18n="card_merchant_desc">
                    Publish automotive parts with dimensions (m³) and vehicle compatibility models, live inventory adjust, sub-order fulfillment, and wallet statements.
                </p>
                <div class="mt-4 pt-4 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                    <p><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> <span data-i18n="card_merchant_f1">Vehicle Fitment Year Ranges</span></p>
                    <p><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> <span data-i18n="card_merchant_f2">Order Preparation Kanban</span></p>
                    <p><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> <span data-i18n="card_merchant_f3">Wallet Statement & Balance</span></p>
                </div>
            </div>
            <div class="mt-6 pt-4 border-t border-slate-800/80 flex flex-col space-y-2">
                <a href="/merchant" class="w-full text-center py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors flex items-center justify-center">
                    <span data-i18n="card_merchant_action">Enter Merchant Portal &rarr;</span>
                </a>
                <button onclick="quickLogin('01011110001', 'secret123', '/merchant')" class="w-full text-center py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center justify-center">
                    <i class="fa-solid fa-bolt mr-1 text-purple-400"></i> <span data-i18n="card_merchant_demo">1-Click Demo Login (Apex Auto)</span>
                </button>
            </div>
        </div>

        <!-- Card 3: Courier -->
        <div class="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition-all group">
            <div>
                <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                    <i class="fa-solid fa-motorcycle"></i>
                </div>
                <div class="flex items-center justify-between">
                    <h3 class="font-display font-bold text-xl text-white" data-i18n="card_courier_title">Courier App</h3>
                    <span class="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold" data-i18n="card_courier_role">Delivery Fleet</span>
                </div>
                <p class="text-slate-400 text-sm mt-3 leading-relaxed" data-i18n="card_courier_desc">
                    Online beacon status, Redis GPS broadcast, dispatched sub-order discovery, cargo weight/volume checks, OTP delivery verification, and cash remittance.
                </p>
                <div class="mt-4 pt-4 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                    <p><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> <span data-i18n="card_courier_f1">Volumetric Cargo Filtering</span></p>
                    <p><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> <span data-i18n="card_courier_f2">COD Limit Safety Shield</span></p>
                    <p><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> <span data-i18n="card_courier_f3">OTP Ledger Auto-Settlement</span></p>
                </div>
            </div>
            <div class="mt-6 pt-4 border-t border-slate-800/80 flex flex-col space-y-2">
                <a href="/courier" class="w-full text-center py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors flex items-center justify-center">
                    <span data-i18n="card_courier_action">Enter Courier App &rarr;</span>
                </a>
                <button onclick="quickLogin('01022220001', 'secret123', '/courier')" class="w-full text-center py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center justify-center">
                    <i class="fa-solid fa-bolt mr-1 text-amber-400"></i> <span data-i18n="card_courier_demo">1-Click Demo Login (Tarek Bike)</span>
                </button>
            </div>
        </div>

        <!-- Card 4: Admin -->
        <div class="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all group">
            <div>
                <div class="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div class="flex items-center justify-between">
                    <h3 class="font-display font-bold text-xl text-white" data-i18n="card_admin_title">Admin Operations</h3>
                    <span class="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold" data-i18n="card_admin_role">Governance</span>
                </div>
                <p class="text-slate-400 text-sm mt-3 leading-relaxed" data-i18n="card_admin_desc">
                    Live system GMV, escrow balance, service fee revenue, merchant approvals, courier COD audits, and 1-click cash remittance double-entry clearance.
                </p>
                <div class="mt-4 pt-4 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                    <p><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> <span data-i18n="card_admin_f1">Double-Entry Journal Audit</span></p>
                    <p><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> <span data-i18n="card_admin_f2">Merchant & Driver Approvals</span></p>
                    <p><i class="fa-solid fa-check text-emerald-400 mr-1.5"></i> <span data-i18n="card_admin_f3">Global Sub-Orders Oversight</span></p>
                </div>
            </div>
            <div class="mt-6 pt-4 border-t border-slate-800/80 flex flex-col space-y-2">
                <a href="/admin" class="w-full text-center py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 font-semibold text-sm transition-colors flex items-center justify-center">
                    <span data-i18n="card_admin_action">Enter Admin Operations &rarr;</span>
                </a>
                <button onclick="quickLogin('01000000000', 'secret123', '/admin')" class="w-full text-center py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center justify-center">
                    <i class="fa-solid fa-bolt mr-1 text-cyan-400"></i> <span data-i18n="card_admin_demo">1-Click Demo Login (Admin)</span>
                </button>
            </div>
        </div>

    </div>

    <!-- Live Flow Diagram -->
    <div class="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
        <h2 class="font-display font-bold text-xl text-white mb-2 flex items-center">
            <i class="fa-solid fa-diagram-project text-brand-400 mr-2.5"></i> <span data-i18n="flow_title">End-to-End Split-Delivery Lifecycle</span>
        </h2>
        <p class="text-slate-400 text-sm mb-6" data-i18n="flow_subtitle">
            Watch how every action in one portal immediately affects the others through shared database state, Redis tracking, and automated double-entry ledger settlement:
        </p>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div class="text-brand-400 font-bold mb-1 flex items-center"><span class="w-5 h-5 rounded-full bg-brand-500/20 text-center inline-block mr-1.5 leading-5 text-[10px]">1</span> <span data-i18n="flow_step1_title">Cart Split Checkout</span></div>
                <p class="text-slate-400" data-i18n="flow_step1_desc">Customer places order. Items group by merchant. Individual sub-orders generate with separate delivery fees and secret OTPs.</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div class="text-purple-400 font-bold mb-1 flex items-center"><span class="w-5 h-5 rounded-full bg-purple-500/20 text-center inline-block mr-1.5 leading-5 text-[10px]">2</span> <span data-i18n="flow_step2_title">Store Preparation</span></div>
                <p class="text-slate-400" data-i18n="flow_step2_desc">Merchants see their sub-orders. Once marked "Ready for Pickup", Redis proximity discovery alerts nearby qualified couriers.</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div class="text-amber-400 font-bold mb-1 flex items-center"><span class="w-5 h-5 rounded-full bg-amber-500/20 text-center inline-block mr-1.5 leading-5 text-[10px]">3</span> <span data-i18n="flow_step3_title">Courier Fleet Claim</span></div>
                <p class="text-slate-400" data-i18n="flow_step3_desc">Courier accepts order, picks up items, and starts live GPS tracking towards customer drop-off location.</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div class="text-emerald-400 font-bold mb-1 flex items-center"><span class="w-5 h-5 rounded-full bg-emerald-500/20 text-center inline-block mr-1.5 leading-5 text-[10px]">4</span> <span data-i18n="flow_step4_title">OTP Settlement</span></div>
                <p class="text-slate-400" data-i18n="flow_step4_desc">Courier enters customer's 6-digit OTP. Ledger atomically disburses courier shipping, merchant parts payment, and platform service fees.</p>
            </div>
        </div>
    </div>

</div>
@endsection
