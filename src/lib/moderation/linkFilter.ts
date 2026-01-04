import { LinkMatch } from "./types";

const PATTERNS = {
  // Full URLs (http, https, ftp)
  url: /(?:https?|ftp):\/\/[^\s]+/gi,

  // Domain names without protocol
  domain:
    /(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}/g,

  // Common shortened URLs (bit.ly, tinyurl, etc)
  shortenedUrl:
    /(?:bit\.ly|tinyurl|short\.link|ow\.ly|goo\.gl|t\.co|youtu\.be|rebrand\.ly|href\.li|snip\.li|buff\.ly|adf\.ly|clck\.ru)[\/\w]+/gi,

  // IP addresses
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,

  // File paths or downloads
  filePath: /(?:https?|ftp):\/\/[^\s]*\.\w+(?:\s|$)/gi,
};

/**
 * Detects full URLs with protocols
 */
export function detectUrls(text: string): string[] {
  return text.match(PATTERNS.url) || [];
}

/**
 * Detects domain names
 */
export function detectDomains(text: string): string[] {
  // Filter out false positives
  const matches = text.match(PATTERNS.domain) || [];
  return matches.filter((domain) => {
    // Exclude common false positives like "a.b" or single letters
    return (
      domain.includes(".") && domain.split(".").every((part) => part.length > 1)
    );
  });
}

/**
 * Detects shortened URLs
 */
export function detectShortenedUrls(text: string): string[] {
  return text.match(PATTERNS.shortenedUrl) || [];
}

/**
 * Detects IP addresses
 */
export function detectIpAddresses(text: string): string[] {
  return text.match(PATTERNS.ipAddress) || [];
}

/**
 * Detects file downloads/paths
 */
export function detectFilePaths(text: string): string[] {
  return text.match(PATTERNS.filePath) || [];
}

/**
 * Checks if text contains suspicious link patterns
 */
export function containsSuspiciousLinks(text: string): boolean {
  return (
    detectUrls(text).length > 0 ||
    detectShortenedUrls(text).length > 0 ||
    detectDomains(text).length > 0 ||
    detectFilePaths(text).length > 0
  );
}

/**
 * Main function to detect all link-related violations
 */
export function detectLinkViolations(text: string): LinkMatch[] {
  const violations: LinkMatch[] = [];

  const urls = detectUrls(text);
  urls.forEach((match) => {
    violations.push({ pattern: match, type: "url" });
  });

  const shortened = detectShortenedUrls(text);
  shortened.forEach((match) => {
    violations.push({ pattern: match, type: "shortenedUrl" });
  });

  const domains = detectDomains(text);
  domains.forEach((match) => {
    violations.push({ pattern: match, type: "domain" });
  });

  const filePaths = detectFilePaths(text);
  filePaths.forEach((match) => {
    violations.push({ pattern: match, type: "url" });
  });

  return violations;
}

/**
 * Censors detected links
 */
export function censorLinks(text: string): string {
  let censored = text;

  // Censor full URLs
  censored = censored.replace(PATTERNS.url, "[REDACTED_LINK]");

  // Censor shortened URLs
  censored = censored.replace(PATTERNS.shortenedUrl, "[REDACTED_SHORT_LINK]");

  // Censor file paths
  censored = censored.replace(PATTERNS.filePath, "[REDACTED_FILE]");

  // Censor domains (but be careful not to censor legitimate domain mentions)
  // Only if they look like they're being shared as links
  if (containsSuspiciousLinks(text)) {
    censored = censored.replace(PATTERNS.domain, "[REDACTED_DOMAIN]");
  }

  return censored;
}
