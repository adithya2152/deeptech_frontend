import React, { useState } from "react";
import { Languages, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getSupportedLanguages,
  getLanguageInfo,
} from "@/lib/translation/languages";

interface TranslationSelectorProps {
  sourceLanguage: string;
  targetLanguage: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  autoDetect?: boolean;
  onAutoDetectToggle?: () => void;
  isTranslating?: boolean;
  showDetectedLanguage?: boolean;
  detectedLanguage?: string;
  detectionConfidence?: number;
}

export function TranslationSelector({
  sourceLanguage,
  targetLanguage,
  onSourceChange,
  onTargetChange,
  autoDetect = true,
  onAutoDetectToggle,
  isTranslating = false,
  showDetectedLanguage = false,
  detectedLanguage,
  detectionConfidence = 0,
}: TranslationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const languages = getSupportedLanguages();

  const sourceInfo = getLanguageInfo(sourceLanguage);
  const targetInfo = getLanguageInfo(targetLanguage);

  return (
    <div className="space-y-3">
      {/* Main Translation Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold text-gray-600">
            Translate:
          </span>
        </div>

        {/* Source Language */}
        <div className="flex items-center gap-1">
          {autoDetect ? (
            <Badge
              variant="secondary"
              className="text-xs cursor-pointer"
              onClick={onAutoDetectToggle}
            >
              Auto:{" "}
              {detectedLanguage
                ? getLanguageInfo(detectedLanguage)?.name
                : "English"}
              {detectionConfidence > 0 && (
                <span className="ml-1 text-gray-500">
                  ({Math.round(detectionConfidence * 100)}%)
                </span>
              )}
            </Badge>
          ) : (
            <Select value={sourceLanguage} onValueChange={onSourceChange}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Arrow */}
        <span className="text-gray-400">→</span>

        {/* Target Language */}
        <Select
          value={targetLanguage}
          onValueChange={onTargetChange}
          disabled={isTranslating}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Toggle Auto-Detect Button */}
        {onAutoDetectToggle && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={onAutoDetectToggle}
            title={autoDetect ? "Disable auto-detect" : "Enable auto-detect"}
          >
            {autoDetect ? "📍 Auto" : "🔧 Manual"}
          </Button>
        )}
      </div>

      {/* Detection Info */}
      {showDetectedLanguage && detectedLanguage && (
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span>Detected: {getLanguageInfo(detectedLanguage)?.nativeName}</span>
          {detectionConfidence > 0.8 && (
            <Badge className="bg-green-100 text-green-800 text-xs">
              High Confidence
            </Badge>
          )}
          {detectionConfidence > 0.5 && detectionConfidence <= 0.8 && (
            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
              Medium Confidence
            </Badge>
          )}
          {detectionConfidence <= 0.5 && (
            <Badge className="bg-gray-100 text-gray-800 text-xs">
              Low Confidence
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact translation selector for inline use
 */
interface CompactTranslationSelectorProps {
  targetLanguage: string;
  onTargetChange: (lang: string) => void;
  isTranslating?: boolean;
}

export function CompactTranslationSelector({
  targetLanguage,
  onTargetChange,
  isTranslating = false,
}: CompactTranslationSelectorProps) {
  const languages = getSupportedLanguages();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs"
          disabled={isTranslating}
        >
          <Languages className="h-3 w-3" />
          Translate
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onTargetChange(lang.code)}
            className={targetLanguage === lang.code ? "bg-blue-50" : ""}
          >
            {lang.flag} {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Translation display component (shows original and translated)
 */
interface TranslationDisplayProps {
  original: string;
  translated?: string;
  sourceLanguage: string;
  targetLanguage: string;
  showBoth?: boolean;
  layout?: "stacked" | "inline";
}

export function TranslationDisplay({
  original,
  translated,
  sourceLanguage,
  targetLanguage,
  showBoth = true,
  layout = "stacked",
}: TranslationDisplayProps) {
  const [showOriginal, setShowOriginal] = useState(true);
  const sourceInfo = getLanguageInfo(sourceLanguage);
  const targetInfo = getLanguageInfo(targetLanguage);

  if (!translated || sourceLanguage === targetLanguage) {
    return <div className="text-sm text-gray-700">{original}</div>;
  }

  if (layout === "inline") {
    return (
      <div className="space-y-1 text-sm">
        {showBoth && (
          <>
            <div className="text-gray-700">{original}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600">
                {targetInfo?.name}:
              </span>
              <span className="text-gray-600 italic">{translated}</span>
            </div>
          </>
        )}
        {!showBoth && <div className="text-gray-700">{translated}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      {showBoth && (
        <>
          {showOriginal && (
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-600 mb-1">
                {sourceInfo?.nativeName}
              </div>
              <div className="text-gray-700">{original}</div>
            </div>
          )}
          {translated && (
            <div className="p-2 bg-blue-50 rounded-lg">
              <div className="text-xs font-semibold text-blue-600 mb-1">
                {targetInfo?.nativeName}
              </div>
              <div className="text-gray-700">{translated}</div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6"
            onClick={() => setShowOriginal(!showOriginal)}
          >
            {showOriginal ? "Hide Original" : "Show Original"}
          </Button>
        </>
      )}
      {!showBoth && <div className="text-gray-700">{translated}</div>}
    </div>
  );
}
