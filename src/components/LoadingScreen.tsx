import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
    onFinished: () => void;
}

export function LoadingScreen({ onFinished }: LoadingScreenProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onFinished, 500); // Wait for fade out animation
        }, 3000);

        return () => clearTimeout(timer);
    }, [onFinished]);

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-opacity duration-500",
                !isVisible && "opacity-0 pointer-events-none"
            )}
        >
            <div className="relative w-full max-w-5xl mx-auto px-4 h-screen flex flex-col justify-center">
                {/* Header */}
                <div className="absolute top-8 left-8 flex items-center gap-3">
                    <img src="/logo.png" alt="StudyFlow" className="h-10 w-10 object-cover" />
                    <h1 className="text-2xl font-bold tracking-tight">StudyFlow</h1>
                </div>

                {/* Main Content */}
                <div className="relative z-10 text-center space-y-4">
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-6xl md:text-8xl font-bold tracking-tighter leading-tight">
                        <span>Set goals</span>
                        <div className="relative inline-block rotate-12 mx-2">
                            <span className="relative z-10 font-handwriting text-4xl text-foreground">Plan</span>
                            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-pastel-purple -z-10" viewBox="0 0 100 100" fill="currentColor">
                                <path d="M45.6,15.4c-2.3-4.5-8.9-4.5-11.2,0l-3.6,7.1c-1.1,2.2-3.4,3.5-5.8,3.5l-7.9,0.1c-5,0.1-7.1,6.3-3.4,9.8l5.8,5.5c1.7,1.6,2.5,4,2,6.3l-1.5,7.8c-1,4.9,4.3,8.8,8.7,6.4l7-3.8c2.1-1.1,4.6-1.1,6.7,0l7,3.8c4.4,2.4,9.7-1.5,8.7-6.4l-1.5-7.8c-0.4-2.3,0.3-4.7,2-6.3l5.8-5.5c3.7-3.5,1.6-9.7-3.4-9.8l-7.9-0.1c-2.4,0-4.7-1.3-5.8-3.5L45.6,15.4z" />
                            </svg>
                        </div>
                        <span>Stay on</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-6xl md:text-8xl font-bold tracking-tighter leading-tight">
                        <span>track</span>
                        <div className="relative inline-block -rotate-6 mx-2">
                            <span className="relative z-10 font-handwriting text-4xl text-foreground">Step</span>
                            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-pastel-purple/50 -z-10" viewBox="0 0 100 100" fill="currentColor">
                                <circle cx="50" cy="50" r="45" />
                            </svg>
                        </div>
                        <span>Let time be your</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-6xl md:text-8xl font-bold tracking-tighter leading-tight">
                        <span>teammate</span>
                        <div className="relative inline-block rotate-6 mx-2">
                            <span className="relative z-10 font-handwriting text-4xl text-foreground">Done</span>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-16 bg-pastel-yellow -z-10 rounded-sm rotate-3 border-2 border-foreground/10" />
                        </div>
                    </div>
                </div>

                {/* Illustrations */}
                <div className="absolute bottom-20 left-10 md:left-20 w-48 md:w-64 animate-float">
                    <img src="/chick.png" alt="Chick" className="w-full h-auto object-contain" />
                </div>

                <div className="absolute bottom-20 right-10 md:right-20 w-48 md:w-64 animate-float [animation-delay:2s]">
                    <img src="/penguin.png" alt="Penguin" className="w-full h-auto object-contain" />
                </div>

                {/* Loading Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 bg-foreground rounded-full animate-bounce delay-0" />
                        <div className="w-3 h-3 bg-foreground rounded-full animate-bounce delay-150" />
                        <div className="w-3 h-3 bg-foreground rounded-full animate-bounce delay-300" />
                    </div>
                </div>
            </div>
        </div>
    );
}
