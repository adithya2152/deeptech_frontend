import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  translateText,
  translateToMultiple,
  createTranslatedMessage,
  clearTranslationCache,
  getTranslationStats,
} from "@/lib/translation/translationEngine";
import {
  detectLanguage,
  getLanguageConfidence,
  getTopLanguages,
} from "@/lib/translation/languageDetector";
import {
  getSupportedLanguages,
  INDIAN_LANGUAGES,
  TranslatedMessage,
  IndianLanguageCode,
} from "@/lib/translation/languages";

/**
 * Hook for message translation
 */
export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Translate text to target language
   */
  const translate = useCallback(
    async (
      text: string,
      targetLanguage: string,
      sourceLanguage?: string
    ): Promise<string> => {
      try {
        setIsTranslating(true);
        setError(null);

        const source = sourceLanguage || detectLanguage(text);
        const result = await translateText(text, source, targetLanguage);

        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Translation failed";
        setError(message);
        return text; // Return original on error
      } finally {
        setIsTranslating(false);
      }
    },
    []
  );

  /**
   * Translate to multiple languages
   */
  const translateToMany = useCallback(
    async (
      text: string,
      targetLanguages: string[],
      sourceLanguage?: string
    ): Promise<{ [key: string]: string }> => {
      try {
        setIsTranslating(true);
        setError(null);

        const source = sourceLanguage || detectLanguage(text);
        const results = await translateToMultiple(
          text,
          source,
          targetLanguages
        );

        return results;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Translation failed";
        setError(message);
        return {};
      } finally {
        setIsTranslating(false);
      }
    },
    []
  );

  /**
   * Create translated message object
   */
  const createMessage = useCallback(
    async (
      text: string,
      targetLanguage: string,
      sourceLanguage?: string
    ): Promise<TranslatedMessage | null> => {
      try {
        setIsTranslating(true);
        setError(null);

        const message = await createTranslatedMessage(
          text,
          targetLanguage,
          sourceLanguage
        );

        return message;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Message creation failed";
        setError(message);
        return null;
      } finally {
        setIsTranslating(false);
      }
    },
    []
  );

  return {
    translate,
    translateToMany,
    createMessage,
    isTranslating,
    error,
    setError,
  };
}

/**
 * Hook for language detection
 */
export function useLanguageDetection() {
  const [detectedLanguage, setDetectedLanguage] = useState<string>("en");
  const [confidence, setConfidence] = useState<number>(0);
  const [topLanguages, setTopLanguages] = useState<string[]>([]);

  /**
   * Detect language from text
   */
  const detect = useCallback((text: string) => {
    if (!text || text.trim().length === 0) {
      setDetectedLanguage("en");
      setConfidence(0);
      setTopLanguages([]);
      return "en";
    }

    const detected = detectLanguage(text);
    const conf = getLanguageConfidence(text);
    const top = getTopLanguages(text, 3);

    setDetectedLanguage(detected);
    setConfidence(conf);
    setTopLanguages(top);

    return detected;
  }, []);

  return {
    detectedLanguage,
    confidence,
    topLanguages,
    detect,
  };
}

/**
 * Hook for language selection
 */
export function useLanguageSelection() {
  const [sourceLanguage, setSourceLanguage] = useState<string>("en");
  const [targetLanguage, setTargetLanguage] = useState<string>("hi");
  const [autoDetectSource, setAutoDetectSource] = useState(true);

  /**
   * Set source language
   */
  const selectSourceLanguage = useCallback((lang: string) => {
    setSourceLanguage(lang);
    setAutoDetectSource(false);
  }, []);

  /**
   * Set target language
   */
  const selectTargetLanguage = useCallback((lang: string) => {
    setTargetLanguage(lang);
  }, []);

  /**
   * Toggle auto-detect
   */
  const toggleAutoDetect = useCallback(() => {
    setAutoDetectSource((prev) => !prev);
  }, []);

  return {
    sourceLanguage,
    targetLanguage,
    autoDetectSource,
    selectSourceLanguage,
    selectTargetLanguage,
    toggleAutoDetect,
  };
}

/**
 * Hook for translation settings
 */
export function useTranslationSettings() {
  const [showOriginal, setShowOriginal] = useState(true);
  const [showTranslated, setShowTranslated] = useState(true);
  const [cacheEnabled, setCacheEnabled] = useState(true);

  /**
   * Toggle original message visibility
   */
  const toggleOriginal = useCallback(() => {
    setShowOriginal((prev) => !prev);
  }, []);

  /**
   * Toggle translated message visibility
   */
  const toggleTranslated = useCallback(() => {
    setShowTranslated((prev) => !prev);
  }, []);

  /**
   * Toggle cache
   */
  const toggleCache = useCallback(() => {
    setCacheEnabled((prev) => !prev);
    if (cacheEnabled) {
      clearTranslationCache();
    }
  }, [cacheEnabled]);

  /**
   * Get cache stats
   */
  const getCacheStats = useCallback(() => {
    return getTranslationStats();
  }, []);

  return {
    showOriginal,
    showTranslated,
    cacheEnabled,
    toggleOriginal,
    toggleTranslated,
    toggleCache,
    getCacheStats,
  };
}

/**
 * Hook to get all supported languages
 */
export function useSupportedLanguages() {
  return useQuery({
    queryKey: ["supportedLanguages"],
    queryFn: () => getSupportedLanguages(),
    staleTime: Infinity, // Language list doesn't change
  });
}

/**
 * Combine all translation features
 */
export function useTranslationFeatures() {
  const translation = useTranslation();
  const detection = useLanguageDetection();
  const selection = useLanguageSelection();
  const settings = useTranslationSettings();
  const { data: languages = [] } = useSupportedLanguages();

  return {
    ...translation,
    ...detection,
    ...selection,
    ...settings,
    languages,
    getLanguageInfo: (code: string) => {
      return INDIAN_LANGUAGES[code as IndianLanguageCode] || null;
    },
  };
}
