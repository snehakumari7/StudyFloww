interface WeeklyStreakProps {
    focusSessions: number[]; // Array of 7 numbers representing daily focus sessions (Mon-Sun)
}

export function WeeklyStreak({ focusSessions }: WeeklyStreakProps) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getPandaImage = (sessions: number) => {
        // Cap at 7+ for display
        const displaySessions = Math.min(sessions, 7);

        if (displaySessions === 0) return { src: '/panda-0.png', label: 'Rest' };
        if (displaySessions === 1) return { src: '/panda-1.png', label: 'Getting Started' };
        if (displaySessions === 2) return { src: '/panda-2.png', label: 'Building Up' };
        if (displaySessions === 3) return { src: '/panda-3.png', label: 'Good Progress' };
        if (displaySessions === 4) return { src: '/panda-4.png', label: 'Great Work' };
        if (displaySessions === 5) return { src: '/panda-5.png', label: 'Excellent!' };
        if (displaySessions === 6) return { src: '/panda-6.png', label: 'On Fire!' };
        return { src: '/panda-7.png', label: 'Unstoppable!' };
    };

    const totalSessions = focusSessions.reduce((sum, s) => sum + s, 0);
    const currentStreak = focusSessions.filter(s => s > 0).length;

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-foreground">Weekly Streak</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        {currentStreak} days active • {totalSessions} focus sessions
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{currentStreak}</div>
                    <div className="text-xs text-muted-foreground">day streak</div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                    const sessions = focusSessions[index];
                    const panda = getPandaImage(sessions);

                    return (
                        <div
                            key={day}
                            className="flex flex-col items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="text-xs font-medium text-muted-foreground">{day}</div>
                            <div className="w-12 h-12 flex items-center justify-center">
                                <img
                                    src={panda.src}
                                    alt={panda.label}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="text-[10px] text-muted-foreground">{sessions}x</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
