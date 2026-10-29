import React, { Suspense } from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Locale, CustomerVehicle, OrderRecord } from '@/lib/api/types';
import { AccountLayout } from '@/components/account/AccountLayout';
import { formatMoney } from '@/lib/i18n';
import { API_BASE_URL } from '@/lib/api/client';
import {
  Car,
  Package,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ChevronRight,
  Truck,
  ExternalLink,
  PlusCircle,
  ShoppingBag,
} from 'lucide-react';

interface AccountPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;

  const cookieStore = await cookies();
  const token = cookieStore.get('otlob_token')?.value;
  const userCookie = cookieStore.get('otlob_user')?.value;

  let currentUser: any = null;
  if (userCookie) {
    try {
      currentUser = JSON.parse(userCookie);
    } catch {}
  }

  let vehicles: CustomerVehicle[] = [];
  let orders: OrderRecord[] = [];

  if (token) {
    try {
      const [vehiclesRes, ordersRes, userRes] = await Promise.all([
        fetch(`${API_BASE_URL}/customer/vehicles`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        }),
        fetch(`${API_BASE_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        }),
        fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        }),
      ]);

      if (vehiclesRes.ok) {
        const vData = await vehiclesRes.json();
        vehicles = vData.data || [];
      }
      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        orders = (oData.data || []).map((o: any) => ({
          id: o.id,
          orderCode: o.order_code,
          customerId: o.customer_id,
          subtotal: parseFloat(o.subtotal) || 0,
          deliveryFee: parseFloat(o.delivery_fee) || 0,
          serviceFee: parseFloat(o.service_fee) || 0,
          totalAmount: parseFloat(o.total_amount) || 0,
          paymentType: o.payment_type,
          paymentStatus: o.payment_status,
          orderStatus: o.order_status,
          deliveryLat: parseFloat(o.delivery_lat) || 0,
          deliveryLng: parseFloat(o.delivery_lng) || 0,
          subOrders: o.sub_orders || [],
          createdAt: o.created_at,
        }));
      }
      if (userRes.ok) {
        const uData = await userRes.json();
        currentUser = uData.data || currentUser;
      }
    } catch {
      // In case backend is temporarily unreachable
    }
  }

  const primaryVehicle = vehicles.find((v) => v.isDefault) || vehicles[0];
  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.orderStatus));
  const userStatus = currentUser?.status || 'pending';

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AccountLayout locale={locale}>
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Garage Count */}
              <div className="p-5 rounded-2xl border border-border-color bg-bg-primary shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-text-muted text-xs block">
                    {locale === 'ar' ? 'سياراتك في الجراج' : 'Saved Vehicles'}
                  </span>
                  <span className="text-xl font-black text-text-main">
                    {vehicles.length} {locale === 'ar' ? 'سيارة' : 'Vehicles'}
                  </span>
                </div>
              </div>

              {/* Active Orders Count */}
              <div className="p-5 rounded-2xl border border-border-color bg-bg-primary shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-text-muted text-xs block">
                    {locale === 'ar' ? 'الطلبات النشطة' : 'Active Orders'}
                  </span>
                  <span className="text-xl font-black text-text-main">
                    {activeOrders.length} {locale === 'ar' ? 'طلب جاري' : 'Active'}
                  </span>
                </div>
              </div>

              {/* Dynamic Account Status (Issue 4 Fix) */}
              <div className="p-5 rounded-2xl border border-border-color bg-bg-primary shadow-sm flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    userStatus === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : userStatus === 'suspended'
                      ? 'bg-rose-500/10 text-rose-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {userStatus === 'active' ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : userStatus === 'suspended' ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <Clock className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span className="text-text-muted text-xs block">
                    {locale === 'ar' ? 'حالة الحساب' : 'Account Status'}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      userStatus === 'active'
                        ? 'text-emerald-600'
                        : userStatus === 'suspended'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {userStatus === 'active'
                      ? locale === 'ar'
                        ? 'موثق ومعتمد'
                        : 'Verified Customer'
                      : userStatus === 'suspended'
                      ? locale === 'ar'
                        ? 'حساب موقوف'
                        : 'Suspended'
                      : locale === 'ar'
                      ? 'قيد المراجعة والتدقيق'
                      : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Orders Card */}
            <div className="p-6 rounded-2xl border border-border-color bg-bg-primary shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-text-main">
                  {locale === 'ar' ? 'آخر الطلبات والشحنات' : 'Recent Orders'}
                </h3>
                {orders.length > 0 && (
                  <Link
                    href={`/${locale}/account/orders`}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {locale === 'ar' ? 'عرض جميع الطلبات' : 'View all orders'}
                  </Link>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center mx-auto text-text-muted">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-text-muted">
                    {locale === 'ar'
                      ? 'لا توجد طلبات مسجلة بحسابك حتى الآن'
                      : 'You have not placed any orders yet.'}
                  </p>
                  <Link
                    href={`/${locale}/shop`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-xs transition-all"
                  >
                    <span>{locale === 'ar' ? 'ابدأ التسوق وتصفح الكتالوج' : 'Start Shopping'}</span>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border-color text-xs">
                  {orders.slice(0, 5).map((ord) => (
                    <div
                      key={ord.id}
                      className="py-4 flex items-center justify-between flex-wrap gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="font-mono text-text-main text-sm">
                            {ord.orderCode}
                          </strong>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                              ord.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'in_transit'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <span>{ord.orderStatus}</span>
                          </span>
                        </div>
                        <p className="text-text-muted text-[11px]">
                          {locale === 'ar' ? 'تاريخ الطلب:' : 'Date:'}{' '}
                          {new Date(ord.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-extrabold text-base text-text-main">
                          {formatMoney(ord.totalAmount, locale)}
                        </span>
                        <Link
                          href={`/${locale}/order-tracking?code=${ord.orderCode}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition-all"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{locale === 'ar' ? 'تتبع مباشر' : 'Live Track'}</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Garage Quick Preview Card */}
            <div className="p-6 rounded-2xl border border-border-color bg-bg-primary shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-text-main">
                  {locale === 'ar' ? 'السيارة الأساسية في الجراج' : 'Primary Vehicle in Garage'}
                </h3>
                <Link
                  href={`/${locale}/account/garage`}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  {locale === 'ar' ? 'إدارة الجراج' : 'Manage Garage'}
                </Link>
              </div>

              {primaryVehicle ? (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-text-main">
                        {primaryVehicle.make} {primaryVehicle.model} {primaryVehicle.year}
                      </h4>
                      {primaryVehicle.vin && (
                        <p className="text-[11px] text-text-muted font-mono mt-0.5">
                          VIN: {primaryVehicle.vin}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/${locale}/shop?make=${encodeURIComponent(
                      primaryVehicle.make
                    )}&model=${encodeURIComponent(
                      primaryVehicle.model
                    )}&year=${primaryVehicle.year}&compatible_only=true`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline"
                  >
                    <span>{locale === 'ar' ? 'تصفح القطع المتوافقة' : 'Browse Matching Parts'}</span>
                    <ExternalLink className="w-3.5 h-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-border-color bg-bg-secondary/20 text-center space-y-3">
                  <Car className="w-8 h-8 text-text-muted mx-auto" />
                  <p className="text-xs text-text-muted">
                    {locale === 'ar'
                      ? 'لم تقم بتسجيل أي سيارة في جراجك بعد، أضف سيارتك لتصفية القطع المتوافقة بنقرة واحدة!'
                      : 'No vehicles registered in your garage yet. Add your vehicle for 1-click fitment filtering!'}
                  </p>
                  <Link
                    href={`/${locale}/account/garage`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-xs transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{locale === 'ar' ? 'إضافة سيارة الآن' : 'Add Vehicle'}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </AccountLayout>
      </div>
    </div>
  );
}
