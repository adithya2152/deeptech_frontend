import { ContactMatch } from "./types";

const PATTERNS = {
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Social media handles: @username, #hashtags
  socialMedia: /(?:^|\s)[@#][A-Za-z0-9_]+/g,

  // URLs in social media
  insta: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[A-Za-z0-9_.]+/gi,
  facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[A-Za-z0-9_.]+/gi,
  twitter: /(?:https?:\/\/)?(?:www\.)?twitter\.com\/[A-Za-z0-9_]+/gi,
  linkedin:
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/[A-Za-z0-9-]+/gi,
  tiktok: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[A-Za-z0-9_.]+/gi,

  // Telegram, WhatsApp
  telegram: /(?:https?:\/\/)?(?:t\.me|telegram\.org)\/[A-Za-z0-9_]+/gi,
  whatsapp: /(?:\+?\d{1,3}[-.\s]?)?[6-9]\d{9}/g, // Same as phone

  // Physical address patterns (street, city, zip, country)
  // Simple pattern: numbers followed by street type
  physicalAddress:
    /\b\d{1,5}\s+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|circle|cir|park|way|way|terrace|terr|mount|mnt)\b/gi,
  zipCode: /\b\d{5}(?:-\d{4})?\b/g, // US zip codes + Indian pincodes
  coordinatePattern: /[-+]?[0-9]*\.?[0-9]+[-+]?[0-9]*\.?[0-9]+/g, // GPS coordinates
};

/**
 * Detects email addresses
 */
export function detectEmails(text: string): string[] {
  return text.match(PATTERNS.email) || [];
}

/**
 * Detects social media handles and hashtags
 */
export function detectSocialMediaHandles(text: string): string[] {
  return (text.match(PATTERNS.socialMedia) || []).map((m) => m.trim());
}

/**
 * Detects social media profile URLs
 */
export function detectSocialMediaProfiles(text: string): string[] {
  const profiles = [
    ...((text.match(PATTERNS.insta) || []) as string[]),
    ...((text.match(PATTERNS.facebook) || []) as string[]),
    ...((text.match(PATTERNS.twitter) || []) as string[]),
    ...((text.match(PATTERNS.linkedin) || []) as string[]),
    ...((text.match(PATTERNS.tiktok) || []) as string[]),
    ...((text.match(PATTERNS.telegram) || []) as string[]),
  ];
  return Array.from(new Set(profiles));
}

/**
 * Detects physical addresses
 */
export function detectPhysicalAddresses(text: string): string[] {
  return text.match(PATTERNS.physicalAddress) || [];
}

/**
 * Detects zip codes and pin codes
 */
export function detectZipCodes(text: string): string[] {
  return text.match(PATTERNS.zipCode) || [];
}

/**
 * Detects GPS coordinates
 */
export function detectCoordinates(text: string): string[] {
  // More strict pattern for coordinates
  const strictPattern = /[-+]?\d{1,3}\.\d{4,},\s*[-+]?\d{1,3}\.\d{4,}/g;
  return text.match(strictPattern) || [];
}

/**
 * Main function to detect all contact-related violations
 */
export function detectContactViolations(text: string): ContactMatch[] {
  const violations: ContactMatch[] = [];

  const emails = detectEmails(text);
  emails.forEach((match) => {
    violations.push({ pattern: match, type: "email" });
  });

  const handles = detectSocialMediaHandles(text);
  handles.forEach((match) => {
    violations.push({ pattern: match, type: "socialMedia" });
  });

  const profiles = detectSocialMediaProfiles(text);
  profiles.forEach((match) => {
    violations.push({ pattern: match, type: "socialMedia" });
  });

  const addresses = detectPhysicalAddresses(text);
  addresses.forEach((match) => {
    violations.push({ pattern: match, type: "physicalAddress" });
  });

  const zips = detectZipCodes(text);
  zips.forEach((match) => {
    violations.push({ pattern: match, type: "physicalAddress" });
  });

  const coords = detectCoordinates(text);
  coords.forEach((match) => {
    violations.push({ pattern: match, type: "physicalAddress" });
  });

  return violations;
}

/**
 * Censors detected contact information
 */
export function censorContacts(text: string): string {
  let censored = text;

  // Censor emails
  censored = censored.replace(PATTERNS.email, "[REDACTED_EMAIL]");

  // Censor social media
  censored = censored.replace(PATTERNS.insta, "[REDACTED_INSTA]");
  censored = censored.replace(PATTERNS.facebook, "[REDACTED_FB]");
  censored = censored.replace(PATTERNS.twitter, "[REDACTED_X]");
  censored = censored.replace(PATTERNS.linkedin, "[REDACTED_LINKEDIN]");
  censored = censored.replace(PATTERNS.tiktok, "[REDACTED_TIKTOK]");
  censored = censored.replace(PATTERNS.telegram, "[REDACTED_TELEGRAM]");

  // Censor handles
  censored = censored.replace(PATTERNS.socialMedia, " [REDACTED_HANDLE]");

  // Censor addresses
  censored = censored.replace(PATTERNS.physicalAddress, "[REDACTED_ADDRESS]");
  censored = censored.replace(PATTERNS.zipCode, "[REDACTED_ZIP]");
  censored = censored.replace(PATTERNS.coordinatePattern, "[REDACTED_COORDS]");

  return censored;
}
