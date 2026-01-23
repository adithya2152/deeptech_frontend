import { formatDistanceToNow as formatDistanceToNowBase, Locale } from 'date-fns';
import { hi, bn, ta, te, kn, de, nl, ar, fr, it, ja, ko, es, pt, ru, zhCN } from 'date-fns/locale';
import i18n from 'i18next';

const localeMap: Record<string, Locale | undefined> = {
  en: undefined, // English is default
  hi: hi,
  bn: bn,
  ta: ta,
  te: te,
  kn: kn,
  ml: undefined, // Malayalam not available in date-fns, fallback to English
  de: de,
  nl: nl,
  ar: ar,
  fr: fr,
  it: it,
  ja: ja,
  ko: ko,
  es: es,
  pt: pt,
  ru: ru,
  'zh-CN': zhCN,
};

export function formatDistanceToNow(
  date: Date | number,
  options?: { addSuffix?: boolean; includeSeconds?: boolean }
): string {
  const currentLanguage = i18n.language;
  const locale = localeMap[currentLanguage];
  
  return formatDistanceToNowBase(date, {
    ...options,
    locale,
  });
}
