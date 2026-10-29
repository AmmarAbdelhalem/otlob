import React from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/api/types';
import { AccountLayout } from '@/components/account/AccountLayout';
import { services } from '@/lib/api';
import { formatMoney } from '@/lib/i18n';
import { Truck, Store, ExternalLink, Calendar, Package } from 'lucide-react';

interface OrdersHistoryPageProps {
  params: Promise<{ locale: string }>;
}

export default async function OrdersHistoryPage({ params }: OrdersHistoryPageProps) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'en' ? 'en' : 'ar') as Locale;

  const ordersRes = await services.order.getOrders(1);
  const orders = ordersRes.data;

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AccountLayout locale={locale}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span>{locale === 'ar' ? 'سجل الطلبات والشحنات' : 'Order History'}</span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {locale === 'ar'
                    ? 'تابع جميع طلباتك السابقة وتتبع الشحنات الجارية لحظياً على الخريطة'
                    : 'Track previous orders and view live delivery courier status'}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {orders.length} {locale === 'ar' ? 'طلبات' : 'orders'}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 rounded-2xl border border-border-color bg-bg-secondary/20 text-center text-xs text-text-muted">
                {locale === 'ar' ? 'لم تقم بإنشاء أي طلبات حتى الآن.' : 'You have not placed any orders yet.'}
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 rounded-2xl border border-border-color bg-bg-primary shadow-sm space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs border-b border-border-color pb-3">
                      <div className="space-y-0.5">
                        <span className="font-mono font-black text-sm text-text-main block">
                          {ord.orderCode}
                        </span>
                        <span className="text-[11px] text-text-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(ord.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{ord.orderStatus === 'in_transit' ? (locale === 'ar' ? 'في الطريق مع المندوب' : 'In Transit') : ord.orderStatus}</span>
                        </span>
                      </div>
                    </div>

                    {/* Sub-orders preview */}
                    <div className="space-y-2 text-xs">
                      {ord.subOrders.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 rounded-xl bg-bg-secondary/30 border border-border-color/60 space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-bold text-text-main">
                            <span className="flex items-center gap-1.5 text-primary">
                              <Store className="w-3.5 h-3.5" />
                              {sub.merchant?.storeName || sub.merchant?.name || 'تاجر قطع غيار'}
                            </span>
                            <span className="font-mono">{formatMoney(sub.totalAmount, locale)}</span>
                          </div>
                          <div className="divide-y divide-border-color/40 text-[11px] text-text-muted">
                            {sub.items.map((it) => (
                              <div key={it.id} className="py-1 flex justify-between">
                                <span className="truncate max-w-[260px]">
                                  {it.quantity}× {it.product?.name || `القطعة #${it.productId}`}
                                </span>
                                <span className="font-mono">{formatMoney(it.totalPrice, locale)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border-color flex-wrap gap-2 text-xs">
                      <div className="flex items-baseline gap-2">
                        <span className="text-text-muted">{locale === 'ar' ? 'المجموع الكلي:' : 'Total:'}</span>
                        <span className="font-mono font-black text-base text-primary">
                          {formatMoney(ord.totalAmount, locale)}
                        </span>
                      </div>

                      <Link
                        href={`/${locale}/order-tracking?code=${ord.orderCode}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition-all"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{locale === 'ar' ? 'تتبع مسار الشحنة المباشر' : 'Live Track Shipment'}</span>
                        <ExternalLink className="w-3 h-3 rtl:rotate-180" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AccountLayout>
      </div>
    </div>
  );
}
