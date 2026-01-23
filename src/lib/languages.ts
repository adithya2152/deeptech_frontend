export const SUPPORTED_LANGUAGES = [
    { code: 'en', native: 'English', label: 'English' },
    { code: 'hi', native: 'हिन्दी', label: 'Hindi' },
    { code: 'ta', native: 'தமிழ்', label: 'Tamil' },
    { code: 'te', native: 'తెలుగు', label: 'Telugu' },
    { code: 'kn', native: 'ಕನ್ನಡ', label: 'Kannada' },
    { code: 'ml', native: 'മലയാളം', label: 'Malayalam' },
    { code: 'bn', native: 'বাংলা', label: 'Bengali' },
    { code: 'de', native: 'Deutsch', label: 'German' },
    { code: 'es', native: 'Español', label: 'Spanish' },
    { code: 'fr', native: 'Français', label: 'French' },
    { code: 'it', native: 'Italiano', label: 'Italian' },
    { code: 'nl', native: 'Nederlands', label: 'Dutch' },
    { code: 'pt', native: 'Português', label: 'Portuguese' },
    { code: 'ru', native: 'Русский', label: 'Russian' },
    { code: 'zh-CN', native: '中文', label: 'Chinese' },
    { code: 'ja', native: '日本語', label: 'Japanese' },
    { code: 'ko', native: '한국어', label: 'Korean' },
    { code: 'ar', native: 'العربية', label: 'Arabic' },
];

export const SUPPORTED_LNGS = SUPPORTED_LANGUAGES.map(l => l.code);

export function getLanguageByCode(code: string) {
    if (!code) return SUPPORTED_LANGUAGES[0];
    const normalized = normalizeLanguageCode(code);
    return SUPPORTED_LANGUAGES.find(l => l.code === normalized) || SUPPORTED_LANGUAGES[0];
}

export function normalizeLanguageCode(code: string) {
    if (!code) return 'en';
    if (code.includes('-') && code !== 'zh-CN') {
        return code.split('-')[0];
    }
    return code;
}
