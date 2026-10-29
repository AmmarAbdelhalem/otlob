'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import {
  Car,
  Store,
  Truck,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Building2,
} from 'lucide-react';
import { Locale } from '@/lib/api/types';

type AccountRole = 'customer' | 'merchant' | 'courier';

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawLocale = (params?.locale as string) || 'ar';
  const locale: Locale = rawLocale === 'en' ? 'en' : 'ar';
  const redirectUrl = searchParams.get('redirect');

  // Form State
  const [role, setRole] = useState<AccountRole>('customer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Role specific state
  const [storeName, setStoreName] = useState('');
  const [commercialRegister, setCommercialRegister] = useState('');
  const [addressText, setAddressText] = useState('');
  const [vehicleType, setVehicleType] = useState('motorcycle');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValidEgyptianPhone = (num: string) => {
    const clean = num.trim().replace(/[\s-]/g, '');
    return /^01[0125][0-9]{8}$/.test(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validations
    if (!name.trim()) {
      setErrorMsg(locale === 'ar' ? 'يرجى إدخال الاسم بالكامل' : 'Please enter your full name');
      return;
    }

    if (!isValidEgyptianPhone(phone)) {
      setErrorMsg(
        locale === 'ar'
          ? 'رقم الهاتف يجب أن يكون رقم مصري صحيح مكون من 11 رقم (مثال: 01012345678)'
          : 'Phone number must be a valid 11-digit Egyptian mobile number (e.g., 01012345678)'
      );
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(
        locale === 'ar'
          ? 'يرجى إدخال بريد إلكتروني صحيح'
          : 'Please enter a valid email address'
      );
      return;
    }

    if (password.length < 8) {
      setErrorMsg(
        locale === 'ar'
          ? 'كلمة المرور يجب أن لا تقل عن 8 أحرف أو أرقام'
          : 'Password must be at least 8 characters'
      );
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMsg(
        locale === 'ar'
          ? 'كلمتا المرور غير متطابقتين'
          : 'Passwords do not match'
      );
      return;
    }

    if (role === 'merchant') {
      if (!storeName.trim()) {
        setErrorMsg(
          locale === 'ar'
            ? 'يرجى إدخال اسم المتجر أو المحل'
            : 'Please enter your store or workshop name'
        );
        return;
      }

      if (!commercialRegister.trim() || commercialRegister.trim().length < 5) {
        setErrorMsg(
          locale === 'ar'
            ? 'يرجى إدخال رقم السجل التجاري الرسمي بشكل صحيح (5 أرقام على الأقل)'
            : 'Please enter a valid official Commercial Register number (min 5 digits)'
        );
        return;
      }
    }

    setLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        phone: phone.trim().replace(/[\s-]/g, ''),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        role,
      };

      if (role === 'merchant') {
        payload.store_name = storeName.trim();
        payload.commercial_registration_number = commercialRegister.trim();
        payload.address_text = addressText.trim() || (locale === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt');
        payload.latitude = 30.0444;
        payload.longitude = 31.2357;
      } else if (role === 'courier') {
        payload.vehicle_type = vehicleType;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Locale': locale,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(
          data.message ||
            (locale === 'ar'
              ? 'حدث خطأ أثناء التسجيل، قد يكون رقم الهاتف أو السجل التجاري مسجلاً بالفعل'
              : 'Registration error. Phone or Commercial Register may already be registered.')
        );
        setLoading(false);
        return;
      }

      // Successful registration: role-based navigation
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (role === 'merchant') {
        router.push(`/${locale}/vendor/dashboard?welcome=1`);
      } else if (role === 'courier') {
        router.push(`/${locale}/courier/dashboard?welcome=1`);
      } else {
        router.push(`/${locale}/account?welcome=1`);
      }
      router.refresh();
    } catch {
      setErrorMsg(
        locale === 'ar'
          ? 'تعذر الاتصال بالخادم، يرجى المحاولة بعد قليل'
          : 'Network error. Please try again later.'
      );
      setLoading(false);
    }
  };

  const isRtl = locale === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-[90vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-bg-secondary/40">
      <div className="max-w-xl w-full space-y-8">
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
            {locale === 'ar' ? 'إنشاء حساب جديد' : 'Create an account'}
          </h1>
          <p className="text-xs text-text-muted">
            {locale === 'ar'
              ? 'اختر نوع الحساب للانضمام إلى أكبر منصة متخصصة لقطع الغيار في مصر'
              : 'Select your account type to join Egypt’s top auto parts marketplace'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              role === 'customer'
                ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold shadow-xs'
                : 'border-border-color bg-bg-primary text-text-muted hover:border-primary/40'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">{locale === 'ar' ? 'مشتري / عميل' : 'Customer'}</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('merchant')}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              role === 'merchant'
                ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold shadow-xs'
                : 'border-border-color bg-bg-primary text-text-muted hover:border-primary/40'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-xs">{locale === 'ar' ? 'تاجر قطع غيار' : 'Merchant Store'}</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('courier')}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              role === 'courier'
                ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold shadow-xs'
                : 'border-border-color bg-bg-primary text-text-muted hover:border-primary/40'
            }`}
          >
            <Truck className="w-5 h-5" />
            <span className="text-xs">{locale === 'ar' ? 'مندوب شحن' : 'Courier Fleet'}</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-3xl border border-border-color bg-bg-primary shadow-xl space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common: Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-main">
                {locale === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                placeholder={locale === 'ar' ? 'مثال: أحمد محمود' : 'e.g. Ahmed Mahmoud'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-secondary/30 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Merchant-Specific: Store Name & Address */}
            {role === 'merchant' && (
              <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-color space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Building2 className="w-4 h-4" />
                  <span>{locale === 'ar' ? 'بيانات متجر قطع الغيار' : 'Store Details'}</span>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-main">
                    {locale === 'ar' ? 'اسم المتجر أو المؤسسة *' : 'Store or Business Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={locale === 'ar' ? 'مثال: النور لقطع غيار تويوتا وهوندا' : 'e.g. Al-Nour Auto Parts'}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-color bg-bg-primary text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-main">
                    {locale === 'ar' ? 'رقم السجل التجاري الرسمي (السجل التجاري) *' : 'Commercial Register Number (CR) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={locale === 'ar' ? 'مثال: 104928' : 'e.g. 104928'}
                    value={commercialRegister}
                    onChange={(e) => setCommercialRegister(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-color bg-bg-primary text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary font-mono"
                  />
                  <span className="text-[10px] text-text-muted block">
                    {locale === 'ar'
                      ? 'مطلوب لاعتماد المتجر والتحقق من الهوية التجارية الرسمية'
                      : 'Mandatory for store approval and commercial verification'}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-text-main">
                    {locale === 'ar' ? 'العنوان / المدينة والمنطقة' : 'Address / City & District'}
                  </label>
                  <input
                    type="text"
                    placeholder={locale === 'ar' ? 'مثال: شارع دمشق، مصر الجديدة، القاهرة' : 'e.g. Damascus St, Heliopolis, Cairo'}
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-color bg-bg-primary text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* Courier-Specific: Vehicle Type */}
            {role === 'courier' && (
              <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-color space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Truck className="w-4 h-4" />
                  <span>{locale === 'ar' ? 'مركبة التوصيل' : 'Delivery Vehicle'}</span>
                </div>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-color bg-bg-primary text-xs text-text-main focus:outline-none focus:border-primary"
                >
                  <option value="motorcycle">{locale === 'ar' ? 'دراجة نارية (موتوسيكل) - سريع للقطع الصغيرة' : 'Motorcycle (Fast for small spares)'}</option>
                  <option value="car">{locale === 'ar' ? 'سيارة ملاكي - للطرود المتوسطة' : 'Passenger Car'}</option>
                  <option value="van">{locale === 'ar' ? 'فان / ربع نقل - للقطع الثقيلة والمحركات' : 'Van / Pickup (Heavy spares)'}</option>
                </select>
              </div>
            )}

            {/* Common: Phone & Email in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-main">
                  {locale === 'ar' ? 'رقم الهاتف المحمول (11 رقم)' : 'Mobile Phone (01xxxxxxxxx)'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-secondary/30 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-main">
                  {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-secondary/30 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary font-sans"
                />
              </div>
            </div>

            {/* Passwords in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-main">
                  {locale === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="8+ أحرف"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-secondary/30 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary font-mono"
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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-text-main">
                  {locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="8+ أحرف"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-secondary/30 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-xs shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{locale === 'ar' ? 'تأكيد وإنشاء الحساب' : 'Create My Account'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer separator & Login link */}
          <div className="pt-4 border-t border-border-color text-center">
            <p className="text-xs text-text-muted">
              {locale === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <Link
                href={`/${locale}/auth/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                className="font-bold text-primary hover:underline"
              >
                {locale === 'ar' ? 'تسجيل الدخول هنا' : 'Sign in here'}
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{locale === 'ar' ? 'بيانات مشفرة ومحمية' : 'Encrypted & Secure'}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>{locale === 'ar' ? 'عضوية معتمدة' : 'Verified Membership'}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
