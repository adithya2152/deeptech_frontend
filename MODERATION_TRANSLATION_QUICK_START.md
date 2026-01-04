# Quick Reference - Chat Moderation & Translation

## 🚀 Quick Start

### In Your Component

```typescript
import { useMessageModeration } from "@/hooks/useMessageModeration";
import { useTranslationFeatures } from "@/hooks/useTranslation";
import { ModerationAlert } from "@/components/chat/ModerationAlert";

function ChatComponent() {
  // Moderation
  const { moderate, moderationResult } = useMessageModeration({
    moderationLevel: "moderate",
  });

  // Translation
  const { translate, detect, detectedLanguage, targetLanguage } =
    useTranslationFeatures();

  const handleSend = async (message) => {
    // 1. Check moderation
    const modResult = moderate(message);
    if (!modResult.isAllowed) {
      return <ModerationAlert result={modResult} />;
    }

    // 2. Translate if needed
    if (targetLanguage !== detectedLanguage) {
      const translated = await translate(
        message,
        targetLanguage,
        detectedLanguage
      );
      message = translated;
    }

    // 3. Send message
    await sendMessage(message);
  };
}
```

---

## 📋 Common Patterns

### Check if Message is Safe

```typescript
const { moderate } = useMessageModeration();

const result = moderate(userMessage);
if (result.isAllowed) {
  // Safe to send
} else {
  // Show warnings
  result.violations.forEach((v) => console.log(v.description));
}
```

### Auto-Detect Language

```typescript
const { detect } = useTranslationFeatures();

const lang = detect("नमस्ते"); // Returns "hi"
```

### Translate Message

```typescript
const { translate } = useTranslationFeatures();

const result = await translate(
  "Hello friend",
  "hi", // Target: Hindi
  "en" // Source: English
);
// Result: "नमस्ते दोस्त"
```

### Change Moderation Level

```typescript
const { setPreset } = useModerationPresets();

setPreset("strict"); // Maximum filtering
setPreset("moderate"); // Balanced (default)
setPreset("lenient"); // Minimal filtering
```

---

## 🎨 UI Components

### Show Moderation Alert

```typescript
import { ModerationAlert } from "@/components/chat/ModerationAlert";

<ModerationAlert
  result={moderationResult}
  onEdit={() => {}}
  onDismiss={() => {}}
  showDetails={true}
/>;
```

### Language Selector

```typescript
import { TranslationSelector } from "@/components/chat/TranslationSelector";

<TranslationSelector
  sourceLanguage="en"
  targetLanguage="hi"
  onSourceChange={setSource}
  onTargetChange={setTarget}
/>;
```

### Settings Modal

```typescript
import { ChatPreferencesModal } from "@/components/chat/ChatPreferencesModal";

<ChatPreferencesModal
  onSave={(settings) => saveSettings(settings)}
  onClose={() => {}}
/>;
```

---

## 🔍 Detection Examples

### What Gets Blocked?

| Type      | Example             | Status      |
| --------- | ------------------- | ----------- |
| Phone     | +91 98765 43210     | 🚫 BLOCKED  |
| Email     | user@example.com    | 🚫 BLOCKED  |
| Link      | https://example.com | 🚫 BLOCKED  |
| Social    | @username           | 🚫 BLOCKED  |
| Address   | 123 Main St, City   | 🚫 BLOCKED  |
| Profanity | damn, badword       | ⚠️ CENSORED |
| Safe text | Hello world!        | ✅ ALLOWED  |

---

## 🌐 Supported Languages

```
🇮🇳 en - English
🇮🇳 hi - Hindi (हिन्दी)
🇮🇳 ta - Tamil (தமிழ்)
🇮🇳 te - Telugu (తెలుగు)
🇮🇳 kn - Kannada (ಕನ್ನಡ)
🇮🇳 mr - Marathi (मराठी)
🇮🇳 bn - Bengali (বাংলা)
🇮🇳 gu - Gujarati (ગુજરાતી)
🇮🇳 pa - Punjabi (ਪੰਜਾਬੀ)
🇮🇳 ml - Malayalam (മലയാളം)
🇵🇰 ur - Urdu (اردو)
```

---

## ⚙️ Configuration

### Moderation Presets

