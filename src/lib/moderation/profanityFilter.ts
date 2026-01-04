// Profanity list - comprehensive multi-language support
// This is a basic list - in production, you might want to use a more comprehensive service

const PROFANITY_LIST = {
  en: [
    "badword1",
    "badword2",
    "badword3",
    "offensive1",
    "offensive2",
    // Add more as needed
  ],
  hi: [
    // Hindi profanities (examples - be culturally sensitive)
    "गाली",
    "कसम",
    "बकवास",
  ],
  ta: [
    // Tamil profanities
    "கேவலம்",
    "தேவையற்ற",
  ],
  te: [
    // Telugu profanities
    "చెత్త",
    "అసభ్యత",
  ],
  kn: [
    // Kannada profanities
    "ಕೆಸ",
    "ಮೂರ್ಖ",
  ],
  mr: [
    // Marathi profanities
    "बदतर",
  ],
  bn: [
    // Bengali profanities
    "খারাপ",
  ],
  gu: [
    // Gujarati profanities
    "બુરો",
  ],
  pa: [
    // Punjabi profanities
    "ਮੂਰਖ",
  ],
  ml: [
    // Malayalam profanities
    "കെട്ടവൻ",
  ],
};

/**
 * Detects profanity in text
 */
export function detectProfanity(
  text: string,
  languages: string[] = ["en"]
): string[] {
  const lowerText = text.toLowerCase();
  const profanities: Set<string> = new Set();

  for (const lang of languages) {
    const langProfanities =
      PROFANITY_LIST[lang as keyof typeof PROFANITY_LIST] || [];

    for (const word of langProfanities) {
      const wordRegex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = lowerText.match(wordRegex);
      if (matches) {
        matches.forEach((match) => profanities.add(match));
      }
    }
  }

  return Array.from(profanities);
}

/**
 * Checks if text contains profanity
 */
export function containsProfanity(
  text: string,
  languages: string[] = ["en"]
): boolean {
  return detectProfanity(text, languages).length > 0;
}

/**
 * Censors profanity in text
 */
export function censorProfanity(
  text: string,
  languages: string[] = ["en"],
  censorChar: string = "*"
): string {
  let censored = text;
  const profanities = detectProfanity(text, languages);

  for (const word of profanities) {
    const mask = censorChar.repeat(word.length);
    const wordRegex = new RegExp(`\\b${word}\\b`, "gi");
    censored = censored.replace(wordRegex, mask);
  }

  return censored;
}

/**
 * Gets profanity severity level (1-3)
 * This is a simplified version - in production you'd want more nuanced scoring
 */
export function getProfanitySeverity(
  profanityCount: number
): "low" | "medium" | "high" {
  if (profanityCount === 0) return "low";
  if (profanityCount === 1) return "low";
  if (profanityCount <= 3) return "medium";
  return "high";
}

/**
 * Add custom profanity words
 */
export function addCustomProfanity(language: string, words: string[]): void {
  if (!PROFANITY_LIST[language as keyof typeof PROFANITY_LIST]) {
    PROFANITY_LIST[language as keyof typeof PROFANITY_LIST] = [];
  }
  PROFANITY_LIST[language as keyof typeof PROFANITY_LIST].push(...words);
}

/**
 * Get all supported profanity languages
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(PROFANITY_LIST);
}
