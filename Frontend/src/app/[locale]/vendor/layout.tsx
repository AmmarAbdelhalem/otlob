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
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import MuiProvider from '@/components/theme/MuiProvider';
import { useAuthStore } from '@/stores/useAuthStore';

interface VendorLayoutProps {
  children: React.ReactNode;
}

function VendorLayoutInner({ children }: VendorLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';

  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'merchant' && user?.role !== 'admin'))) {
      router.push(`/${locale}/auth/login?redirect=/vendor/dashboard`);
    }
  }, [isLoading, isAuthenticated, user, locale, router]);

  const navLinks = [
    {
      href: `/${locale}/vendor/dashboard`,
      icon: <TrendingUp size={18} />,
      labelAr: 'نظرة عامة والمبيعات',
      labelEn: 'Overview & Analytics',
    },
    {
      href: `/${locale}/vendor/orders`,
      icon: <ShoppingBag size={18} />,
      labelAr: 'الطلبات الواردة',
      labelEn: 'Incoming Orders',
    },
    {
      href: `/${locale}/vendor/products`,
      icon: <Package size={18} />,
      labelAr: 'المنتجات والمخزون',
      labelEn: 'Parts & Stock',
    },
    {
      href: `/${locale}/vendor/settings`,
      icon: <Settings size={18} />,
      labelAr: 'إعدادات المتجر والفرع',
      labelEn: 'Store Settings',
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const isPending = user?.status === 'pending';

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Box sx={{ px: 1, py: 1.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {isAr ? 'إدارة الفرع والتوريد' : 'Vendor Navigation'}
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
                  bgcolor: active ? 'rgba(37,99,235,0.08)' : 'transparent',
                  color: active ? 'primary.main' : 'text.primary',
                  fontWeight: active ? 700 : 500,
                  border: active ? '1px solid rgba(37,99,235,0.2)' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: active ? 'rgba(37,99,235,0.12)' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <Typography sx={{ flex: 1, fontSize: '0.8125rem', fontWeight: active ? 700 : 500 }}>
                  {isAr ? item.labelAr : item.labelEn}
                </Typography>
                {active && (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC', borderColor: '#E2E8F0', borderRadius: '16px' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
          <ShieldCheck size={16} color="#2563EB" />
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.primary' }}>
            {isAr ? 'رخصة المتجر المعتمد' : 'Verified Vendor License'}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
          {isAr
            ? 'موثق برقم السجل التجاري والفرع المعتمد لدى منصة أطلب لقطع الغيار.'
            : 'Registered with valid commercial records on Otlob Parts platform.'}
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
              href={`/${locale}/vendor/dashboard`}
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
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40,
                  boxShadow: '0 4px 10px rgba(37,99,235,0.25)',
                }}
              >
                <Store size={20} />
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2, color: '#0F172A' }}>
                    {user?.name || (isAr ? 'متجر التاجر المعتمد' : 'Merchant Partner')}
                  </Typography>
                  <Chip
                    label={isPending ? (isAr ? 'قيد المراجعة' : 'Pending') : (isAr ? 'موثق ومعتمد' : 'Verified')}
                    size="small"
                    color={isPending ? 'warning' : 'success'}
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                  {isAr ? 'بوابة توريد قطع الغيار' : 'Auto Parts Vendor Portal'}
                </Typography>
              </Box>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
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
              {isAr ? 'الرجوع للمتجر الرئيسي' : 'Public Store'}
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
          {isPending && (
            <Alert
              severity="warning"
              variant="outlined"
              icon={<AlertTriangle size={20} color="#D97706" />}
              sx={{
                bgcolor: '#FFFBEB',
                borderColor: '#FDE68A',
                borderRadius: '16px',
              }}
            >
              <AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>
                {isAr ? 'حساب التاجر قيد المراجعة والاعتماد' : 'Merchant Account Pending Verification'}
              </AlertTitle>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: '#92400E' }}>
                {isAr
                  ? 'تم استلام بيانات السجل التجاري ورخصة المتجر بنجاح. يتم تدقيق بيانات الفرع من فريق إدارة أطلب خلال 24 ساعة لتفعيل استقبال الطلبات الحية والتوصيل.'
                  : 'Your Commercial Register and store credentials have been received. Our operations team is reviewing your details within 24 hours to enable live order dispatch.'}
              </Typography>
            </Alert>
          )}

          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default function VendorDashboardLayout({ children }: VendorLayoutProps) {
  return (
    <MuiProvider>
      <VendorLayoutInner>{children}</VendorLayoutInner>
    </MuiProvider>
  );
}
