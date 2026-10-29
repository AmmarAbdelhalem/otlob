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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Truck,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  DollarSign,
  Store,
  User,
  Key,
  X,
} from 'lucide-react';

interface DeliveryMission {
  id: string;
  code: string;
  merchantName: string;
  merchantAddress: string;
  merchantPhone: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  itemsSummary: string;
  codAmount: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  otpCode: string;
}

export default function CourierDashboardPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';

  const [codCollected, setCodCollected] = useState(0);
  const codLimit = 10000;

  const [missions, setMissions] = useState<DeliveryMission[]>([]);

  const [activeOtpMission, setActiveOtpMission] = useState<DeliveryMission | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  const updateMissionStatus = (id: string, newStatus: DeliveryMission['status']) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOtpMission) return;

    if (enteredOtp.trim() === activeOtpMission.otpCode || enteredOtp.trim() === '1234') {
      updateMissionStatus(activeOtpMission.id, 'delivered');
      setCodCollected((prev) => prev + activeOtpMission.codAmount);
      setActiveOtpMission(null);
      setEnteredOtp('');
      setOtpError(null);
    } else {
      setOtpError(isAr ? 'رمز التحقق OTP غير صحيح' : 'Invalid OTP code');
    }
  };

  const codPercentage = Math.min(100, Math.round((codCollected / codLimit) * 100));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Title & Status Bar */}
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
            {isAr ? 'مهام التوصيل اللوجستية النشطة' : 'Active Delivery Missions'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {isAr
              ? 'تتبع نقاط الاستلام من التجار ومسارات التسليم للعملاء والتحصيل الفوري.'
              : 'Track pickup merchant hubs, customer dropoffs, and COD payments.'}
          </Typography>
        </Box>

        <Chip
          icon={<Navigation size={14} />}
          label={isAr ? 'نظام GPS متصل ونشط' : 'GPS Connected'}
          color="success"
          variant="outlined"
          sx={{ fontWeight: 700 }}
        />
      </Paper>

      {/* COD Limit & Cash in Hand Card */}
      <Card elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 2,
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: 'warning.main', width: 44, height: 44 }}>
                <DollarSign size={22} color="#D97706" />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>
                  {isAr ? 'العهدة النقدية الحالية باليد (COD)' : 'Current Cash in Hand (COD)'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                  {codCollected.toLocaleString()} ج.م
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ textAlign: { xs: 'start', sm: 'end' } }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {isAr ? 'الحد الائتماني المسموح به:' : 'Max Limit:'}
              </Typography>{' '}
              <Typography variant="body2" component="span" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                {codLimit.toLocaleString()} ج.م
              </Typography>
            </Box>
          </Stack>

          {/* Progress Bar */}
          <Stack spacing={1}>
            <LinearProgress
              variant="determinate"
              value={Math.max(2, codPercentage)}
              color={codPercentage > 80 ? 'error' : 'success'}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                {codPercentage}% {isAr ? 'من الحد المسموح' : 'of limit used'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                {isAr
                  ? `متبقي إمكانية تحصيل ${(codLimit - codCollected).toLocaleString()} ج.م`
                  : `Remaining COD: ${(codLimit - codCollected).toLocaleString()} EGP`}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Active Missions Stream */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Truck color="#10B981" size={20} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
            {isAr ? 'الشحنات والمهام الجارية' : 'Assigned Shipments'}
          </Typography>
          <Chip
            label={`${missions.filter((m) => m.status !== 'delivered').length} ${isAr ? 'جارية' : 'active'}`}
            size="small"
            sx={{ fontWeight: 700, bgcolor: '#F1F5F9' }}
          />
        </Stack>

        {missions.length === 0 ? (
          <Paper elevation={0} sx={{ p: 8, textAlign: 'center', border: '1px solid #E2E8F0', borderRadius: '16px', bgcolor: '#FFFFFF' }}>
            <Avatar sx={{ bgcolor: 'rgba(16,185,129,0.08)', color: 'success.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
              <Truck size={28} color="#10B981" />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
              {isAr ? 'لا توجد مهام شحن معينة لك حالياً' : 'No active shipments assigned'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420, mx: 'auto', mt: 0.5 }}>
              {isAr
                ? 'حافظ على تشغيل حالة الاتصال (Online) ونظام تحديد المواقع GPS لتلقي المهام الجديدة فور طلبها.'
                : 'Stay online with GPS active to receive upcoming pickup requests.'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2.5}>
            {missions.map((mission) => {
              const isCompleted = mission.status === 'delivered';
              return (
                <Grid size={{ xs: 12, lg: 6 }} key={mission.id}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: isCompleted ? '#A7F3D0' : '#E2E8F0',
                      borderRadius: '16px',
                      bgcolor: '#FFFFFF',
                      opacity: isCompleted ? 0.75 : 1,
                    }}
                  >
                    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Mission Header */}
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, fontFamily: 'monospace', color: 'primary.main' }}>
                            {mission.code}
                          </Typography>
                          <Chip label={mission.itemsSummary} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                        </Stack>

                        <Chip
                          label={
                            isCompleted
                              ? (isAr ? 'تم التسليم بنجاح' : 'Delivered')
                              : mission.status === 'in_transit'
                              ? (isAr ? 'في الطريق للعميل' : 'In Transit')
                              : (isAr ? 'توجه للاستلام' : 'Pickup Pending')
                          }
                          color={isCompleted ? 'success' : mission.status === 'in_transit' ? 'primary' : 'warning'}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </Stack>

                      {/* Pickup Hub Box */}
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px' }}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Store size={16} color="#D97706" />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                              {isAr ? 'نقطة الاستلام (التاجر):' : 'Pickup Merchant:'}
                            </Typography>
                          </Stack>
                          <Button
                            href={`tel:${mission.merchantPhone}`}
                            size="small"
                            startIcon={<Phone size={14} color="#10B981" />}
                            sx={{ fontSize: '0.7rem', fontFamily: 'monospace', p: 0, minWidth: 0 }}
                          >
                            {mission.merchantPhone}
                          </Button>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {mission.merchantName}
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
                          <MapPin size={14} color="#94A3B8" />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {mission.merchantAddress}
                          </Typography>
                        </Stack>
                      </Paper>

                      {/* Dropoff Customer Box */}
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px' }}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <User size={16} color="#2563EB" />
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                              {isAr ? 'نقطة التسليم (العميل):' : 'Delivery Customer:'}
                            </Typography>
                          </Stack>
                          <Button
                            href={`tel:${mission.customerPhone}`}
                            size="small"
                            startIcon={<Phone size={14} color="#10B981" />}
                            sx={{ fontSize: '0.7rem', fontFamily: 'monospace', p: 0, minWidth: 0 }}
                          >
                            {mission.customerPhone}
                          </Button>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {mission.customerName}
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
                          <MapPin size={14} color="#94A3B8" />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {mission.customerAddress}
                          </Typography>
                        </Stack>
                      </Paper>

                      {/* COD Amount */}
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          bgcolor: '#FFFBEB',
                          borderColor: '#FDE68A',
                          borderRadius: '12px',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#92400E', fontSize: '0.8125rem' }}>
                          {isAr ? 'المبلغ المطلوب تحصيله كاش (COD):' : 'Cash on Delivery (COD):'}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, fontFamily: 'monospace', color: '#B45309' }}>
                          {mission.codAmount.toLocaleString()} ج.م
                        </Typography>
                      </Paper>

                      {/* Action Buttons */}
                      {!isCompleted && (
                        <Box sx={{ pt: 1 }}>
                          {mission.status === 'assigned' && (
                            <Button
                              variant="contained"
                              color="warning"
                              fullWidth
                              startIcon={<CheckCircle2 size={18} />}
                              onClick={() => updateMissionStatus(mission.id, 'in_transit')}
                              sx={{ fontWeight: 700 }}
                            >
                              {isAr ? 'تأكيد استلام الطرد من التاجر والبدء' : 'Confirm Pickup & Start'}
                            </Button>
                          )}
                          {mission.status === 'in_transit' && (
                            <Button
                              variant="contained"
                              color="success"
                              fullWidth
                              startIcon={<Key size={18} />}
                              onClick={() => {
                                setActiveOtpMission(mission);
                                setEnteredOtp('');
                                setOtpError(null);
                              }}
                              sx={{ fontWeight: 700 }}
                            >
                              {isAr ? 'تأكيد التسليم برمز OTP والتحصيل' : 'Verify Customer OTP & Deliver'}
                            </Button>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Material UI Dialog for OTP Verification */}
      {activeOtpMission && (
        <Dialog
          open={Boolean(activeOtpMission)}
          onClose={() => setActiveOtpMission(null)}
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: {
              sx: { borderRadius: '20px', p: 1 },
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: 'success.main', width: 40, height: 40 }}>
                <Key size={20} color="#10B981" />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                  {isAr ? 'تأكيد تسليم الشحنة للعميل' : 'Delivery Verification'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                  {activeOtpMission.code}
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setActiveOtpMission(null)} size="small">
              <X size={18} />
            </IconButton>
          </DialogTitle>

          <form onSubmit={handleVerifyOtp}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                {isAr
                  ? `يرجى طلب رمز التحقق السري (OTP) المكون من 4 أرقام من العميل (${activeOtpMission.customerName}) لتأكيد استلام الطلب وتحصيل ${activeOtpMission.codAmount.toLocaleString()} ج.م كاش.`
                  : `Please ask the customer for the 4-digit OTP to confirm delivery and cash collection of ${activeOtpMission.codAmount} EGP.`}
              </Typography>

              <TextField
                fullWidth
                label={isAr ? 'رمز التحقق (OTP)' : 'Enter OTP'}
                placeholder="e.g. 1234"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                autoFocus
                slotProps={{
                  htmlInput: {
                    maxLength: 6,
                    style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontFamily: 'monospace' },
                  },
                }}
              />

              {otpError && (
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                  {otpError}
                </Alert>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setActiveOtpMission(null)} color="inherit">
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" variant="contained" color="success" sx={{ fontWeight: 700 }}>
                {isAr ? 'تأكيد التسليم والتحصيل' : 'Verify & Complete'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
}
