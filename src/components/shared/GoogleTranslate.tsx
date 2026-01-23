import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

export function GoogleTranslate() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Function to check if Google Translate script is loaded
        const checkGoogleTranslate = () => {
            if (window.google && window.google.translate) {
                // Initialize if not already done
                if (!document.querySelector('.goog-te-combo')) {
                    new window.google.translate.TranslateElement(
                        {
                            pageLanguage: 'en',
                            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                            autoDisplay: false,
                        },
                        'google_translate_element'
                    );
                }
            }
        };

        // Check periodically
        const intervalId = setInterval(checkGoogleTranslate, 1000);

        // Initial check
        checkGoogleTranslate();

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="relative flex items-center">
            <div id="google_translate_element" className={`${isOpen ? 'block' : 'hidden'} absolute top-10 right-0 z-50 bg-white p-2 rounded shadow-lg border border-gray-200 min-w-[200px]`} />

            <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Language</span>
            </Button>
        </div>
    );
}
