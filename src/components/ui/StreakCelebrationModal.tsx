import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StreakCelebrationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    streakCount: number;
    message?: string;
    onConfirm: () => void;
}

export function StreakCelebrationModal({
    open,
    onOpenChange,
    streakCount,
    message = "You're on fire! Keep up the great work!",
    onConfirm
}: StreakCelebrationModalProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (open) {
            setShowConfetti(true);
            // Reset confetti after animation (approx 3s)
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        } else {
            setShowConfetti(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-center overflow-hidden">
                {/* Simple CSS Confetti Implementation */}
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {Array.from({ length: 50 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-primary rounded-full animate-confetti"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `-10px`,
                                    backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)],
                                    animationDuration: `${Math.random() * 2 + 1}s`,
                                    animationDelay: `${Math.random() * 1}s`,
                                    opacity: Math.random(),
                                }}
                            />
                        ))}
                    </div>
                )}

                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex flex-col items-center gap-2">
                        <span className="text-4xl">🔥 {streakCount}</span>
                        <span>Streak Increased!</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                    <div className="relative w-40 h-40">
                        {/* Using a cheerful panda image */}
                        <img
                            src="/pastel-panda.png"
                            alt="Excited Panda"
                            className="w-full h-full object-contain animate-bounce-slow"
                        />
                        <PartyPopper className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500 animate-pulse" />
                    </div>

                    <p className="text-center text-muted-foreground">
                        {message}
                    </p>

                    <Button
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 text-white font-bold text-lg h-12 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                    >
                        Awesome!
                    </Button>
                </div>
            </DialogContent>

            <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation-name: confetti;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
      `}</style>
        </Dialog>
    );
}
