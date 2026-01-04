import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Globe, AlertTriangle } from "lucide-react";
import {
  useModerationPresets,
  useMessageModeration,
} from "@/hooks/useMessageModeration";
import { useSupportedLanguages } from "@/hooks/useTranslation";
import { getSupportedLanguages } from "@/lib/translation/languages";

interface ChatPreferencesProps {
  onSave?: (settings: ChatSettings) => void;
  onClose?: () => void;
}

export interface ChatSettings {
  // Moderation
  moderationLevel: "strict" | "moderate" | "lenient";
  blockNumbers: boolean;
  blockEmails: boolean;
  blockLinks: boolean;
  blockSocialMedia: boolean;
  blockPhysicalAddresses: boolean;
  enableProfanityFilter: boolean;
  censorProfanity: boolean;
  profanityLanguages: string[];

  // Translation
  autoTranslate: boolean;
  preferredLanguage: string;
  showOriginalWithTranslation: boolean;
}

const DEFAULT_SETTINGS: ChatSettings = {
  moderationLevel: "moderate",
  blockNumbers: true,
  blockEmails: true,
  blockLinks: true,
  blockSocialMedia: true,
  blockPhysicalAddresses: false,
  enableProfanityFilter: true,
  censorProfanity: true,
  profanityLanguages: ["en", "hi"],
  autoTranslate: false,
  preferredLanguage: "en",
  showOriginalWithTranslation: true,
};

/**
 * Chat Moderation & Translation Settings Component
 */
