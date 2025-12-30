import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSettings } from './SettingsContext';
import { useSessions } from './SessionContext';

interface TimerContextType {
    mode: 'focus' | 'break';
    setMode: (mode: 'focus' | 'break') => void;
    timeLeft: number;
    isActive: boolean;
    toggleTimer: () => void;
    resetTimer: () => void;
    totalSeconds: number;
    progress: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
    const { timerSettings } = useSettings();
    const { addSession } = useSessions();

    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const [isActive, setIsActive] = useState(false);

    const focusDuration = timerSettings.focus_duration || 25;
    const breakDuration = timerSettings.short_break || 5;

    const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // When settings change (and timer is not active), update timeLeft
    useEffect(() => {
        if (!isActive) {
            setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
        }
    }, [focusDuration, breakDuration, mode, isActive]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Timer finished!
            if (isActive) { // Only trigger if it was running
                if (mode === 'focus') {
                    // Session completed
                    // Add session to context (triggering streak automatically)
                    addSession(focusDuration);

                    // Optionally play a sound here?

                    // Switch to break
                    setMode('break');
                    setTimeLeft(breakDuration * 60);
                } else {
                    // Break finished
                    setMode('focus');
                    setTimeLeft(focusDuration * 60);
                }
                setIsActive(false);
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft, mode, focusDuration, breakDuration, addSession]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
    };

    const totalSeconds = mode === 'focus' ? focusDuration * 60 : breakDuration * 60;
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

    return (
        <TimerContext.Provider value={{
            mode,
            setMode: (m) => {
                setMode(m);
                setIsActive(false);
                setTimeLeft(m === 'focus' ? focusDuration * 60 : breakDuration * 60);
            },
            timeLeft,
            isActive,
            toggleTimer,
            resetTimer,
            totalSeconds,
            progress
        }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useTimer() {
    const context = useContext(TimerContext);
    if (context === undefined) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
}
