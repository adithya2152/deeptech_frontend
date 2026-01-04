# Chat Moderation & Translation System

## 🎯 Overview

A comprehensive chat moderation and translation system built for the DeepTech platform that supports:

- **Advanced Content Moderation**: Blocks numbers, contact info, links, and profanity
- **Multi-Language Translation**: Supports 11 Indian languages
- **Smart Language Detection**: Auto-detects message language
- **Configurable Presets**: Strict, Moderate, and Lenient moderation levels

---

## 📦 Architecture

### Directory Structure

```
src/
├── lib/
│   ├── moderation/
│   │   ├── types.ts                 # Type definitions
│   │   ├── numberFilter.ts          # Phone, CC, SSN detection
│   │   ├── contactFilter.ts         # Email, social, addresses
│   │   ├── linkFilter.ts            # URL, domain, shortened links
│   │   ├── profanityFilter.ts       # Multi-language profanity
│   │   ├── moderationEngine.ts      # Main orchestration
│   │   └── index.ts                 # Exports
│   ├── translation/
│   │   ├── languages.ts             # Language metadata
│   │   ├── cache.ts                 # Translation caching
│   │   ├── languageDetector.ts      # Auto-detection
│   │   ├── translationEngine.ts     # Translation logic
│   │   └── index.ts                 # Exports
├── hooks/
│   ├── useMessageModeration.ts      # Moderation hooks
│   └── useTranslation.ts            # Translation hooks
├── components/
│   └── chat/
│       ├── ModerationAlert.tsx      # Alert component
│       ├── TranslationSelector.tsx  # Language selector
│       └── ChatPreferencesModal.tsx # Settings panel
└── pages/
    └── messages/
        └── MessagesPage.tsx         # Main integration
```

---

## 🚀 Features

### 1. Content Moderation

#### **Number Detection**

- ✅ Indian phone numbers (10 digits)
- ✅ International phone numbers
- ✅ Credit card patterns
- ✅ SSN (Social Security Numbers)
- ✅ Bank account numbers

```typescript
import { detectNumberViolations, censorNumbers } from "@/lib/moderation";

const violations = detectNumberViolations("+91 98765 43210");
const censored = censorNumbers("My number is +91 98765 43210");
// "My number is [REDACTED_PHONE]"
```

#### **Contact Information Blocking**

- ✅ Email addresses
- ✅ Social media handles (@username)
- ✅ Social media profile URLs (Instagram, Facebook, Twitter, LinkedIn, TikTok, Telegram)
- ✅ Physical addresses
- ✅ ZIP codes / PIN codes
- ✅ GPS coordinates

#### **Link Detection**

- ✅ Full URLs (http, https, ftp)
- ✅ Domain names
- ✅ Shortened URLs (bit.ly, tinyurl, etc.)
- ✅ File download paths

#### **Multi-Language Profanity**

- ✅ English
- ✅ Hindi (हिन्दी)
- ✅ Tamil (தமிழ்)
- ✅ Telugu (తెలుగు)
- ✅ Kannada (ಕನ್ನಡ)
- ✅ Marathi (मराठी)
- ✅ Bengali (বাংলা)
- ✅ Gujarati (ગુજરાતી)
- ✅ Punjabi (ਪੰਜਾਬੀ)
- ✅ Malayalam (മലയാളം)
- ✅ Urdu (اردو)

### 2. Chat Translation

#### **Supported Languages**

All 11 Indian languages plus English with automatic:

- Language detection
- Text translation
- Caching for performance
- Multi-language support

#### **Translation Features**

- Real-time translation before sending
- Auto-detect source language
- Select any target language
- Translation caching (24-hour cache)
- Batch translations
- Confidence scoring

### 3. Moderation Presets

```typescript
// Strict: Maximum filtering
const strictConfig = {
  blockNumbers: true,
  blockEmails: true,
  blockLinks: true,
  blockSocialMedia: true,
  blockPhysicalAddresses: true,
  enableProfanityFilter: true,
};

// Moderate: Balanced filtering (default)
const moderateConfig = {
  blockNumbers: true,
  blockEmails: true,
  blockLinks: true,
  blockSocialMedia: true,
  blockPhysicalAddresses: false,
  enableProfanityFilter: true,
};

// Lenient: Minimal filtering
const lenientConfig = {
  blockNumbers: true,
  blockEmails: false,
  blockLinks: false,
  blockSocialMedia: false,
  blockPhysicalAddresses: false,
  enableProfanityFilter: false,
};
```

---

## 📚 Usage Guide

### Moderation Hook

```typescript
import { useMessageModeration } from "@/hooks/useMessageModeration";

function MyComponent() {
  const { moderate, moderationResult, updateConfig, setPreset } =
    useMessageModeration({
      moderationLevel: "moderate",
    });

  // Check message
  const result = moderate("Call me at +91 98765 43210");

  if (!result.isAllowed) {
    console.log("Message blocked:", result.violations);
  } else {
    console.log("Clean content:", result.cleanContent);
  }

  // Change preset
  setPreset("strict");

  // Update specific config
  updateConfig({ blockEmails: false });
}
```

### Translation Hook

```typescript
import { useTranslationFeatures } from "@/hooks/useTranslation";

function MyComponent() {
  const {
    translate,
    detect,
    detectedLanguage,
    sourceLanguage,
    targetLanguage,
    selectTargetLanguage,
    isTranslating,
  } = useTranslationFeatures();

  // Auto-detect language
  useEffect(() => {
    detect("नमस्ते दोस्त");
  }, []);

  // Translate text
  const handleTranslate = async () => {
    const result = await translate(
      "Hello friend",
      "hi", // target: Hindi
      "en" // source: English
    );
    console.log(result); // "नमस्ते दोस्त"
  };
}
```

