import { ModerationResult, ModerationConfig, Violation } from "./types";
import { detectNumberViolations, censorNumbers } from "./numberFilter";
import { detectContactViolations, censorContacts } from "./contactFilter";
import { detectLinkViolations, censorLinks } from "./linkFilter";
import {
  detectProfanity,
  censorProfanity,
  getProfanitySeverity,
} from "./profanityFilter";

/**
 * Default moderation configuration
 */
export const DEFAULT_MODERATION_CONFIG: ModerationConfig = {
  blockNumbers: true,
  blockEmails: true,
  blockLinks: true,
  blockSocialMedia: true,
  blockPhysicalAddresses: true,
  enableProfanityFilter: true,
  censorProfanity: true,
  profanityLanguages: ["en", "hi"],
  moderationLevel: "moderate",
};

/**
 * Presets for different moderation levels
 */
export const MODERATION_PRESETS = {
  strict: {
    blockNumbers: true,
    blockEmails: true,
    blockLinks: true,
    blockSocialMedia: true,
    blockPhysicalAddresses: true,
    enableProfanityFilter: true,
    censorProfanity: true,
    profanityLanguages: [
      "en",
      "hi",
      "ta",
      "te",
      "kn",
      "mr",
      "bn",
      "gu",
      "pa",
      "ml",
    ],
    moderationLevel: "strict" as const,
  },
  moderate: {
    blockNumbers: true,
    blockEmails: true,
    blockLinks: true,
    blockSocialMedia: true,
    blockPhysicalAddresses: false,
    enableProfanityFilter: true,
    censorProfanity: true,
    profanityLanguages: ["en", "hi"],
    moderationLevel: "moderate" as const,
  },
  lenient: {
    blockNumbers: true,
    blockEmails: false,
    blockLinks: false,
    blockSocialMedia: false,
    blockPhysicalAddresses: false,
    enableProfanityFilter: false,
    censorProfanity: false,
    profanityLanguages: [],
    moderationLevel: "lenient" as const,
  },
};

/**
 * Main moderation engine
 */
export class ModerationEngine {
  private config: ModerationConfig;

  constructor(config: Partial<ModerationConfig> = {}) {
    this.config = { ...DEFAULT_MODERATION_CONFIG, ...config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ModerationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ModerationConfig {
    return { ...this.config };
  }

  /**
   * Set preset configuration
   */
  setPreset(preset: "strict" | "moderate" | "lenient"): void {
    this.config = { ...MODERATION_PRESETS[preset] };
  }

  /**
   * Moderate a message
   */
  moderate(content: string): ModerationResult {
    const violations: Violation[] = [];
    let cleanContent = content;
    let shouldBlock = false;

    // Check for numbers
    if (this.config.blockNumbers) {
      const numberViolations = detectNumberViolations(content);
      if (numberViolations.length > 0) {
        violations.push({
          type: "number",
          matches: numberViolations.map((v) => v.pattern),
          severity: "block",
          description:
            "Message contains sensitive number information (phone, credit card, etc.)",
        });
        shouldBlock = true;
        cleanContent = censorNumbers(cleanContent);
      }
    }

    // Check for contact information
    if (
      this.config.blockEmails ||
      this.config.blockSocialMedia ||
      this.config.blockPhysicalAddresses
    ) {
      const contactViolations = detectContactViolations(content);
      const filtered = contactViolations.filter((v) => {
        if (v.type === "email" && this.config.blockEmails) return true;
        if (v.type === "socialMedia" && this.config.blockSocialMedia)
          return true;
        if (v.type === "physicalAddress" && this.config.blockPhysicalAddresses)
          return true;
        return false;
      });

      if (filtered.length > 0) {
        violations.push({
          type: "contact",
          matches: filtered.map((v) => v.pattern),
          severity: "block",
          description: "Message contains contact information",
        });
        shouldBlock = true;
        cleanContent = censorContacts(cleanContent);
      }
    }

    // Check for links
    if (this.config.blockLinks) {
      const linkViolations = detectLinkViolations(content);
      if (linkViolations.length > 0) {
        violations.push({
          type: "link",
          matches: linkViolations.map((v) => v.pattern),
          severity: "block",
          description: "Message contains external links or URLs",
        });
        shouldBlock = true;
        cleanContent = censorLinks(cleanContent);
      }
    }

    // Check for profanity
    if (this.config.enableProfanityFilter) {
      const profanities = detectProfanity(
        content,
        this.config.profanityLanguages
      );
      if (profanities.length > 0) {
        const severity = getProfanitySeverity(profanities.length);
        violations.push({
          type: "profanity",
          matches: profanities,
          severity: severity === "high" ? "block" : "warning",
          description: `Message contains ${severity} level profanity`,
        });

        if (severity === "high") {
          shouldBlock = true;
        }

        if (this.config.censorProfanity) {
          cleanContent = censorProfanity(
            cleanContent,
            this.config.profanityLanguages
          );
        }
      }
    }

    return {
      isAllowed: !shouldBlock,
      violations,
      cleanContent,
      flaggedIndices: violations.length > 0 ? [0] : [],
    };
  }

  /**
   * Check if a specific type of content is blocked
   */
  isTypeBlocked(type: "numbers" | "emails" | "links" | "profanity"): boolean {
    switch (type) {
      case "numbers":
        return this.config.blockNumbers;
      case "emails":
        return this.config.blockEmails;
      case "links":
        return this.config.blockLinks;
      case "profanity":
        return this.config.enableProfanityFilter;
      default:
        return false;
    }
  }
}

/**
 * Create a moderation engine with default config
 */
export function createModerationEngine(
  config?: Partial<ModerationConfig>
): ModerationEngine {
  return new ModerationEngine(config);
}

/**
 * Moderate content with default settings
 */
export function moderateContent(content: string): ModerationResult {
  const engine = new ModerationEngine();
  return engine.moderate(content);
}