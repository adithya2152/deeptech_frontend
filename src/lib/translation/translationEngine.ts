import { TranslatedMessage, TranslationMetadata } from "./languages";
import { detectLanguage } from "./languageDetector";
import { translationCache } from "./cache";

/**
 * Translates text using Google Translate API (frontend)
 */
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  // Same language - no translation needed
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  // Check cache first
  const cached = translationCache.get(text, sourceLanguage, targetLanguage);
  if (cached) {
    return cached;
  }

  try {
    // Use Google Translate API via free service
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract translated text from Google Translate response
    let translatedText = text;
    if (
      Array.isArray(data) &&
      data[0] &&
      Array.isArray(data[0]) &&
      data[0][0]
    ) {
      translatedText = data[0]
        .map((item: any) => (Array.isArray(item) ? item[0] : item))
        .join("");
    }

    // Cache the result
    translationCache.set(text, sourceLanguage, targetLanguage, translatedText);

    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    // Return original text on error
    return text;
  }
}

/**
 * Translates text to multiple target languages
 */
export async function translateToMultiple(
  text: string,
  sourceLanguage: string,
  targetLanguages: string[]
): Promise<{ [key: string]: string }> {
  const results: { [key: string]: string } = {};

  // Filter out source language and duplicates
  const uniqueTargets = Array.from(
    new Set(targetLanguages.filter((lang) => lang !== sourceLanguage))
  );

  // Use Promise.all for parallel translations
  const promises = uniqueTargets.map(async (targetLang) => {
    const translated = await translateText(text, sourceLanguage, targetLang);
    return [targetLang, translated] as const;
  });

  const translations = await Promise.all(promises);
  translations.forEach(([lang, text]) => {
    results[lang] = text;
  });

  return results;
}

/**
 * Create translated message object
 */
export async function createTranslatedMessage(
  original: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslatedMessage> {
  const detectedSource = sourceLanguage || detectLanguage(original);
  const translated = await translateText(
    original,
    detectedSource,
    targetLanguage
  );

  const metadata: TranslationMetadata = {
    sourceLanguage: detectedSource,
    targetLanguage,
    translatedAt: new Date().toISOString(),
    confidence: 0.95, // Default confidence
  };

  return {
    original,
    translated,
    sourceLanguage: detectedSource,
    targetLanguage,
    metadata,
  };
}

/**
 * Batch translate multiple messages
 */
export async function batchTranslate(
  messages: string[],
  sourceLanguage: string,
  targetLanguage: string
): Promise<string[]> {
  const results = await Promise.all(
    messages.map((msg) => translateText(msg, sourceLanguage, targetLanguage))
  );
  return results;
}

/**
 * Translate with fallback support
 */
export async function translateWithFallback(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  // Same language check
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  try {
    // Use dictionary translation (frontend only)
    return await translateText(text, sourceLanguage, targetLanguage);
  } catch (error) {
    console.error("Translation failed:", error);
  }

  // Return original if no translation available
  return text;
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get translation cache stats
 */
export function getTranslationStats() {
  return translationCache.getStats();
}