<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-950 text-slate-100">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Otlob Auto Parts Platform')</title>

    <!-- Google Fonts (Outfit & Plus Jakarta Sans for EN, Cairo for Arabic) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <!-- i18n Localization Engine -->
    <script src="/js/i18n.js"></script>

    <!-- Tailwind CSS (CDN for instant reactive development & styling) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Plus Jakarta Sans', 'sans-serif'],
                        display: ['Outfit', 'sans-serif'],
                        arabic: ['Cairo', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            50: '#eff6ff',
                            100: '#dbeafe',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8',
                        },
                        amber: {
                            500: '#f59e0b',
                            600: '#d97706',
                        },
                        emerald: {
                            500: '#10b981',
                            600: '#059669',
                        }
                    }
                }
            }
        }
    </script>

    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .font-display {
            font-family: 'Outfit', sans-serif;
        }
        /* Arabic RTL Typography */
        [dir="rtl"] {
            font-family: 'Cairo', sans-serif !important;
        }
        [dir="rtl"] .font-display {
            font-family: 'Cairo', sans-serif !important;
        }
        [dir="rtl"] #toastContainer {
            right: auto;
            left: 1.25rem;
        }
        [dir="rtl"] .space-x-1 > :not([hidden]) ~ :not([hidden]),
        [dir="rtl"] .space-x-2 > :not([hidden]) ~ :not([hidden]),
        [dir="rtl"] .space-x-2\.5 > :not([hidden]) ~ :not([hidden]),
        [dir="rtl"] .space-x-3 > :not([hidden]) ~ :not([hidden]),
        [dir="rtl"] .space-x-4 > :not([hidden]) ~ :not([hidden]),
        [dir="rtl"] .space-x-6 > :not([hidden]) ~ :not([hidden]) {
            --tw-space-x-reverse: 1;
        }
        [dir="rtl"] .border-l {
            border-left-width: 0;
            border-right-width: 1px;
        }
        [dir="rtl"] .pl-4 {
            padding-left: 0;
            padding-right: 1rem;
        }
        [dir="rtl"] .mr-1 { margin-right: 0; margin-left: 0.25rem; }
        [dir="rtl"] .mr-1\.5 { margin-right: 0; margin-left: 0.375rem; }
        [dir="rtl"] .mr-2 { margin-right: 0; margin-left: 0.5rem; }
        [dir="rtl"] .mr-2\.5 { margin-right: 0; margin-left: 0.625rem; }
        [dir="rtl"] .mr-3 { margin-right: 0; margin-left: 0.75rem; }
        [dir="rtl"] .ml-1 { margin-left: 0; margin-right: 0.25rem; }
        [dir="rtl"] .ml-1\.5 { margin-left: 0; margin-right: 0.375rem; }
        [dir="rtl"] .ml-2 { margin-left: 0; margin-right: 0.5rem; }

        /* Custom scrollbars */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.6);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(51, 65, 85, 0.8);
            border-radius: 9999px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 116, 139, 1);
        }
        .glass-panel {
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-card {
            background: rgba(30, 41, 59, 0.65);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.06);
        }
    </style>
    @stack('styles')
