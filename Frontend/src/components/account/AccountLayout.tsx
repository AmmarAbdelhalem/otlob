'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  User,
  Car,
  Package,
  Heart,
  Repeat,
  LogOut,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  Store,
  Truck,
} from 'lucide-react';
import { Locale } from '@/lib/api/types';
import { getMessages } from '@/lib/i18n';

interface AccountLayoutProps {
  locale: Locale;
  children: React.ReactNode;
}

interface CurrentUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({ locale, children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const t = getMessages(locale);

  const [user, setUser] = useState<any>(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/otlob_user=([^;]+)/);
      if (match) {
        try {
          return JSON.parse(decodeURIComponent(match[1]));
        } catch {}
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(user === null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res?.data) {
          setUser(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push(`/${locale}/auth/login`);
      router.refresh();
    } catch {
      router.push(`/${locale}/auth/login`);
    }
  };

  const navItems = [
    {
      href: `/${locale}/account`,
      labelAr: 'نظرة عامة على الحساب',
      labelEn: 'Account Overview',
      icon: User,
      exact: true,
    },
    {
      href: `/${locale}/account/garage`,
      labelAr: 'جراج سياراتي',
      labelEn: 'My Garage',
      icon: Car,
    },
    {
      href: `/${locale}/account/orders`,
      labelAr: 'طلباتي وشحناتي',
      labelEn: 'My Orders',
      icon: Package,
    },
    {
      href: `/${locale}/wishlist`,
      labelAr: 'قائمة الرغبات والمفضلة',
      labelEn: 'My Wishlist',
      icon: Heart,
    },
    {
      href: `/${locale}/compare`,
      labelAr: 'مقارنة القطع والمواصفات',
      labelEn: 'Compare Parts',
      icon: Repeat,
    },
  ];

  const firstLetter = (user?.name || 'م').trim().charAt(0);

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Title */}
      <div className="space-y-2">
        <nav className="flex items-center gap-2 text-xs text-text-muted">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">
            {locale === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-text-main font-medium">{t.nav.account}</span>
        </nav>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl font-black text-text-main">
            {locale === 'ar' ? 'حساب العميل والجراج الخاص' : 'Customer Account & Garage'}
          </h1>
          {user?.role === 'admin' && (
            <a
              href={process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin` : 'http://localhost:8000/admin'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{locale === 'ar' ? 'لوحة تحكم الإدارة (Filament CMS)' : 'Admin CMS Portal'}</span>
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav (3 cols) */}
        <aside className="lg:col-span-3 rounded-2xl border border-border-color bg-bg-primary overflow-hidden shadow-sm">
          {/* User mini banner */}
          <div className="p-5 bg-bg-secondary/40 border-b border-border-color flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-3 w-full animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-bg-secondary shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-bg-secondary rounded w-24" />
                  <div className="h-2.5 bg-bg-secondary rounded w-32" />
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20 shrink-0">
                  {firstLetter}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-text-main truncate">
                    {user?.name || (locale === 'ar' ? 'حساب العميل' : 'User Account')}
                  </h2>
                  <p className="text-[11px] text-text-muted font-mono mt-0.5 truncate">
                    {user?.phone || user?.email || ''}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user?.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {user?.role === 'admin'
                      ? 'مدير عام'
                      : user?.role === 'merchant'
                      ? 'تاجر قطع'
                      : user?.role === 'courier'
                      ? 'مندوب'
                      : user?.status === 'active'
                      ? 'عميل معتمد'
                      : 'قيد التفعيل'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1 text-xs">
            {/* Vendor Switch Button if merchant */}
            {user?.role === 'merchant' && (
              <Link
                href={`/${locale}/vendor/dashboard`}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-all border border-primary/20 mb-2"
              >
                <Store className="w-4 h-4 flex-shrink-0" />
                <span>{locale === 'ar' ? 'لوحة تحكم المتجر (Vendor Hub)' : 'Vendor Dashboard'}</span>
              </Link>
            )}

            {/* Courier Switch Button if courier */}
            {user?.role === 'courier' && (
              <Link
                href={`/${locale}/courier/dashboard`}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 transition-all border border-emerald-200 dark:border-emerald-800 mb-2"
              >
                <Truck className="w-4 h-4 flex-shrink-0" />
                <span>{locale === 'ar' ? 'تطبيق المندوب (Courier Hub)' : 'Courier Dashboard'}</span>
              </Link>
            )}

            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-text-main hover:bg-bg-secondary/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{locale === 'ar' ? item.labelAr : item.labelEn}</span>
                </Link>
              );
            })}

            {/* Admin Link if admin */}
            {user?.role === 'admin' && (
              <a
                href={process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin` : 'http://localhost:8000/admin'}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all"
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span>{locale === 'ar' ? 'لوحة تحكم الإدارة (Filament)' : 'Admin CMS Portal'}</span>
              </a>
            )}

            <div className="pt-2 border-t border-border-color my-1">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer text-start disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 flex-shrink-0 rtl:rotate-180" />
                <span>
                  {loggingOut
                    ? locale === 'ar'
                      ? 'جاري الخروج...'
                      : 'Signing out...'
                    : locale === 'ar'
                    ? 'تسجيل الخروج'
                    : 'Sign Out'}
                </span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Content Area (9 cols) */}
        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
};
