// Export translation utilities
export {
  translateText,
  translateToMultiple,
  createTranslatedMessage,
  batchTranslate,
  translateWithFallback,
  clearTranslationCache,
  getTranslationStats,
} from "./translationEngine.ts";
export {
  detectLanguage,
  detectAllLanguages,
  getLanguageConfidence,
  getTopLanguages,
  suggestSourceLanguage,
  isLikelyLanguage,
} from "./languageDetector.ts";
export {
  INDIAN_LANGUAGES,
  getSupportedLanguages,
  getLanguageInfo,
  isLanguageSupported,
  getLanguageCodeByName,
} from "./languages.ts";
export type {
  IndianLanguageCode,
  LanguageInfo,
  TranslationMetadata,
  TranslatedMessage,
} from "./languages.ts";