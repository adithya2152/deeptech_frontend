import { Play } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';


interface VideoPlayerProps {
    url: string;
    className?: string;
    onError?: () => void;
}

export function VideoPlayer({ url, className = "", onError }: VideoPlayerProps) {
    const [error, setError] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const getEmbedUrl = (url: string) => {
        try {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
            }
            if (url.includes('vimeo.com')) {
                const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
                return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
            }
            if (url.includes('loom.com')) {
                const videoId = url.match(/share\/([a-f0-9]+)/)?.[1];
                return videoId ? `https://www.loom.com/embed/${videoId}` : null;
            }
            return null;
        } catch {
            return null;
        }
    };

    const embedUrl = getEmbedUrl(url);
    
    useEffect(() => {
        setError(false)
    }, [url])

    useEffect(() => {
        if (!embedUrl) return;

        timeoutRef.current = setTimeout(() => {
            setError(true)
            onError?.()
        }, 3000)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
        }
    }, [embedUrl])


    if (error) {
        return (
            <div className={`w-full aspect-video bg-zinc-100 flex items-center justify-center rounded-lg border border-zinc-200 ${className}`}>
                <div className="text-center p-4">
                    <p className="text-sm text-zinc-500 mb-2">
                        Video could not be loaded
                    </p>
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                    >
                        Open on original site
                    </a>
                </div>
            </div>
        );
    }

    if (embedUrl) {
        return (
            <div className={`w-full aspect-video rounded-lg overflow-hidden bg-black ${className}`}>
                <iframe
                    src={embedUrl}
                    title="Video player"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => {
                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current)
                            timeoutRef.current = null
                        }
                    }}
                    onError={() => {
                        setError(true)
                        onError?.()
                    }} />
            </div>
        );
    }

    return (
        <div className={`w-full aspect-video rounded-lg overflow-hidden bg-black ${className}`}>
            <video
                src={url}
                controls
                className="w-full h-full"
                onLoadedData={() => {
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current)
                        timeoutRef.current = null
                    }
                }}
                onError={() => {
                    setError(true)
                    onError?.()
                }}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}