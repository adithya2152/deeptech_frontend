import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SUPPORTED_LANGUAGES, getLanguageByCode, normalizeLanguageCode } from '@/lib/languages';

export default function LanguageSwitcher() {
    const { user, updateProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const applyGoogleTranslate = (lang: string) => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (!select) return;

        select.value = lang;
        select.dispatchEvent(new Event('change'));
    };
    const changeLanguage = async (lng: string) => {
        try {
            await updateProfile({ settings: { ...user?.settings, language: lng } });
        } catch (e) {
            console.error(e);
        }

        localStorage.setItem('gt_lang', lng); // 🔑 add this
        applyGoogleTranslate(lng);

        setTimeout(() => {
            window.location.reload();
        }, 300);

        setIsOpen(false);
    };

    const currentLangCode = normalizeLanguageCode(user?.settings?.language || 'en');
    const currentLang = getLanguageByCode(currentLangCode);

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex h-9 items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium shadow-sm transition-all 
          hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring
          ${isOpen ? 'ring-2 ring-ring border-primary' : 'border-input'}
        `}
                aria-label="Select Language"
            >
                <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="hidden sm:inline-block">{currentLang.native}</span>
                    <span className="sm:hidden">{currentLang.code.toUpperCase()}</span>
                </div>
                <ChevronDown
                    className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
                    <div className="max-h-[300px] overflow-y-auto">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`
                  relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors
                  hover:bg-accent hover:text-accent-foreground
                  ${currentLangCode === lang.code ? 'bg-accent text-accent-foreground' : ''}
                `}
                            >
                                <div className="flex flex-1 flex-col items-start">
                                    <span className="font-medium">{lang.native}</span>
                                    <span className="text-xs text-muted-foreground">{lang.label}</span>
                                </div>
                                {currentLangCode === lang.code && (
                                    <Check className="ml-2 h-4 w-4 text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