export function ChatPreferencesModal({
  onSave,
  onClose,
}: ChatPreferencesProps) {
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const languages = getSupportedLanguages();

  const handleSettingChange = (key: keyof ChatSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleModerationLevelChange = (
    level: "strict" | "moderate" | "lenient"
  ) => {
    const presets: Record<string, Partial<ChatSettings>> = {
      strict: {
        blockNumbers: true,
        blockEmails: true,
        blockLinks: true,
        blockSocialMedia: true,
        blockPhysicalAddresses: true,
        enableProfanityFilter: true,
        censorProfanity: true,
      },
      moderate: {
        blockNumbers: true,
        blockEmails: true,
        blockLinks: true,
        blockSocialMedia: true,
        blockPhysicalAddresses: false,
        enableProfanityFilter: true,
        censorProfanity: true,
      },
      lenient: {
        blockNumbers: true,
        blockEmails: false,
        blockLinks: false,
        blockSocialMedia: false,
        blockPhysicalAddresses: false,
        enableProfanityFilter: false,
        censorProfanity: false,
      },
    };

    setSettings((prev) => ({
      ...prev,
      moderationLevel: level,
      ...presets[level],
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave?.(settings);
    setHasChanges(false);
    setShowConfirm(false);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto">
      {/* Moderation Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold">Message Moderation</h2>
        </div>

        {/* Moderation Level */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Moderation Level</Label>
          <div className="flex gap-2">
            {(["strict", "moderate", "lenient"] as const).map((level) => (
              <button
                key={level}
                onClick={() => handleModerationLevelChange(level)}
                className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                  settings.moderationLevel === level
                    ? "bg-red-100 border-red-300 text-red-900"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {settings.moderationLevel === "strict" &&
              "Highest filtering - blocks numbers, emails, links, and more"}
            {settings.moderationLevel === "moderate" &&
              "Balanced filtering - allows most content but blocks sensitive info"}
            {settings.moderationLevel === "lenient" &&
              "Minimal filtering - only basic protections"}
          </p>
        </div>

        {/* Individual Moderation Options */}
        <div className="space-y-3 border-t pt-4">
          <Label className="text-sm font-medium block">
            Blocked Content Types
          </Label>

          {[
            {
              key: "blockNumbers",
              label: "Block phone numbers & credit cards",
              icon: "📞",
            },
            {
              key: "blockEmails",
              label: "Block email addresses",
              icon: "📧",
            },
            {
              key: "blockLinks",
              label: "Block external links & URLs",
              icon: "🔗",
            },
            {
              key: "blockSocialMedia",
              label: "Block social media handles",
              icon: "👥",
            },
            {
              key: "blockPhysicalAddresses",
              label: "Block physical addresses",
              icon: "📍",
            },
          ].map((option) => (
            <div
              key={option.key}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={() =>
                handleSettingChange(
                  option.key as keyof ChatSettings,
                  !settings[option.key as keyof ChatSettings]
                )
              }
            >
              <input
                type="checkbox"
                checked={settings[option.key as keyof ChatSettings] as boolean}
                onChange={() => {}}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm">{option.icon}</span>
              <span className="text-sm font-medium flex-1">{option.label}</span>
            </div>
          ))}
        </div>

        {/* Profanity Filter */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Profanity Filter</Label>
            <Badge
              className={
                settings.enableProfanityFilter
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {settings.enableProfanityFilter ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          <div
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() =>
              handleSettingChange(
                "enableProfanityFilter",
                !settings.enableProfanityFilter
              )
            }
          >
            <input
              type="checkbox"
              checked={settings.enableProfanityFilter}
              onChange={() => {}}
              className="h-4 w-4 rounded"
            />
            <span className="text-sm font-medium flex-1">
              Enable profanity detection
            </span>
          </div>

          {settings.enableProfanityFilter && (
            <>
              <div
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() =>
                  handleSettingChange(
                    "censorProfanity",
                    !settings.censorProfanity
                  )
                }
              >
                <input
                  type="checkbox"
                  checked={settings.censorProfanity}
                  onChange={() => {}}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm font-medium flex-1">
                  Censor profanity (vs block message)
                </span>
              </div>

              <div>
                <Label className="text-xs font-medium block mb-2">
                  Languages to check for profanity
                </Label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        const newLangs = settings.profanityLanguages.includes(
                          lang.code
                        )
                          ? settings.profanityLanguages.filter(
                              (l) => l !== lang.code
                            )
                          : [...settings.profanityLanguages, lang.code];
                        handleSettingChange("profanityLanguages", newLangs);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        settings.profanityLanguages.includes(lang.code)
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Translation Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Chat Translation</h2>
        </div>

        {/* Auto Translate */}
        <div
          className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer border border-blue-200"
          onClick={() =>
            handleSettingChange("autoTranslate", !settings.autoTranslate)
          }
        >
          <input
            type="checkbox"
            checked={settings.autoTranslate}
            onChange={() => {}}
            className="h-4 w-4 rounded"
          />
          <span className="text-sm font-medium flex-1">
            Automatically translate received messages
          </span>
        </div>

        {/* Preferred Language */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preferred Language</Label>
          <Select
            value={settings.preferredLanguage}
            onValueChange={(value) =>
              handleSettingChange("preferredLanguage", value)
            }
          >
            <SelectTrigger>
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
        </div>

        {/* Show Original with Translation */}
        <div
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
          onClick={() =>
            handleSettingChange(
              "showOriginalWithTranslation",
              !settings.showOriginalWithTranslation
            )
          }
        >
          <input
            type="checkbox"
            checked={settings.showOriginalWithTranslation}
            onChange={() => {}}
            className="h-4 w-4 rounded"
          />
          <span className="text-sm font-medium flex-1">
            Show original message with translation
          </span>
        </div>

        <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          💡 <strong>Tip:</strong> Use the translation feature in chat to
          translate your messages before sending. Choose any Indian language to
          communicate with people who speak different languages.
        </p>
      </Card>

      {/* Warnings */}
      {settings.moderationLevel === "lenient" && (
        <div className="flex gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold">Lenient moderation active</p>
            <p className="text-xs mt-1">
              You've enabled lenient moderation. Be cautious when sharing
              messages as fewer safeguards are in place.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-white p-4 border-t">
        <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
          Reset to Defaults
        </Button>
        <Button
          onClick={onClose}
          variant="ghost"
          disabled={hasChanges}
          className="ml-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={!hasChanges}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save Changes
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Settings?</AlertDialogTitle>
            <AlertDialogDescription>
              Your chat moderation and translation preferences will be updated.
              These settings will apply to all future messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>
              Save Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ChatPreferencesModal;
