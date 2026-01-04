import { useState, useCallback } from "react";
import {
  ModerationEngine,
  createModerationEngine,
  MODERATION_PRESETS,
} from "@/lib/moderation/moderationEngine.ts";
import { ModerationResult, ModerationConfig } from "@/lib/moderation/types.ts";

/**
 * Hook for message moderation
 */
export function useMessageModeration(
  initialConfig?: Partial<ModerationConfig>
) {
  const [engine] = useState(() => createModerationEngine(initialConfig));
  const [moderationResult, setModerationResult] =
    useState<ModerationResult | null>(null);

  /**
   * Moderate a message
   */
  const moderate = useCallback(
    (content: string): ModerationResult => {
      const result = engine.moderate(content);
      setModerationResult(result);
      return result;
    },
    [engine]
  );

  /**
   * Update moderation config
   */
  const updateConfig = useCallback(
    (config: Partial<ModerationConfig>) => {
      engine.updateConfig(config);
    },
    [engine]
  );

  /**
   * Set preset configuration
   */
  const setPreset = useCallback(
    (preset: "strict" | "moderate" | "lenient") => {
      engine.setPreset(preset);
    },
    [engine]
  );

  /**
   * Get current config
   */
  const getConfig = useCallback(() => {
    return engine.getConfig();
  }, [engine]);

  /**
   * Check if type is blocked
   */
  const isTypeBlocked = useCallback(
    (type: "numbers" | "emails" | "links" | "profanity"): boolean => {
      return engine.isTypeBlocked(type);
    },
    [engine]
  );

  return {
    moderate,
    updateConfig,
    setPreset,
    getConfig,
    isTypeBlocked,
    moderationResult,
    engine,
  };
}

/**
 * Hook to track moderation warnings
 */
export function useModerationWarnings() {
  const [warnings, setWarnings] = useState<ModerationResult[]>([]);

  const addWarning = useCallback((result: ModerationResult) => {
    if (result.violations.length > 0) {
      setWarnings((prev) => [...prev, result]);
      // Auto-clear warnings after 5 seconds
      setTimeout(() => {
        setWarnings((prev) => prev.filter((w) => w !== result));
      }, 5000);
    }
  }, []);

  const clearWarnings = useCallback(() => {
    setWarnings([]);
  }, []);

  return {
    warnings,
    addWarning,
    clearWarnings,
    hasWarnings: warnings.length > 0,
  };
}

/**
 * Hook for moderation presets
 */
export function useModerationPresets() {
  const [preset, setSelectedPreset] = useState<
    "strict" | "moderate" | "lenient"
  >("moderate");

  const getPresetConfig = useCallback(
    (presetName: "strict" | "moderate" | "lenient") => {
      return MODERATION_PRESETS[presetName];
    },
    []
  );

  return {
    preset,
    setPreset: setSelectedPreset,
    getPresetConfig,
    availablePresets: Object.keys(MODERATION_PRESETS) as Array<
      "strict" | "moderate" | "lenient"
    >,
  };
}