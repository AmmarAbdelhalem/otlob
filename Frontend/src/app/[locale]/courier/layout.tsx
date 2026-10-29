'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Chip, Button, Switch } from '@heroui/react';
import {
  Truck,
  Wallet,
  CheckCircle2,
  Car,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Navigation,
  Circle,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

interface CourierLayoutProps {
  children: React.ReactNode;
}

export default function CourierDashboardLayout({ children }: CourierLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';

  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'courier' && user?.role !== 'admin'))) {
      router.push(`/${locale}/auth/login?redirect=/courier/dashboard`);
    }
  }, [isLoading, isAuthenticated, user, locale, router]);

  const navLinks = [
    {
      href: `/${locale}/courier/dashboard`,
      icon: <Truck className="w-4 h-4" />,
      labelAr: 'مهام التوصيل الحالية',
      labelEn: 'Active Missions',
    },
    {
      href: `/${locale}/courier/wallet`,
      icon: <Wallet className="w-4 h-4" />,
      labelAr: 'العهدة النقدية والتحصيلات',
      labelEn: 'COD Wallet & Limit',
    },
    {
      href: `/${locale}/courier/history`,
      icon: <CheckCircle2 className="w-4 h-4" />,
      labelAr: 'سجل الطلبات المسلمة',
      labelEn: 'Delivered History',
    },
    {
      href: `/${locale}/courier/settings`,
      icon: <Car className="w-4 h-4" />,
      labelAr: 'المركبة والمستندات',
      labelEn: 'Vehicle & Documents',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const drawerContent = (
    <div className="flex flex-col h-full p-4 justify-between bg-neutral-950 border-e border-neutral-800">
      <div className="space-y-4">
        <div className="px-2 py-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            {isAr ? 'قائمة المندوب' : 'Courier Menu'}
          </span>
        </div>

        <nav className="space-y-1">
          {navLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent'
                }`}
              >
                <span className={active ? 'text-white' : 'text-neutral-400'}>{item.icon}</span>
                <span className="flex-1">{isAr ? item.labelAr : item.labelEn}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1.5">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold text-neutral-200">
            {isAr ? 'نظام الملاحة GPS متصل' : 'GPS Tracking Active'}
          </span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          {isAr
            ? 'يتم بث إحداثيات موقعك للعميل وغرفة العمليات لضمان أسرع وقت استلام.'
            : 'Your live position is broadcasted for ETA and route optimization.'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black text-neutral-100">
      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 h-16 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href={`/${locale}/courier/dashboard`}>
            <div className="flex items-center gap-3">
              <Avatar
                icon={<Truck className="w-5 h-5 text-black" />}
                className="bg-white text-black font-bold shrink-0"
                size="sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {user?.name || (isAr ? 'كابتن أطلب' : 'Otlob Courier')}
                  </span>
                  <Chip size="sm" variant="flat" color="success" className="text-[10px] h-5 font-bold">
                    {isAr ? 'مندوب معتمد' : 'Verified'}
                  </Chip>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono block">
                  {isAr ? 'إدارة الشحن اللوجستي والتسليم' : 'Fleet & Dispatch Center'}
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Shift Switch */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800">
            <Circle
              className={`w-2 h-2 ${isOnline ? 'fill-emerald-400 text-emerald-400' : 'fill-neutral-500 text-neutral-500'}`}
            />
            <span className="text-xs font-bold text-neutral-300 hidden sm:inline">
              {isOnline ? (isAr ? 'متاح للطلبات' : 'Online') : (isAr ? 'غير متصل' : 'Offline')}
            </span>
            <Switch
              size="sm"
              isSelected={isOnline}
              onValueChange={setIsOnline}
              color="success"
              aria-label="Online status"
            />
          </div>

          <Button
            as={Link}
            href={`/${locale}`}
            target="_blank"
            size="sm"
            variant="bordered"
            className="hidden sm:inline-flex border-neutral-800 text-neutral-300 hover:text-white text-xs font-bold"
            endContent={<ExternalLink className="w-3.5 h-3.5" />}
          >
            {isAr ? 'المتجر' : 'Store'}
          </Button>

          <button
            onClick={() => logout()}
            className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
            title={isAr ? 'تسجيل الخروج' : 'Sign Out'}
          >
            <LogOut className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 pt-16 shrink-0 h-screen sticky top-0">
        {drawerContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-full z-10">{drawerContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pb-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
