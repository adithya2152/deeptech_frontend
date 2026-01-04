export type ViolationType = "number" | "contact" | "link" | "profanity";
export type ViolationSeverity = "warning" | "block";

export interface Violation {
  type: ViolationType;
  matches: string[];
  severity: ViolationSeverity;
  description: string;
}

export interface ModerationResult {
  isAllowed: boolean;
  violations: Violation[];
  cleanContent: string;
  flaggedIndices: number[];
}

export interface ModerationConfig {
  blockNumbers: boolean;
  blockEmails: boolean;
  blockLinks: boolean;
  blockSocialMedia: boolean;
  blockPhysicalAddresses: boolean;
  enableProfanityFilter: boolean;
  censorProfanity: boolean;
  profanityLanguages: string[];
  moderationLevel: "strict" | "moderate" | "lenient";
}

export interface NumberMatch {
  pattern: string;
  type: "phone" | "creditCard" | "ssn" | "bankAccount";
}

export interface ContactMatch {
  pattern: string;
  type: "email" | "socialMedia" | "physicalAddress";
}

export interface LinkMatch {
  pattern: string;
  type: "url" | "domain" | "shortenedUrl";
}
