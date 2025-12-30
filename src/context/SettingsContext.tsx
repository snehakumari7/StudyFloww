import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TimerSettings, ProfileSettings } from '@/types'; // Use centralized types

const defaultTimerSettings: TimerSettings = {
  focus_duration: 25,
  short_break: 5,
  long_break: 15,
  sessions_before_long_break: 4,
  auto_start_breaks: false,
  auto_start_pomodoros: false,
};

const defaultProfileSettings: ProfileSettings = {
  full_name: null,
  avatar_url: null,
  avatar_type: null,
  total_study_minutes: 0,
  streak_days: 0,
};

interface SettingsContextType {
  timerSettings: TimerSettings;
  profileSettings: ProfileSettings;
  updateTimerSettings: (settings: Partial<TimerSettings>) => Promise<void>;
  updateProfileSettings: (settings: Partial<ProfileSettings>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(defaultTimerSettings);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(defaultProfileSettings);
  const [loading, setLoading] = useState(true);

  // Track if mount is active to prevent state updates on unmount
  useEffect(() => {
    let mounted = true;

    const initSettings = async () => {
      if (authLoading) return; // Wait for auth check

      if (!user) {
        if (mounted) {
          setLoading(false);
          // Try load from local storage for demo mode
          const saved = localStorage.getItem('timerSettings');
          if (saved) {
            try {
              setTimerSettings(JSON.parse(saved));
            } catch (e) { console.error("Failed to parse local settings", e); }
          }
        }
        return;
      }

      try {
        const fetchPromise = Promise.all([
          supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('timer_settings').select('*').eq('user_id', user.id).maybeSingle(),
        ]);

        // Timeout after 30 seconds
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 30000)
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [profileRes, timerRes] = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (!mounted) return;

        if (profileRes.error) throw profileRes.error;
        if (timerRes.error) throw timerRes.error;

        if (profileRes.data) {
          setProfileSettings({
            full_name: profileRes.data.full_name || null,
            avatar_url: profileRes.data.avatar_url || null,
            avatar_type: profileRes.data.avatar_type || null,
            total_study_minutes: profileRes.data.total_study_minutes || 0,
            streak_days: profileRes.data.streak_days || 0,
          });
        } else {
          // Initialize profile if missing
          const { error } = await supabase.from('profiles').insert({
            user_id: user.id,
            full_name: user.email?.split('@')[0] || 'User',
            ...defaultProfileSettings
          });
          if (error) console.error("Failed to init profile", error);
        }

        if (timerRes.data) {
          setTimerSettings({
            focus_duration: timerRes.data.focus_duration,
            short_break: timerRes.data.short_break,
            long_break: timerRes.data.long_break,
            sessions_before_long_break: timerRes.data.sessions_before_long_break,
            auto_start_breaks: timerRes.data.auto_start_breaks,
            auto_start_pomodoros: timerRes.data.auto_start_pomodoros,
          });
        } else {
          // Initialize defaults for new user
          const { error } = await supabase.from('timer_settings').insert({
            user_id: user.id,
            ...defaultTimerSettings
          });
          if (error) console.error("Failed to init settings", error);
        }

      } catch (error: any) {
        console.error('Error fetching settings:', error);
        if (mounted) {
          toast({
            title: error.message === 'Request timed out' ? "Network Timeout" : "Error loading settings",
            description: "Using default values. Your changes may not save.",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSettings();

    return () => {
      mounted = false;
    };
  }, [user, authLoading, toast]);

  // Persist demo settings
  useEffect(() => {
    if (!user) {
      localStorage.setItem('timerSettings', JSON.stringify(timerSettings));
    }
  }, [timerSettings, user]);

  const updateTimerSettings = async (settings: Partial<TimerSettings>) => {
    const newSettings = { ...timerSettings, ...settings };
    setTimerSettings(newSettings);

    if (user) {
      try {
        const { error } = await supabase
          .from('timer_settings')
          .upsert(
            {
              user_id: user.id,
              ...newSettings,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id' }
          );

        if (error) throw error;
      } catch (error) {
        console.error('Error saving timer settings:', error);
        toast({
          title: 'Sync Failed',
          description: 'Could not save settings to the cloud.',
          variant: 'destructive',
        });
      }
    }
  };

  const updateProfileSettings = async (settings: Partial<ProfileSettings>) => {
    const newSettings = { ...profileSettings, ...settings };
    setProfileSettings(newSettings);

    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert(
            {
              user_id: user.id,
              ...settings,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
        if (error) throw error;
      } catch (error) {
        console.error('Error saving profile settings:', error);
        toast({
          title: 'Sync Failed',
          description: 'Could not update profile. Try refreshing.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        timerSettings,
        profileSettings,
        updateTimerSettings,
        updateProfileSettings,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

