import { useEffect, useMemo, useState, useRef } from 'react';
import { Globe, ChevronDown, Check, Loader2 } from 'lucide-react';

type Lang = { code: string; label: string; flag: string };

const LANGS: Lang[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', flag: '🇧🇩' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', flag: '🇮🇳' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' },
  { code: 'zh-CN', label: 'Mandarin', flag: '🇨🇳' }
];

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

function setGoogleLang(lang: string) {
  // Google widget creates a hidden <select class="goog-te-combo">
  const combo = document.querySelector<HTMLSelectElement>('select.goog-te-combo');
  if (!combo) return false;

  combo.value = lang;
  combo.dispatchEvent(new Event('change'));
  return true;
}

export default function GoogleTranslate() {
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<string>(() => localStorage.getItem('gt_lang') || 'en');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const includedLanguages = useMemo(
    () => LANGS.map(l => l.code).join(','),
    []
  );

  // 1. Inject Script & Styles
  useEffect(() => {
    // Inject minimal CSS globally
    const styleId = 'gt-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .goog-te-banner-frame { display: none !important; }
        body { top: 0px !important; }
        .goog-logo-link, .goog-te-gadget span { display: none !important; } 
        #google_translate_element { display: none !important; } 
      `;
      document.head.appendChild(style);
    }

    // Init callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages,
            autoDisplay: false
          },
          'google_translate_element'
        );
        setReady(true);
      }
    };

    // Load script
    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else {
      // If already loaded (e.g. navigation), try init immediately
      if (window.google?.translate) window.googleTranslateElementInit();
    }
  }, [includedLanguages]);

  // 2. Apply Language Change
  useEffect(() => {
    if (!ready) return;
    const maxTries = 120;
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      const ok = setGoogleLang(lang);
      if (ok || tries >= maxTries) clearInterval(timer);
    }, 200);

    return () => clearInterval(timer);
  }, [ready, lang]);

  // 3. Handle Click Outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setLang(code);
    localStorage.setItem('gt_lang', code);
    setGoogleLang(code);
    setIsOpen(false);
  };

  // Get current language details or fallback
  const currentLang = LANGS.find(l => l.code === lang) || LANGS[0];

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Hidden Widget Mount */}
      <div id="google_translate_element" className="absolute h-0 w-0 overflow-hidden" />

      {/* Trigger Button */}
      <button
        onClick={() => ready && setIsOpen(!isOpen)}
        disabled={!ready}
        className={`
          flex h-10 w-[160px] items-center justify-between rounded-md border bg-white px-3 py-2 text-sm font-medium shadow-sm transition-all 
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50
          dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'}
        `}
        aria-label="Select Language"
      >
        <span className="flex items-center gap-2 truncate">
          {/* Show spinner if loading script, else show flag/globe */}
          {!ready ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <span className="text-base">{currentLang.flag}</span>
          )}
          <span className="truncate">
            {ready ? currentLang.label : 'Loading...'}
          </span>
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 max-h-[300px] w-[180px] overflow-y-auto rounded-md border border-gray-200 bg-white p-1 shadow-lg animate-in fade-in zoom-in-95 dark:border-gray-700 dark:bg-gray-900">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`
                relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors
                hover:bg-gray-100 dark:hover:bg-gray-800
                ${lang === l.code ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}
              `}
            >
              <span className="text-lg leading-none">{l.flag}</span>
              <span className="flex-1 text-left truncate">{l.label}</span>
              {lang === l.code && (
                <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}