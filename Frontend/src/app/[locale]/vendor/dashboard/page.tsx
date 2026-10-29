'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Clock,
  Truck,
  Plus,
  CheckCircle2,
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

  const updateOrderStatus = (id: string, newStatus: VendorSubOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const statusMap: Record<
    VendorSubOrder['status'],
    { label: string; color: 'warning' | 'info' | 'secondary' | 'success' }
  > = {
    pending: {
      label: isAr ? 'جديد بانتظار التجهيز' : 'New Order',
      color: 'warning',
    },
    preparing: {
      label: isAr ? 'جاري تجهيز القطع' : 'Preparing Parts',
      color: 'info',
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Title & Action Bar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
            {isAr ? 'لوحة أداء المبيعات والتوريد' : 'Vendor Operations & Sales'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {isAr
              ? `أهلاً بك في متجر ${user?.name || 'التاجر المعتمد'}. تابع طلبياتك ومخزونك في الوقت الفعلي.`
              : `Welcome to ${user?.name || 'Merchant'}. Track your parts orders and inventory live.`}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={18} />}
          sx={{ fontWeight: 700, borderRadius: '12px', px: 2.5, py: 1.25 }}
        >
          {isAr ? 'إضافة قطعة غيار للمخزن' : 'Add Auto Part'}
        </Button>
      </Paper>

      {/* KPI Cards Grid */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={{ height: '100%', border: '1px solid #E2E8F0', borderRadius: '16px', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8125rem' }}>
                  {isAr ? 'مبيعات الأسبوع' : 'Weekly Revenue'}
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: 'success.main', width: 38, height: 38 }}>
                  <TrendingUp size={20} color="#10B981" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontFamily: 'monospace', mb: 1 }}>
                0 ج.م
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {isAr ? 'لا توجد مبيعات مسجلة بعد' : 'No sales recorded yet'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={{ height: '100%', border: '1px solid #E2E8F0', borderRadius: '16px', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8125rem' }}>
                  {isAr ? 'طلبات قيد المتابعة' : 'Active Orders'}
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: 'primary.main', width: 38, height: 38 }}>
                  <ShoppingBag size={20} color="#2563EB" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontFamily: 'monospace', mb: 1 }}>
                {orders.length} {isAr ? 'طلبات' : 'Orders'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {orders.filter((o) => o.status === 'pending').length} {isAr ? 'بانتظار بدء التجهيز' : 'pending dispatch'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={{ height: '100%', border: '1px solid #E2E8F0', borderRadius: '16px', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8125rem' }}>
                  {isAr ? 'القطع المعروضة بالمخزن' : 'Active Stock SKUs'}
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: 'info.main', width: 38, height: 38 }}>
                  <Package size={20} color="#6366F1" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontFamily: 'monospace', mb: 1 }}>
                0 {isAr ? 'قطعة' : 'Parts'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {isAr ? 'جميع القطع موثقة برقم OEM' : 'Catalog parts indexed by OEM'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card elevation={0} sx={{ height: '100%', border: '1px solid #E2E8F0', borderRadius: '16px', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8125rem' }}>
                  {isAr ? 'متوسط سرعة التجهيز' : 'Avg. Dispatch Speed'}
                </Typography>
                <Avatar sx={{ bgcolor: 'rgba(124,58,237,0.1)', color: 'secondary.main', width: 38, height: 38 }}>
                  <Clock size={20} color="#7C3AED" />
                </Avatar>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', fontFamily: 'monospace', mb: 1 }}>
                -
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {isAr ? 'في انتظار أول إرسالية' : 'Awaiting first order'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Live Orders Section */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: '16px', bgcolor: '#FFFFFF' }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', pb: 2, mb: 2, borderBottom: '1px solid #F1F5F9' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ShoppingBag size={18} color="#2563EB" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
              {isAr ? 'طابور الطلبات الواردة للفرع' : 'Incoming Branch Orders'}
            </Typography>
          </Stack>
          <Chip label={isAr ? 'تحديث تلقائي حي' : 'Live Sync'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
        </Stack>

        {orders.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.08)', color: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
              <ShoppingBag size={28} color="#2563EB" />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
              {isAr ? 'لا توجد طلبات واردة حالياً' : 'No incoming orders right now'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto', mt: 0.5 }}>
              {isAr
                ? 'ستظهر هنا طلبات العملاء فور إسنادها لفرعكم لبدء التجهيز والتسليم لمندوب الشحن.'
                : 'Customer orders assigned to your branch will appear here in real time.'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 700 }}>{isAr ? 'رقم الطلب' : 'Order'}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{isAr ? 'العميل / السيارة' : 'Customer / Car'}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{isAr ? 'القطع' : 'Items'}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{isAr ? 'القيمة' : 'Amount'}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{isAr ? 'الحالة' : 'Status'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{isAr ? 'الإجراءات' : 'Actions'}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((ord) => {
                  const badge = statusMap[ord.status];
                  return (
                    <TableRow key={ord.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
                        {ord.orderNumber}
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                          {ord.createdAt}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{ord.customerName}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{ord.vehicle}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{ord.itemsCount} {isAr ? 'قطع' : 'pcs'}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {ord.totalAmount.toLocaleString()} ج.م
                      </TableCell>
                      <TableCell>
                        <Chip label={badge.label} color={badge.color} size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="right">
                        {ord.status === 'pending' && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => updateOrderStatus(ord.id, 'preparing')}
                            sx={{ fontWeight: 700 }}
                          >
                            {isAr ? 'بدء التجهيز' : 'Start Preparation'}
                          </Button>
                        )}
                        {ord.status === 'preparing' && (
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            startIcon={<Truck size={16} />}
                            onClick={() => updateOrderStatus(ord.id, 'ready_for_pickup')}
                            sx={{ fontWeight: 700 }}
                          >
                            {isAr ? 'جاهز للمندوب' : 'Ready'}
                          </Button>
                        )}
                        {ord.status === 'ready_for_pickup' && (
                          <Chip
                            icon={<Clock size={14} />}
                            label={isAr ? 'في انتظار المندوب' : 'Awaiting Courier'}
                            color="secondary"
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
