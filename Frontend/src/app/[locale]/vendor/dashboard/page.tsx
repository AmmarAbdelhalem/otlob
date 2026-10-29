'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardBody,
  Chip,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Clock,
  Truck,
  Plus,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

interface VendorSubOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  vehicle: string;
  itemsCount: number;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready_for_pickup' | 'delivered';
  createdAt: string;
}

export default function VendorDashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<VendorSubOrder[]>([]);

  // Fetch real merchant orders from backend
  useEffect(() => {
    async function fetchMerchantOrders() {
      try {
        const res = await fetch('/api/v1/merchant/orders');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            const mapped: VendorSubOrder[] = json.data.map((o: any) => ({
              id: o.id,
              orderNumber: o.order_code,
              customerName: o.customer?.name || (isAr ? 'العميل' : 'Customer'),
              vehicle: o.customer?.vehicles?.[0] ? `${o.customer.vehicles[0].make} ${o.customer.vehicles[0].model}` : (isAr ? 'سيارة العميل' : 'Vehicle'),
              itemsCount: o.items?.length || 1,
              totalAmount: Number(o.total_amount || 0),
              status: o.order_status === 'preparing' ? 'preparing' : o.order_status === 'ready_for_pickup' ? 'ready_for_pickup' : o.order_status === 'delivered' ? 'delivered' : 'pending',
              createdAt: o.created_at ? new Date(o.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '',
            }));
            setOrders(mapped);
          }
        }
      } catch {
        // Fallback to empty state
      }
    }
    fetchMerchantOrders();
  }, [isAr]);

  const updateOrderStatus = (id: string, newStatus: VendorSubOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const statusMap: Record<
    VendorSubOrder['status'],
    { label: string; color: 'warning' | 'primary' | 'secondary' | 'success' }
  > = {
    pending: {
      label: isAr ? 'جديد بانتظار التجهيز' : 'New Order',
      color: 'warning',
    },
    preparing: {
      label: isAr ? 'جاري تجهيز القطع' : 'Preparing Parts',
      color: 'primary',
    },
    ready_for_pickup: {
      label: isAr ? 'جاهز للمندوب' : 'Ready for Courier',
      color: 'secondary',
    },
    delivered: {
      label: isAr ? 'تم التسليم' : 'Delivered',
      color: 'success',
    },
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isAr ? 'لوحة أداء المبيعات والتوريد' : 'Vendor Operations & Sales'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {isAr
              ? `أهلاً بك في متجر ${user?.name || 'التاجر المعتمد'}. تابع طلبياتك ومخزونك في الوقت الفعلي.`
              : `Welcome to ${user?.name || 'Merchant'}. Track your parts orders and inventory live.`}
          </p>
        </div>

        <Button
          className="bg-white text-black font-bold text-xs"
          startContent={<Plus className="w-4 h-4" />}
        >
          {isAr ? 'إضافة قطعة غيار للمخزن' : 'Add Auto Part'}
        </Button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-950 border border-neutral-800">
          <CardBody className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">
                {isAr ? 'مبيعات الأسبوع' : 'Weekly Revenue'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black font-mono text-white block">
                0 {isAr ? 'ج.م' : 'EGP'}
              </span>
              <span className="text-[11px] text-neutral-500">
                {isAr ? 'لا توجد مبيعات مسجلة بعد' : 'No sales recorded yet'}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-neutral-950 border border-neutral-800">
          <CardBody className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">
                {isAr ? 'طلبات قيد المتابعة' : 'Active Orders'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black font-mono text-white block">
                {orders.length} {isAr ? 'طلبات' : 'Orders'}
              </span>
              <span className="text-[11px] text-neutral-500">
                {orders.filter((o) => o.status === 'pending').length} {isAr ? 'بانتظار بدء التجهيز' : 'pending dispatch'}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-neutral-950 border border-neutral-800">
          <CardBody className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">
                {isAr ? 'القطع المعروضة بالمخزن' : 'Active Stock SKUs'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black font-mono text-white block">
                0 {isAr ? 'قطعة' : 'Parts'}
              </span>
              <span className="text-[11px] text-neutral-500">
                {isAr ? 'جميع القطع موثقة برقم OEM' : 'Catalog parts indexed by OEM'}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-neutral-950 border border-neutral-800">
          <CardBody className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">
                {isAr ? 'متوسط سرعة التجهيز' : 'Avg. Dispatch Speed'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black font-mono text-white block">-</span>
              <span className="text-[11px] text-neutral-500">
                {isAr ? 'في انتظار أول إرسالية' : 'Awaiting first order'}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Live Orders Section */}
      <Card className="bg-neutral-950 border border-neutral-800">
        <CardBody className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-300" />
              <h2 className="text-base font-bold text-white">
                {isAr ? 'طابور الطلبات الواردة للفرع' : 'Incoming Branch Orders'}
              </h2>
            </div>
            <Chip size="sm" variant="flat" className="font-bold text-[10px] bg-neutral-900 text-neutral-300">
              {isAr ? 'تحديث تلقائي حي' : 'Live Sync'}
            </Chip>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-neutral-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">
                {isAr ? 'لا توجد طلبات واردة حالياً' : 'No incoming orders right now'}
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                {isAr
                  ? 'ستظهر هنا طلبات العملاء فور إسنادها لفرعكم لبدء التجهيز والتسليم لمندوب الشحن.'
                  : 'Customer orders assigned to your branch will appear here in real time.'}
              </p>
            </div>
          ) : (
            <Table
              aria-label="Vendor Orders Table"
              classNames={{
                wrapper: 'bg-transparent shadow-none p-0',
                th: 'bg-neutral-900 text-neutral-400 font-bold text-xs border-b border-neutral-800',
                td: 'text-neutral-200 text-xs border-b border-neutral-850 py-3',
              }}
            >
              <TableHeader>
                <TableColumn>{isAr ? 'رقم الطلب' : 'Order'}</TableColumn>
                <TableColumn>{isAr ? 'العميل / السيارة' : 'Customer / Car'}</TableColumn>
                <TableColumn>{isAr ? 'القطع' : 'Items'}</TableColumn>
                <TableColumn>{isAr ? 'القيمة' : 'Amount'}</TableColumn>
                <TableColumn>{isAr ? 'الحالة' : 'Status'}</TableColumn>
                <TableColumn align="end">{isAr ? 'الإجراءات' : 'Actions'}</TableColumn>
              </TableHeader>
              <TableBody>
                {orders.map((ord) => {
                  const badge = statusMap[ord.status];
                  return (
                    <TableRow key={ord.id}>
                      <TableCell>
                        <span className="font-mono font-bold text-white block">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[10px] text-neutral-500 block">
                          {ord.createdAt}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-white block">{ord.customerName}</span>
                        <span className="text-[10px] text-neutral-400">{ord.vehicle}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">{ord.itemsCount} {isAr ? 'قطع' : 'pcs'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-bold text-emerald-400">
                          {ord.totalAmount.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={badge.color}
                          className="font-bold text-[10px]"
                        >
                          {badge.label}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {ord.status === 'pending' && (
                            <Button
                              size="sm"
                              className="bg-white text-black font-bold text-xs"
                              onClick={() => updateOrderStatus(ord.id, 'preparing')}
                            >
                              {isAr ? 'بدء التجهيز' : 'Start Preparation'}
                            </Button>
                          )}
                          {ord.status === 'preparing' && (
                            <Button
                              size="sm"
                              className="bg-emerald-500 text-black font-bold text-xs"
                              startContent={<Truck className="w-3.5 h-3.5" />}
                              onClick={() => updateOrderStatus(ord.id, 'ready_for_pickup')}
                            >
                              {isAr ? 'جاهز للمندوب' : 'Ready'}
                            </Button>
                          )}
                          {ord.status === 'ready_for_pickup' && (
                            <Chip
                              startContent={<Clock className="w-3 h-3" />}
                              size="sm"
                              variant="flat"
                              className="font-bold text-[10px] bg-neutral-900 text-neutral-400"
                            >
                              {isAr ? 'في انتظار المندوب' : 'Awaiting Courier'}
                            </Chip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
