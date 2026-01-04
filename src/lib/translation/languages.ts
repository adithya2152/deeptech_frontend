// Indian Languages with their codes and display names
export const INDIAN_LANGUAGES = {
  en: { code: "en", name: "English", nativeName: "English", flag: "🇮🇳" },
  hi: { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  ta: { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  te: { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  kn: { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  mr: { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  bn: { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  gu: { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  pa: { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  ml: { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
};

export type IndianLanguageCode = keyof typeof INDIAN_LANGUAGES;

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface TranslationCache {
  [key: string]: {
    result: string;
    timestamp: number;
  };
}

export interface TranslationMetadata {
  sourceLanguage: string;
  targetLanguage: string;
  translatedAt: string;
  confidence?: number;
}

export interface TranslatedMessage {
  original: string;
  translated: string;
  sourceLanguage: string;
  targetLanguage: string;
  metadata: TranslationMetadata;
}

/**
 * Get all supported Indian languages
 */
export function getSupportedLanguages(): LanguageInfo[] {
  return Object.values(INDIAN_LANGUAGES);
}

/**
 * Get language info by code
 */
export function getLanguageInfo(code: string): LanguageInfo | null {
  return INDIAN_LANGUAGES[code as IndianLanguageCode] || null;
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(code: string): boolean {
  return code in INDIAN_LANGUAGES;
}

/**
 * Get language code from name
 */
export function getLanguageCodeByName(name: string): string | null {
  const language = Object.values(INDIAN_LANGUAGES).find(
    (lang) => lang.name.toLowerCase() === name.toLowerCase()
  );
  return language?.code || null;
}