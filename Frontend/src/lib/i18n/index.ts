import arMessages from './messages/ar.json';
import enMessages from './messages/en.json';
import { Locale, LocalizedString } from '../api/types';

export const messages = {
  ar: arMessages,
  en: enMessages,
};

export type MessageKey =
  | 'common'
  | 'nav'
  | 'topBar'
  | 'vehicleFinder'
  | 'cart'
  | 'tracking';

export function getMessages(locale: Locale) {
  return messages[locale] || messages.ar;
}

export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Format monetary amounts in Egyptian Pounds (EGP).
 */
export function formatMoney(
  amount: number | string,
  locale: Locale = 'ar',
  currency: string = 'EGP'
): string {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return '0.00 ' + (locale === 'ar' ? 'ج.م' : 'EGP');

  try {
    const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency: currency || 'EGP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(numeric);
  } catch {
    return `${numeric.toFixed(2)} ${locale === 'ar' ? 'ج.م' : 'EGP'}`;
  }
}

/**
 * Resolve a localized text field that can be either a string or an object with ar/en keys.
 */
export function resolveLocalized(
  value: string | LocalizedString | null | undefined,
  locale: Locale = 'ar'
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[locale] || value.ar || value.en || '';
}

/**
 * Format dates with localized locale.
 */
export function formatDate(dateString: string, locale: Locale = 'ar'): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}
