export const DEFAULT_CURRENCY = 'INR' as const;

export const SUPPORTED_CURRENCIES = [
  'INR',
  'USD',
  'EUR',
  'GBP',
  'AED',
  'SGD',
  'CAD',
  'AUD',
  'NZD',
  'JPY',
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  AU: 'AUD',
  CA: 'CAD',
  SG: 'SGD',
  AE: 'AED',
  NZ: 'NZD',
  JP: 'JPY',
};

const EUR_COUNTRIES = new Set([
  'AT',
  'BE',
  'CY',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PT',
  'SK',
  'SI',
  'ES',
]);

const EUR_COUNTRY_NAMES = new Set([
  'austria',
  'belgium',
  'cyprus',
  'estonia',
  'finland',
  'france',
  'germany',
  'greece',
  'ireland',
  'italy',
  'latvia',
  'lithuania',
  'luxembourg',
  'malta',
  'netherlands',
  'portugal',
  'slovakia',
  'slovenia',
  'spain',
]);

function safeUpper(input?: string | null): string {
  return String(input || '').trim().toUpperCase();
}

export function guessCountryCodeFromLocale(locale?: string | null): string | null {
  const loc = locale ?? (typeof navigator !== 'undefined' ? navigator.language : undefined);
  const raw = String(loc || '').trim();
  if (!raw) return null;

  // Prefer Intl.Locale when available (handles e.g. en-IN, en_IN, etc.)
  try {
    type IntlLocaleConstructor = new (tag: string) => { region?: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LocaleCtor = (Intl as any)?.Locale as undefined | IntlLocaleConstructor;
    if (LocaleCtor) {
      const region = new LocaleCtor(raw).region;
      if (region) return safeUpper(region);
    }
  } catch {
    // fall through
  }

  // Fallback: parse BCP-47-ish locale strings like en-IN or en_US
  const match = raw.match(/[-_](?<region>[A-Za-z]{2})\b/);
  return match?.groups?.region ? safeUpper(match.groups.region) : null;
}

export function guessCurrencyFromLocale(locale?: string | null): CurrencyCode {
  const country = guessCountryCodeFromLocale(locale);
  if (!country) return DEFAULT_CURRENCY;
  if (EUR_COUNTRIES.has(country)) return 'EUR';
  return COUNTRY_TO_CURRENCY[country] || DEFAULT_CURRENCY;
}

export function guessCurrencyFromTimeZone(timeZone?: string | null): CurrencyCode {
  const tz = String(timeZone || '').trim();
  if (!tz) return DEFAULT_CURRENCY;

  // Quick, practical mapping for the timezones we already show in the UI.
  if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'INR';
  if (tz === 'Asia/Singapore') return 'SGD';
  if (tz === 'Asia/Dubai') return 'AED';
  if (tz === 'Asia/Tokyo') return 'JPY';
  if (tz === 'Europe/London') return 'GBP';

  if (tz.startsWith('Europe/')) return 'EUR';
  if (tz.startsWith('America/')) return 'USD';
  if (tz.startsWith('Australia/')) return 'AUD';
  if (tz.startsWith('Pacific/Auckland')) return 'NZD';

  return DEFAULT_CURRENCY;
}

export function guessCurrencyFromCountryName(countryName?: string | null): CurrencyCode {
  const name = String(countryName || '').trim().toLowerCase();
  if (!name) return DEFAULT_CURRENCY;

  if (name === 'india') return 'INR';
  if (name === 'united states' || name === 'united states of america' || name === 'usa') return 'USD';
  if (name === 'united kingdom' || name === 'uk') return 'GBP';
  if (name === 'australia') return 'AUD';
  if (name === 'canada') return 'CAD';
  if (name === 'singapore') return 'SGD';
  if (name === 'united arab emirates' || name === 'uae') return 'AED';
  if (name === 'japan') return 'JPY';
  if (EUR_COUNTRY_NAMES.has(name)) return 'EUR';

  return DEFAULT_CURRENCY;
}

export function guessCurrencyFromProfile(input?: {
  country?: string | null;
  billing_country?: string | null;
  timezone?: string | null;
  locale?: string | null;
}): CurrencyCode {
  // Prefer explicit country fields, then timezone, then browser locale.
  const byBillingCountry = guessCurrencyFromCountryName(input?.billing_country);
  if (input?.billing_country && byBillingCountry) return byBillingCountry;

  const byCountry = guessCurrencyFromCountryName(input?.country);
  if (input?.country && byCountry) return byCountry;

  const byTz = guessCurrencyFromTimeZone(input?.timezone);
  if (input?.timezone && byTz) return byTz;

  return guessCurrencyFromLocale(input?.locale);
}

export function normalizeCurrency(input?: string | null): CurrencyCode {
  const upper = safeUpper(input);
  if ((SUPPORTED_CURRENCIES as readonly string[]).includes(upper)) {
    return upper as CurrencyCode;
  }
  return DEFAULT_CURRENCY;
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency?: string | null,
  opts?: { locale?: string; maximumFractionDigits?: number }
): string {
  const numeric = typeof amount === 'number' ? amount : Number(amount);
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;
  const code = normalizeCurrency(currency);
  const locale = opts?.locale;

  // Use 2 decimal places for small amounts (< 100) to avoid showing $0
  // Use 0 decimals for larger amounts for cleaner display
  const defaultDecimals = Math.abs(safeAmount) < 100 ? 2 : 0;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: opts?.maximumFractionDigits ?? defaultDecimals,
    minimumFractionDigits: Math.abs(safeAmount) < 1 ? 2 : 0,
  }).format(safeAmount);
}


export function currencySymbol(currency?: string | null): string {
  const code = normalizeCurrency(currency);

  const SYMBOL_MAP: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED',
    SGD: 'S$',
    CAD: 'C$',
    AUD: 'A$',
    NZD: 'NZ$',
    JPY: '¥',
  };

  return SYMBOL_MAP[code] || code;
}
