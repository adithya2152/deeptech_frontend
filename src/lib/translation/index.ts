// Export translation utilities
export {
  translateText,
  translateToMultiple,
  createTranslatedMessage,
  batchTranslate,
  translateWithFallback,
  clearTranslationCache,
  getTranslationStats,
} from "./translationEngine";
export {
  detectLanguage,
  detectAllLanguages,
  getLanguageConfidence,
  getTopLanguages,
  suggestSourceLanguage,
  isLikelyLanguage,
} from "./languageDetector";
export {
  INDIAN_LANGUAGES,
  getSupportedLanguages,
  getLanguageInfo,
  isLanguageSupported,
  getLanguageCodeByName,
} from "./languages";
export type {
  IndianLanguageCode,
  LanguageInfo,
  TranslationMetadata,
  TranslatedMessage,
} from "./languages";