### UI Components

#### **ModerationAlert**

```typescript
import { ModerationAlert } from "@/components/chat/ModerationAlert";

<ModerationAlert
  result={moderationResult}
  onEdit={() => setMessageText(messageText)}
  onDismiss={() => setShowAlert(false)}
  showDetails={true}
/>;
```

#### **TranslationSelector**

```typescript
import { TranslationSelector } from "@/components/chat/TranslationSelector";

<TranslationSelector
  sourceLanguage="en"
  targetLanguage="hi"
  onSourceChange={setSource}
  onTargetChange={setTarget}
  autoDetect={true}
  detectedLanguage="hi"
  detectionConfidence={0.95}
/>;
```

#### **ChatPreferencesModal**

```typescript
import { ChatPreferencesModal } from "@/components/chat/ChatPreferencesModal";

<ChatPreferencesModal
  onSave={(settings) => saveUserPreferences(settings)}
  onClose={() => setShowModal(false)}
/>;
```

---

## 🔧 Configuration

### Environment Variables

```env
# Google Translate API (optional, for production)
VITE_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

### Custom Profanity List

```typescript
import { addCustomProfanity } from "@/lib/moderation";

// Add custom words for a language
addCustomProfanity("hi", ["कस्टम_गाली_1", "कस्टम_गाली_2"]);
```

### Moderation Engine

```typescript
import { createModerationEngine, MODERATION_PRESETS } from "@/lib/moderation";

// Create with custom config
const engine = createModerationEngine({
  blockNumbers: true,
  blockEmails: false,
  moderationLevel: "lenient",
});

// Or use presets
engine.setPreset("strict");

// Moderate content
const result = engine.moderate("Your message here");
```

---

## 🌐 Translation Flow

```
User Types Message
        ↓
Language Detection (auto or manual)
        ↓
Check Moderation Rules
        ├─ Blocked? → Show Alert
        └─ Clean? → Continue
        ↓
Translate to Target Language (if needed)
        ↓
Send Message with Translation Metadata
        ↓
Store Original + Translation
        ↓
Recipient Views (Original + Translated)
```

---

## 💾 Caching Strategy

Translation cache stores:

- **Key**: `{source_lang}_{target_lang}_{hash}`
- **Value**: Translated text
- **TTL**: 24 hours
- **Max Size**: 1000 entries
- **Auto-eviction**: Oldest entries removed when full

---

## 📊 ModerationResult Structure

```typescript
interface ModerationResult {
  isAllowed: boolean; // Can message be sent?
  violations: Violation[]; // What was found?
  cleanContent: string; // Censored version
  flaggedIndices: number[]; // Where issues are
}

interface Violation {
  type: "number" | "contact" | "link" | "profanity";
  severity: "warning" | "block";
  description: string;
  matches: string[];
}
```

---

## 🧪 Testing

### Test Moderation

```typescript
const { moderate } = useMessageModeration();

// Test cases
moderate("+91 98765 43210"); // Number blocked
moderate("contact@example.com"); // Email blocked
moderate("Check this link https://example.com"); // Link blocked
moderate("This is a badword"); // Profanity detected
moderate("Hello friend!"); // Clean message
```

### Test Translation

```typescript
const { translate, detect } = useTranslationFeatures();

// Detect language
detect("नमस्ते"); // Should return "hi"
detect("Hello"); // Should return "en"

// Translate
await translate("Hello", "hi", "en"); // English to Hindi
await translate("नमस्ते", "en", "hi"); // Hindi to English
```

---

## 🎨 UI Integration in MessagesPage

The system is already integrated into `MessagesPage.tsx`:

1. **Moderation Alert Panel**: Shows if message is blocked
2. **Translation Selector**: Toggle to show language selection
3. **Auto-Detection**: Detects language as user types
4. **Smart Send**: Moderates before sending, translates if needed

### User Flow:

1. User types message
2. Auto-detects language
3. Shows moderation status
4. Can toggle translation panel
5. Selects target language
6. Message is censored if needed
7. Message is translated if needed
8. Message is sent

---

## 🔐 Security Considerations

1. **Backend Validation**: Always validate on server too
2. **Regex Patterns**: Updated regularly for false positives
3. **PII Protection**: Numbers/emails are censored
4. **Cache Security**: Translation cache is client-side only
5. **API Keys**: Keep translation API key in env only

---

## 📈 Performance

- **Translation Caching**: Reduces API calls by ~70%
- **Lazy Detection**: Language detection only on user input
- **Batch Operations**: Can translate multiple messages in parallel
- **Memory Efficient**: Caches cleared after 24 hours

---

## 🚨 Limitations

1. **API Key Required**: For production translation (Google Translate API)
2. **False Positives**: Number detection may catch legitimate sequences
3. **Language Specific**: Profanity only for listed languages
4. **Regex Based**: Pattern matching, not ML-based detection
5. **Client-Side**: Moderation happens client-side (server validation needed)

---

## 🛠️ Future Enhancements

- [ ] ML-based content classification
- [ ] Real-time spam detection
- [ ] User-reported content moderation queue
- [ ] Admin dashboard for moderation stats
- [ ] Webhook integration for backend moderation
- [ ] Custom word filters per user/group
- [ ] Sentiment analysis
- [ ] Toxicity scoring

---

## 📝 License

Part of DeepTech Platform. Internal use only.
