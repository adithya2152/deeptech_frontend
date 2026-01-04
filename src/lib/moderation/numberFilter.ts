import { NumberMatch } from "./types";

// Patterns for detecting numbers and contact information
const PATTERNS = {
  // Indian phone numbers: 10 digits, various formats
  indianPhone: /(\+?91[-.\s]?)?[6-9]\d{9}/g,
  internationalPhone:
    /\+?[1-9]\d{0,3}[-.\s]?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/g,

  // Credit card numbers: 13-19 digits
  creditCard: /\b(?:\d[ -]*?){13,19}\b/g,

  // SSN (Social Security Number): XXX-XX-XXXX
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,

  // Bank account numbers: various lengths (6-17 digits)
  bankAccount: /\b\d{6,17}\b/g,
};

/**
 * Detects phone numbers (Indian, international) in text
 */
export function detectPhoneNumbers(text: string): string[] {
  const indianPhones = text.match(PATTERNS.indianPhone) || [];
  const internationalPhones = text.match(PATTERNS.internationalPhone) || [];

  // Combine and deduplicate
  return Array.from(new Set([...indianPhones, ...internationalPhones]));
}

/**
 * Detects credit card patterns in text
 */
export function detectCreditCards(text: string): string[] {
  const matches = text.match(PATTERNS.creditCard) || [];
  // Filter to only likely credit card patterns (13-19 consecutive digits)
  return matches.filter(
    (match) => /\d/.test(match) && match.replace(/\D/g, "").length >= 13
  );
}

/**
 * Detects SSN patterns
 */
export function detectSSN(text: string): string[] {
  return text.match(PATTERNS.ssn) || [];
}

/**
 * Detects bank account patterns
 */
export function detectBankAccounts(text: string): string[] {
  return text.match(PATTERNS.bankAccount) || [];
}

/**
 * Main function to detect all number-related violations
 */
export function detectNumberViolations(text: string): NumberMatch[] {
  const violations: NumberMatch[] = [];

  const phoneNumbers = detectPhoneNumbers(text);
  phoneNumbers.forEach((match) => {
    violations.push({ pattern: match, type: "phone" });
  });

  const creditCards = detectCreditCards(text);
  creditCards.forEach((match) => {
    violations.push({ pattern: match, type: "creditCard" });
  });

  const ssns = detectSSN(text);
  ssns.forEach((match) => {
    violations.push({ pattern: match, type: "ssn" });
  });

  const bankAccounts = detectBankAccounts(text);
  bankAccounts.forEach((match) => {
    violations.push({ pattern: match, type: "bankAccount" });
  });

  return violations;
}

/**
 * Censors detected number patterns
 */
export function censorNumbers(text: string): string {
  let censored = text;

  // Censor phone numbers
  censored = censored.replace(PATTERNS.indianPhone, "[REDACTED_PHONE]");
  censored = censored.replace(PATTERNS.internationalPhone, "[REDACTED_PHONE]");

  // Censor credit cards
  censored = censored.replace(PATTERNS.creditCard, "[REDACTED_CC]");

  // Censor SSN
  censored = censored.replace(PATTERNS.ssn, "[REDACTED_SSN]");

  // Censor bank accounts
  censored = censored.replace(PATTERNS.bankAccount, "[REDACTED_ACCOUNT]");

  return censored;
}