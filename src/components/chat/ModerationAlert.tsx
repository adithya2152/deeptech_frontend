import React from "react";
import { AlertCircle, CheckCircle, AlertTriangle, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ModerationResult } from "@/lib/moderation/types.ts";

interface ModerationAlertProps {
  result: ModerationResult;
  onDismiss?: () => void;
  onEdit?: () => void;
  showDetails?: boolean;
}

export function ModerationAlert({
  result,
  onDismiss,
  onEdit,
  showDetails = true,
}: ModerationAlertProps) {
  if (result.violations.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700">
          Message passed moderation
        </span>
      </div>
    );
  }

  const hasBlockedContent = result.violations.some(
    (v) => v.severity === "block"
  );
  const blockingViolations = result.violations.filter(
    (v) => v.severity === "block"
  );
  const warningViolations = result.violations.filter(
    (v) => v.severity === "warning"
  );

  return (
    <div className="space-y-3">
      {hasBlockedContent && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Message Blocked</AlertTitle>
          <AlertDescription>
            Your message contains content that violates community guidelines.
          </AlertDescription>
        </Alert>
      )}

      {warningViolations.length > 0 && (
        <Alert variant="default" className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Profanity Warning</AlertTitle>
          <AlertDescription className="text-yellow-700">
            This message contains profanity and will be censored before sending.
          </AlertDescription>
        </Alert>
      )}

      {showDetails && blockingViolations.length > 0 && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            Violations detected:
          </p>
          {blockingViolations.map((violation, idx) => (
            <div key={idx} className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 border-red-300"
                >
                  {violation.type}
                </Badge>
                <span className="text-gray-600 text-xs">
                  {violation.description}
                </span>
              </div>
              {violation.matches.length > 0 && (
                <div className="text-xs text-gray-500 ml-2">
                  {violation.matches.length} instance
                  {violation.matches.length !== 1 ? "s" : ""} found
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
          >
            Edit Message
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Simple inline violation indicator
 */
interface ViolationIndicatorProps {
  violations: ModerationResult["violations"];
  compact?: boolean;
}

export function ViolationIndicator({
  violations,
  compact = false,
}: ViolationIndicatorProps) {
  if (violations.length === 0) return null;

  const blockedCount = violations.filter((v) => v.severity === "block").length;
  const warningCount = violations.filter(
    (v) => v.severity === "warning"
  ).length;

  if (compact) {
    return (
      <div className="flex gap-1">
        {blockedCount > 0 && (
          <Badge className="bg-red-600 text-white text-xs">
            {blockedCount} blocked
          </Badge>
        )}
        {warningCount > 0 && (
          <Badge className="bg-yellow-600 text-white text-xs">
            {warningCount} warning
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {blockedCount > 0 && (
        <div className="flex items-center gap-1 text-red-600">
          <Shield className="h-4 w-4" />
          <span>
            {blockedCount} violation{blockedCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
      {warningCount > 0 && (
        <div className="flex items-center gap-1 text-yellow-600">
          <AlertTriangle className="h-4 w-4" />
          <span>
            {warningCount} warning{warningCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Moderation status badge
 */
interface ModerationStatusProps {
  isAllowed: boolean;
  violationCount?: number;
}

export function ModerationStatus({
  isAllowed,
  violationCount = 0,
}: ModerationStatusProps) {
  if (isAllowed) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
        <CheckCircle className="h-3 w-3" />
        Clean
      </Badge>
    );
  }

  return (
    <Badge className="bg-red-100 text-red-800 border-red-200 gap-1">
      <AlertCircle className="h-3 w-3" />
      {violationCount} Issue{violationCount !== 1 ? "s" : ""}
    </Badge>
  );
}