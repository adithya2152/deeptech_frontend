// Simple language detection based on script/character patterns
import { isLanguageSupported, INDIAN_LANGUAGES } from "./languages";

interface LanguageScores {
  [key: string]: number;
}

// Character ranges for different languages
const LANGUAGE_PATTERNS = {
  hi: /[\u0900-\u097F]/g, // Devanagari
  ta: /[\u0B80-\u0BFF]/g, // Tamil
  te: /[\u0C00-\u0C7F]/g, // Telugu
  kn: /[\u0C80-\u0CFF]/g, // Kannada
  mr: /[\u0900-\u097F]/g, // Marathi (same as Hindi)
  bn: /[\u0980-\u09FF]/g, // Bengali
  gu: /[\u0A80-\u0AFF]/g, // Gujarati
  pa: /[\u0A00-\u0A7F]/g, // Punjabi/Gurmukhi
  ml: /[\u0D00-\u0D7F]/g, // Malayalam
  ur: /[\u0600-\u06FF]/g, // Urdu/Arabic
  en: /[a-zA-Z0-9]/g, // English
};

/**
 * Detect the language of a given text
 */
export function detectLanguage(text: string): string {
  if (!text || text.trim().length === 0) {
    return "en"; // Default to English
  }

  const scores: LanguageScores = {};
  let totalCharacters = 0;

  // Score each language based on character matches
  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    const matches = text.match(pattern) || [];
    scores[lang] = matches.length;
    if (lang === "en") {
      totalCharacters += matches.length;
    } else {
      totalCharacters += matches.length;
    }
  }

  // Normalize scores
  if (totalCharacters === 0) {
    return "en";
  }

  // Find language with highest score
  let detectedLanguage = "en";
  let maxScore = 0;

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore && isLanguageSupported(lang)) {
      maxScore = score;
      detectedLanguage = lang;
    }
  }

  return detectedLanguage;
}

/**
 * Detect multiple languages in a text
 */
export function detectAllLanguages(text: string): { [key: string]: number } {
  const scores: LanguageScores = {};

  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    const matches = text.match(pattern) || [];
    scores[lang] = matches.length;
  }

  return scores;
}

/**
 * Check confidence of detected language (0-1)
 */
export function getLanguageConfidence(text: string): number {
  const scores = detectAllLanguages(text);
  const values = Object.values(scores);
  const maxScore = Math.max(...values);
  const totalScore = values.reduce((a, b) => a + b, 0);

  if (totalScore === 0) return 0;
  return Math.min(maxScore / totalScore, 1);
}

/**
 * Get top N languages detected in text
 */
export function getTopLanguages(text: string, count: number = 3): string[] {
  const scores = detectAllLanguages(text);
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, score]) => score > 0)
    .slice(0, count)
    .map(([lang]) => lang);
}

/**
 * Suggest language for translation (auto-detect or most likely)
 */
export function suggestSourceLanguage(text: string): string {
  return detectLanguage(text);
}

/**
 * Check if text appears to be in a specific language
 */
export function isLikelyLanguage(text: string, language: string): boolean {
  if (!LANGUAGE_PATTERNS[language as keyof typeof LANGUAGE_PATTERNS]) {
    return false;
  }

  const detected = detectLanguage(text);
  return detected === language;
}