```typescript
// Strict
const config = {
  blockNumbers: true,
  blockEmails: true,
  blockLinks: true,
  blockSocialMedia: true,
  blockPhysicalAddresses: true,
  enableProfanityFilter: true,
};

// Moderate (default)
const config = {
  blockNumbers: true,
  blockEmails: true,
  blockLinks: true,
  blockSocialMedia: true,
  blockPhysicalAddresses: false,
  enableProfanityFilter: true,
};

// Lenient
const config = {
  blockNumbers: true,
  blockEmails: false,
  blockLinks: false,
  blockSocialMedia: false,
  blockPhysicalAddresses: false,
  enableProfanityFilter: false,
};
```

### Environment Variables

```env
# For translation API (Google Translate)
VITE_GOOGLE_TRANSLATE_API_KEY=your_key_here
```

---

## 📊 API Reference

### Moderation Engine

```typescript
import { ModerationEngine } from "@/lib/moderation";

const engine = new ModerationEngine({ moderationLevel: "moderate" });

// Moderate a message
const result = engine.moderate(content);
// Result: { isAllowed, violations, cleanContent, flaggedIndices }

// Update config
engine.updateConfig({ blockEmails: false });

// Set preset
engine.setPreset("strict");

// Get config
const config = engine.getConfig();

// Check if type is blocked
engine.isTypeBlocked("numbers"); // boolean
```

### Translation Engine

```typescript
import { translateText, detectLanguage } from "@/lib/translation";

// Detect language
const lang = detectLanguage(text); // "hi", "en", etc

// Translate
const translated = await translateText(text, sourceLanguage, targetLanguage);

// Translate to multiple languages
const translations = await translateToMultiple(text, sourceLanguage, [
  "hi",
  "ta",
  "te",
]); // { hi: "...", ta: "...", te: "..." }
```

---

## 🧪 Testing

### Test Moderation

```typescript
const { moderate } = useMessageModeration();

// These should be blocked
moderate("+91 98765 43210");
moderate("contact@example.com");
moderate("https://example.com");
moderate("damn it");

// These should be allowed
moderate("Hello world!");
moderate("Let's meet tomorrow");
moderate("The TRL is 7");
```

### Test Translation

```typescript
const { translate, detect } = useTranslationFeatures();

// Test detection
detect("नमस्ते"); // "hi"
detect("Hello"); // "en"
detect("வணக்கம்"); // "ta"

// Test translation
await translate("Hello", "hi", "en"); // Hindi
await translate("नमस्ते", "en", "hi"); // English
```

---

## 🎯 File Locations

```
Moderation:
  src/lib/moderation/                 # Core logic
  src/hooks/useMessageModeration.ts   # React hook
  src/components/chat/ModerationAlert.tsx

Translation:
  src/lib/translation/                # Core logic
  src/hooks/useTranslation.ts         # React hooks
  src/components/chat/TranslationSelector.tsx

Integration:
  src/pages/messages/MessagesPage.tsx

Settings:
  src/components/chat/ChatPreferencesModal.tsx

Documentation:
  CHAT_MODERATION_TRANSLATION_GUIDE.md
  IMPLEMENTATION_COMPLETE.md
```

---

## ❓ FAQ

**Q: What happens if message is blocked?**  
A: User sees alert with reason and can edit message before resending.

**Q: Can I change moderation level?**  
A: Yes, via `setPreset()` or `updateConfig()`.

**Q: Does translation require internet?**  
A: Yes, for Google Translate API. Offline fallback with cached translations.

**Q: Which languages support profanity detection?**  
A: English and all 10 Indian languages.

**Q: Is moderation server-side or client-side?**  
A: Currently client-side. Always validate on backend too!

**Q: Can I add custom profanity?**  
A: Yes, use `addCustomProfanity(language, words)`.

---

## 🚀 Quick Deploy Checklist

- [ ] Add `VITE_GOOGLE_TRANSLATE_API_KEY` to `.env`
- [ ] Build succeeds: `npm run build`
- [ ] Test in development: `npm run dev`
- [ ] Test moderation with sample texts
- [ ] Test translation between languages
- [ ] Verify UI shows alerts correctly
- [ ] Check performance (no lag)
- [ ] Deploy to production

---

**For detailed documentation**, see `CHAT_MODERATION_TRANSLATION_GUIDE.md`