</head>
<body class="min-h-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 antialiased selection:bg-brand-600 selection:text-white">

    <!-- Global App Header / Topbar Navigation -->
    <header class="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-6">
                <a href="/" class="flex items-center space-x-3 group">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-brand-600/30 group-hover:scale-105 transition-transform">
                        <i class="fa-solid fa-gears text-lg"></i>
                    </div>
                    <div>
                        <span class="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent" data-i18n="brand_name">OTLOB</span>
                        <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400 ml-1.5 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20" data-i18n="brand_tag">Parts</span>
                    </div>
                </a>

                <!-- Nav links across portals -->
                <nav class="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800">
                    <a href="/customer" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors {{ request()->is('customer*') ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' }}">
                        <i class="fa-solid fa-cart-shopping mr-1.5"></i> <span data-i18n="nav_customer">Customer Store</span>
                    </a>
                    <a href="/merchant" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors {{ request()->is('merchant*') ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' }}">
                        <i class="fa-solid fa-store mr-1.5"></i> <span data-i18n="nav_merchant">Merchant Portal</span>
                    </a>
                    <a href="/courier" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors {{ request()->is('courier*') ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' }}">
                        <i class="fa-solid fa-motorcycle mr-1.5"></i> <span data-i18n="nav_courier">Courier App</span>
                    </a>
                    <a href="/admin" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors {{ request()->is('admin*') ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' }}">
                        <i class="fa-solid fa-shield-halved mr-1.5"></i> <span data-i18n="nav_admin">Admin Ops</span>
                    </a>
                </nav>
            </div>

            <!-- Active User / Quick Demo Login Switcher / Language Switcher -->
            <div class="flex items-center space-x-3">

                <!-- Language Toggle Button (EN | AR) -->
                <button onclick="window.toggleLocale()" id="langToggleBtn" class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm transition-all hover:scale-105" title="Switch Language / تغيير اللغة">
                    <i class="fa-solid fa-globe text-brand-400"></i>
                    <span id="langToggleText">العربية</span>
                </button>

                <div id="authStatusBadge" class="hidden items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full glass-card">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span id="authUserName" class="text-slate-300">Logged in</span>
                    <span id="authUserRole" class="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold"></span>
                    <button onclick="logoutCurrentUser()" class="text-slate-400 hover:text-rose-400 ml-1" data-i18n-title="logout" title="Logout">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                </div>

                <a href="/" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors" data-i18n-title="nav_hub" title="Platform Hub">
                    <i class="fa-solid fa-house"></i>
                </a>
            </div>
        </div>
    </header>

    <!-- Main Content Body -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        @yield('content')
    </main>

    <!-- Global Footer -->
    <footer class="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p data-i18n="footer_rights">Otlob On-Demand Auto Parts Marketplace &copy; {{ date('Y') }} — Built with Laravel 12, Redis, & Double-Entry Accounting</p>
            <div class="flex items-center space-x-4">
                <span class="flex items-center text-emerald-400"><i class="fa-solid fa-circle-check text-[10px] mr-1"></i> <span data-i18n="footer_scale">Scalable for 5M+ Users</span></span>
                <span class="text-slate-600">•</span>
                <span class="text-slate-400" data-i18n="footer_ledger">Micro-second Ledger Integrity</span>
            </div>
        </div>
    </footer>

    <!-- Toast Notification Container -->
    <div id="toastContainer" class="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none"></div>

    <!-- Global API & Session Client Script -->
    <script>
        // Centralized API client interacting with backend routes
        window.api = {
            async request(endpoint, options = {}) {
                const token = localStorage.getItem('otlob_token');
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    ...(options.headers || {})
                };

                try {
                    const response = await fetch(endpoint, {
                        ...options,
                        headers
                    });

                    const data = await response.json().catch(() => null);

                    if (!response.ok) {
                        const errorMsg = data?.message || `HTTP error ${response.status}`;
                        throw new Error(errorMsg);
                    }

                    return data;
                } catch (err) {
                    window.showToast(err.message, 'error');
                    throw err;
                }
            },

            get(endpoint) { return this.request(endpoint, { method: 'GET' }); },
            post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
            patch(endpoint, body) { return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }); }
        };

        // Quick demo logins for 1-click seamless testing across all roles
        window.quickLogin = async function(phone, password, redirectUrl) {
            try {
                window.showToast('Authenticating demo account...', 'info');
                const res = await window.api.post('/api/v1/auth/login', { login: phone, password: password });
                if (res.success && res.data.token) {
                    localStorage.setItem('otlob_token', res.data.token);
                    localStorage.setItem('otlob_user', JSON.stringify(res.data.user));
                    window.showToast('Login successful!', 'success');
                    if (redirectUrl) {
                        setTimeout(() => window.location.href = redirectUrl, 400);
                    } else {
                        window.syncAuthStatus();
                        if (typeof window.onAuthUpdated === 'function') window.onAuthUpdated();
                    }
                }
            } catch (e) {
                // Toast already shown in api.request
            }
        };

        window.logoutCurrentUser = function() {
            localStorage.removeItem('otlob_token');
            localStorage.removeItem('otlob_user');
            window.showToast('Logged out.', 'info');
            window.syncAuthStatus();
            setTimeout(() => window.location.reload(), 400);
        };

        window.syncAuthStatus = function() {
            const userStr = localStorage.getItem('otlob_user');
            const badge = document.getElementById('authStatusBadge');
            if (userStr && badge) {
                const user = JSON.parse(userStr);
                document.getElementById('authUserName').textContent = user.name || 'User';
                document.getElementById('authUserRole').textContent = user.role || 'user';
                badge.classList.remove('hidden');
                badge.classList.add('flex');
            } else if (badge) {
                badge.classList.add('hidden');
                badge.classList.remove('flex');
            }
        };

        window.showToast = function(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            if (!container) return;

            const toast = document.createElement('div');
            toast.className = `pointer-events-auto flex items-center p-4 rounded-xl text-sm font-medium shadow-2xl transition-all transform duration-300 translate-y-2 opacity-0 glass-panel border ${
                type === 'success' ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/80' :
                type === 'error' ? 'border-rose-500/40 text-rose-300 bg-rose-950/80' :
                'border-brand-500/40 text-brand-300 bg-slate-900/90'
            }`;

            const icon = type === 'success' ? 'fa-circle-check text-emerald-400' :
                         type === 'error' ? 'fa-triangle-exclamation text-rose-400' :
                         'fa-circle-info text-brand-400';

            toast.innerHTML = `<i class="fa-solid ${icon} mr-3 text-base"></i><span>${message}</span>`;
            container.appendChild(toast);

            requestAnimationFrame(() => {
                toast.classList.remove('translate-y-2', 'opacity-0');
            });

            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-x-full');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        };

        document.addEventListener('DOMContentLoaded', () => {
            window.syncAuthStatus();
        });
    </script>
    @stack('scripts')
</body>
</html>
