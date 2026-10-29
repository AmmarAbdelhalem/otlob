'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import {
  Lock,
  Phone,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Car,
  Store,
  Sparkles,
} from 'lucide-react';
import { Locale } from '@/lib/api/types';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawLocale = (params?.locale as string) || 'ar';
  const locale: Locale = rawLocale === 'en' ? 'en' : 'ar';
  const redirectUrl = searchParams.get('redirect');

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickFill = (userLogin: string, userPass: string) => {
    setLogin(userLogin);
    setPassword(userPass);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password) {
      setErrorMsg(
        locale === 'ar'
          ? 'يرجى إدخال البريد الإلكتروني / الهاتف وكلمة المرور'
          : 'Please enter your login and password'
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: login.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(
          data.message ||
            (locale === 'ar'
              ? 'بيانات الدخول غير صحيحة، يرجى التأكد من الهاتف/البريد وكلمة المرور'
              : 'Invalid credentials. Please verify your login and password.')
        );
        setLoading(false);
        return;
      }

      const userRole = data.data?.user?.role;

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (userRole === 'admin') {
        const backendAdminUrl = process.env.NEXT_PUBLIC_BACKEND_URL
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin`
          : 'http://localhost:8000/admin';
        window.location.href = backendAdminUrl;
        return;
      } else {
        router.push(`/${locale}/account`);
      }
      router.refresh();
    } catch {
      setErrorMsg(
        locale === 'ar'
          ? 'تعذر الاتصال بخادم المصادقة، يرجى المحاولة بعد قليل'
          : 'Failed to connect to authentication server. Please try again.'
      );
      setLoading(false);
    }
  };

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-bg-secondary/40">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-2xl font-black text-primary tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
              <Car className="w-6 h-6" />
            </div>
            <span>اطلب | Otlob</span>
          </Link>
          <h1 className="text-2xl font-black text-text-main tracking-tight">
            {locale === 'ar' ? 'تسجيل الدخول إلى حسابك' : 'Sign in to your account'}
          </h1>
          <p className="text-xs text-text-muted">
            {locale === 'ar'
              ? 'بوابتك لسوق قطع الغيار المعتمدة في مصر - عملاء، تجار ومندوبين'
              : 'Access Egypt’s premier multi-vendor auto parts marketplace'}
          </p>
        </div>

        {/* Demo Quick-Fill Accounts Banner */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-primary">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'حسابات التجربة السريعة:' : 'Quick Demo Credentials:'}</span>
            </span>
            <span className="text-[10px] font-normal text-text-muted">كلمة السر: secret123</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@otlob.com', 'secret123')}
              className="px-2.5 py-1.5 rounded-xl bg-bg-primary hover:bg-primary hover:text-white border border-border-color font-bold text-text-main transition-colors text-center shadow-xs"
            >
              👑 {locale === 'ar' ? 'مدير عام' : 'Admin'}
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('apex@germanspares.com', 'secret123')}
              className="px-2.5 py-1.5 rounded-xl bg-bg-primary hover:bg-primary hover:text-white border border-border-color font-bold text-text-main transition-colors text-center shadow-xs"
            >
              🏬 {locale === 'ar' ? 'تاجر' : 'Merchant'}
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('01033330001', 'secret123')}
              className="px-2.5 py-1.5 rounded-xl bg-bg-primary hover:bg-primary hover:text-white border border-border-color font-bold text-text-main transition-colors text-center shadow-xs"
            >
              🚗 {locale === 'ar' ? 'عميل' : 'Customer'}
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl border border-border-color bg-bg-primary shadow-xl space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login Identifier */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-main">
                {locale === 'ar'
                  ? 'رقم الهاتف المصري أو البريد الإلكتروني'
                  : 'Egyptian Phone (01xxxxxxxxx) or Email'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={locale === 'ar' ? 'مثال: 01000000000 أو admin@otlob.com' : 'e.g. 01000000000 or admin@otlob.com'}
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-secondary/30 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-text-main">
                  {locale === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="text-[11px] text-primary hover:underline font-bold"
                >
                  {locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-secondary/30 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-text-muted">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border-color text-primary focus:ring-primary/20 w-4 h-4"
                />
                <span>{locale === 'ar' ? 'تذكر بيانات الدخول' : 'Remember me'}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-xs shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer separator & Register link */}
          <div className="pt-4 border-t border-border-color text-center space-y-3">
            <p className="text-xs text-text-muted">
              {locale === 'ar' ? 'ليس لديك حساب حتى الآن؟' : "Don't have an account yet?"}{' '}
              <Link
                href={`/${locale}/auth/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                className="font-bold text-primary hover:underline"
              >
                {locale === 'ar' ? 'أنشئ حساباً جديداً الآن' : 'Create an account'}
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{locale === 'ar' ? 'بيانات مشفرة وآمنة 100%' : '100% Encrypted & Secure'}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>{locale === 'ar' ? 'ضمان قطع الغيار الأصلية' : 'Guaranteed Genuine Parts'}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
