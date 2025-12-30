import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { StreakCelebrationModal } from '@/components/ui/StreakCelebrationModal';

interface SessionContextType {
    sessions: number[];
    totalMinutes: number;
    addSession: (minutes: number) => void;
    getCurrentStreak: () => number;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [sessions, setSessions] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [previousUserId, setPreviousUserId] = useState<string | null>(null);
    const [accumulatedMinutes, setAccumulatedMinutes] = useState(0); // For accumulated 1 hour check
    const [showStreakModal, setShowStreakModal] = useState(false);
    const [newStreakValue, setNewStreakValue] = useState(0);

    // Load sessions from database when user is authenticated (wait for auth to finish loading)
    useEffect(() => {
        if (!authLoading) {
            if (user) {
                // Only fetch if user changed or is new
                if (previousUserId !== user.id) {
                    fetchSessions();
                    setPreviousUserId(user.id);
                }
            } else if (previousUserId !== null) {
                // Only clear state when user actually signs out (had a user before, now null)
                setSessions([0, 0, 0, 0, 0, 0, 0]);
                setTotalMinutes(0);
                setPreviousUserId(null);
            }
        }
    }, [user, authLoading, previousUserId]);

    // Only use localStorage for non-authenticated users (demo mode)
    useEffect(() => {
        if (!user) {
            localStorage.setItem('weeklyFocusSessions', JSON.stringify(sessions));
        }
    }, [sessions, user]);

    useEffect(() => {
        if (!user) {
            localStorage.setItem('totalFocusMinutes', totalMinutes.toString());
        } else {
            // Update database when authenticated
            updateProfileStudyTime(totalMinutes);
        }
    }, [totalMinutes, user]);

    const fetchSessions = async () => {
        if (!user) return;

        try {
            // Fetch total study minutes from profile for all-time sum
            const { data: profile } = await supabase
                .from('profiles')
                .select('total_study_minutes')
                .eq('user_id', user.id)
                .single();

            if (profile) {
                setTotalMinutes(profile.total_study_minutes || 0);
            }

            // Fetch weekly sessions for streak calculation
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const { data: weeklySessions } = await supabase
                .from('study_sessions')
                .select('created_at, duration_seconds')
                .eq('user_id', user.id)
                .gte('created_at', weekAgo.toISOString());

            if (weeklySessions && weeklySessions.length > 0) {
                // Calculate sessions per day of week
                const weeklyData = [0, 0, 0, 0, 0, 0, 0];
                weeklySessions.forEach(session => {
                    const sessionDate = new Date(session.created_at);
                    const dayIndex = sessionDate.getDay() === 0 ? 6 : sessionDate.getDay() - 1;
                    // Count days with at least 2 hours (120 minutes) of study
                    if (session.duration_seconds >= 120 * 60) {
                        weeklyData[dayIndex] = (weeklyData[dayIndex] || 0) + 1;
                    }
                });
                setSessions(weeklyData);
            } else {
                setSessions([0, 0, 0, 0, 0, 0, 0]);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const updateProfileStudyTime = async (minutes: number) => {
        if (!user) return;

        try {
            // Get current total from profile and add today's minutes
            const { data: profile } = await supabase
                .from('profiles')
                .select('total_study_minutes')
                .eq('user_id', user.id)
                .single();

            const currentTotal = profile?.total_study_minutes || 0;
            // Only update if we're adding new minutes (not resetting)
            if (minutes > 0) {
                await supabase
                    .from('profiles')
                    .update({ total_study_minutes: currentTotal + minutes })
                    .eq('user_id', user.id);
            }
        } catch (error) {
            console.error('Error updating profile study time:', error);
        }
    };

    const addSession = async (minutes: number) => {
        const today = new Date().getDay();
        const dayIndex = today === 0 ? 6 : today - 1; // Convert Sunday=0 to index 6, Monday=1 to 0, etc.

        const newTotalMinutes = totalMinutes + minutes;
        setTotalMinutes(newTotalMinutes);

        // Check for 1 hour streak accumulation OR just regular session completion
        // User requested: "after each session the strak should go up automatically"
        // So we increment streak here cleanly.
        if (user) {
            await incrementStreak();
        }

        // Reset accumulation if needed, or just ignore. 
        setAccumulatedMinutes(0);

        // Save session to database if user is authenticated
        if (user) {
            try {
                await supabase
                    .from('study_sessions')
                    .insert({
                        user_id: user.id,
                        focus_minutes: Math.floor(minutes),
                        duration_seconds: minutes * 60,
                        completed_at: new Date().toISOString(),
                    });

                // Update profile total study minutes
                await updateProfileStudyTime(newTotalMinutes);
            } catch (error) {
                console.error('Error saving session to database:', error);
            }
        }

        // Increment session count for today if 2+ hours completed (legacy logic, keeping it)
        if (minutes >= 120) {
            setSessions(prev => {
                const updated = [...prev];
                updated[dayIndex] = (updated[dayIndex] || 0) + 1;
                return updated;
            });
        }
    };

    const incrementStreak = async () => {
        if (!user) return;
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('streak_days')
                .eq('user_id', user.id)
                .single();

            if (profile) {
                const nextStreak = (profile.streak_days || 0) + 1;
                await supabase
                    .from('profiles')
                    .update({ streak_days: nextStreak })
                    .eq('user_id', user.id);

                setNewStreakValue(nextStreak);
                setShowStreakModal(true);
            }
        } catch (e) {
            console.error("Error incrementing streak:", e);
        }
    }

    const getCurrentStreak = () => {
        return sessions.filter(s => s > 0).length;
    };

    return (
        <SessionContext.Provider value={{ sessions, totalMinutes, addSession, getCurrentStreak }}>
            {children}
            <StreakCelebrationModal
                open={showStreakModal}
                onOpenChange={setShowStreakModal}
                streakCount={newStreakValue}
                message="Session completed! Streak increased! 🔥"
                onConfirm={() => { }}
            />
        </SessionContext.Provider>
    );
}

export function useSessions() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSessions must be used within SessionProvider');
    }
    return context;
}
