import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

import { useAuth } from '@/contexts/AuthContext';

import { Loader2 } from 'lucide-react';

export function PublicLanguageSelector() {
    const { isAuthenticated, updateProfile } = useAuth();
    const [currentLang, setCurrentLang] = useState('en');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Read initial language from cookie
        const match = document.cookie.match(/(^| )googtrans=([^;]+)/);
        if (match) {
            const parts = match[2].split('/');
            const code = parts[parts.length - 1];
            if (code) setCurrentLang(code);
        }
    }, []);

    const handleLanguageChange = async (code: string) => {
        setIsLoading(true);
        const targetLang = code === 'en' ? 'en' : code;

        // Always set the cookie first
        document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=/en/${targetLang}; path=/;`;

        if (isAuthenticated) {
            try {
                await updateProfile({ preferred_language: code });
            } catch (err) {
                console.error('Failed to update language preference:', err);
            } finally {
                // Only reload after DB update attempt
                window.location.reload();
            }
        } else {
            // Not authenticated: reload immediately
            window.location.reload();
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="hidden sm:inline">Updating...</span>
                        </>
                    ) : (
                        <>
                            <Globe className="h-4 w-4" />
                            <span>
                                {SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.native || 'English'}
                            </span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="flex items-center justify-between"
                    >
                        <span>{lang.native}</span>
                        {currentLang === lang.code && <span className="text-xs text-primary font-bold">✓</span>}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
