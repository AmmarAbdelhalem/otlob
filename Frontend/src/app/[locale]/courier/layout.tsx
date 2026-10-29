'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  IconButton,
  Button,
  Divider,
  Paper,
  Stack,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
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
} from 'lucide-react';
import MuiProvider from '@/components/theme/MuiProvider';
import { useAuthStore } from '@/stores/useAuthStore';

interface CourierLayoutProps {
  children: React.ReactNode;
}

function CourierLayoutInner({ children }: CourierLayoutProps) {
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
      icon: <Truck size={18} />,
      labelAr: 'مهام التوصيل الحالية',
      labelEn: 'Active Missions',
    },
    {
      href: `/${locale}/courier/wallet`,
      icon: <Wallet size={18} />,
      labelAr: 'العهدة النقدية والتحصيلات',
      labelEn: 'COD Wallet & Limit',
    },
    {
      href: `/${locale}/courier/history`,
      icon: <CheckCircle2 size={18} />,
      labelAr: 'سجل الطلبات المسلمة',
      labelEn: 'Delivered History',
    },
    {
      href: `/${locale}/courier/settings`,
      icon: <Car size={18} />,
      labelAr: 'المركبة والمستندات',
      labelEn: 'Vehicle & Documents',
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress color="success" />
      </Box>
    );
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Box sx={{ px: 1, py: 1.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {isAr ? 'قائمة المندوب' : 'Courier Menu'}
        </Typography>
      </Box>

      <List sx={{ flex: 1, p: 0 }}>
        {navLinks.map((item) => {
          const active = pathname === item.href;
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.75 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: '12px',
                  py: 1.25,
                  px: 1.75,
                  bgcolor: active ? 'rgba(16,185,129,0.08)' : 'transparent',
                  color: active ? 'success.dark' : 'text.primary',
                  fontWeight: active ? 700 : 500,
                  border: active ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: active ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? 'success.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <Typography sx={{ flex: 1, fontSize: '0.8125rem', fontWeight: active ? 700 : 500 }}>
                  {isAr ? item.labelAr : item.labelEn}
                </Typography>
                {active && (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC', borderColor: '#E2E8F0', borderRadius: '16px' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
          <Navigation size={16} color="#10B981" />
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.primary' }}>
            {isAr ? 'نظام الملاحة GPS متصل' : 'GPS Tracking Active'}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
          {isAr
            ? 'يتم بث إحداثيات موقعك للعميل وغرفة العمليات لضمان أسرع وقت استلام.'
            : 'Your live position is broadcasted for ETA and route optimization.'}
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Material UI AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, minHeight: 64 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ display: { md: 'none' } }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </IconButton>

            <Box
              component={Link}
              href={`/${locale}/courier/dashboard`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'success.main',
                  width: 40,
                  height: 40,
                  boxShadow: '0 4px 10px rgba(16,185,129,0.25)',
                }}
              >
                <Truck size={20} />
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2, color: '#0F172A' }}>
                    {user?.name || (isAr ? 'كابتن أطلب' : 'Otlob Courier')}
                  </Typography>
                  <Chip
                    label={isAr ? 'مندوب معتمد' : 'Verified'}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                  {isAr ? 'إدارة الشحن اللوجستي والتسليم' : 'Fleet & Dispatch Center'}
                </Typography>
              </Box>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {/* Shift Switch */}
            <Paper
              variant="outlined"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.25,
                borderRadius: '50px',
                bgcolor: '#F8FAFC',
              }}
            >
              <Circle size={8} fill={isOnline ? '#10B981' : '#94A3B8'} color={isOnline ? '#10B981' : '#94A3B8'} />
              <Typography variant="caption" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'inline' } }}>
                {isOnline ? (isAr ? 'متاح للطلبات' : 'Online') : (isAr ? 'غير متصل' : 'Offline')}
              </Typography>
              <Switch
                size="small"
                checked={isOnline}
                onChange={(e) => setIsOnline(e.target.checked)}
                color="success"
              />
            </Paper>

            <Button
              component={Link}
              href={`/${locale}`}
              target="_blank"
              variant="outlined"
              size="small"
              endIcon={<ExternalLink size={14} />}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                color: 'text.primary',
                borderColor: '#E2E8F0',
                bgcolor: '#F8FAFC',
                '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
              }}
            >
              {isAr ? 'المتجر' : 'Store'}
            </Button>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, height: 24, alignSelf: 'center' }} />

            <IconButton
              onClick={() => logout()}
              color="error"
              size="small"
              sx={{
                border: '1px solid #FEE2E2',
                bgcolor: '#FEF2F2',
                '&:hover': { bgcolor: '#FEE2E2' },
              }}
              title={isAr ? 'تسجيل الخروج' : 'Sign Out'}
            >
              <LogOut size={16} style={{ transform: isAr ? 'rotate(180deg)' : 'none' }} />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 260,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
            borderRight: '1px solid #E2E8F0',
            top: 64,
            height: 'calc(100vh - 64px)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
            top: 64,
            height: 'calc(100vh - 64px)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - 260px)` },
          mt: '64px',
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Box sx={{ maxWidth: '1440px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default function CourierDashboardLayout({ children }: CourierLayoutProps) {
  return (
    <MuiProvider>
      <CourierLayoutInner>{children}</CourierLayoutInner>
    </MuiProvider>
  );
}
