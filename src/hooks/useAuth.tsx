import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import { StreakCelebrationModal } from '@/components/ui/StreakCelebrationModal';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [newStreakValue, setNewStreakValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Ensure profile and timer settings exist when user signs in
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        await checkAndInitializeUser(session.user);
        await checkDailyStreak(session.user);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Ensure profile exists on initial load
      if (session?.user) {
        await checkAndInitializeUser(session.user);
        // We also check daily streak on initial load in case they just refreshed
        await checkDailyStreak(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAndInitializeUser = async (currentUser: User) => {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (!profile && !profileError) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .upsert({
            user_id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || null,
            streak_days: 1,
            last_active_date: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        // Trigger celebration for new user sign up
        setNewStreakValue(1);
        setShowStreakModal(true);
      }

      // Check if timer settings exist
      const { data: timerSettings, error: timerError } = await supabase
        .from('timer_settings')
        .select('id')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (!timerSettings && !timerError) {
        // Create timer settings if they don't exist
        await supabase
          .from('timer_settings')
          .upsert({
            user_id: currentUser.id,
          }, {
            onConflict: 'user_id'
          });
      }
    } catch (error) {
      console.error('Error ensuring user profile exists:', error);
    }
  };

  const checkDailyStreak = async (currentUser: User) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('streak_days, last_active_date')
        .eq('user_id', currentUser.id)
        .single();

      if (profile) {
        const lastActive = profile.last_active_date ? new Date(profile.last_active_date).toDateString() : null;
        const today = new Date().toDateString();

        if (lastActive !== today) {
          // It's a new day!
          // Basic logic: if last active was yesterday, increment. If older, reset to 1. 
          // However, user prompt says "increase from 0 to 1" implying mostly we just encourage logging in.
          // For now, let's just strictly increment on a new day to make them happy as per prompt "increase streak".
          // We won't strictly enforce reset logic unless requested, or we can do a smart check.

          let nextStreak = (profile.streak_days || 0) + 1;

          // Optional: If we wanted to be strict about consecutive days:
          // const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
          // if (lastActive !== yesterday.toDateString() && lastActive !== null) nextStreak = 1;

          await supabase
            .from('profiles')
            .update({
              streak_days: nextStreak,
              last_active_date: new Date().toISOString()
            })
            .eq('user_id', currentUser.id);

          setNewStreakValue(nextStreak);
          setShowStreakModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking streak:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    navigate('/auth', { replace: true });
  };

  const refreshProfile = async () => {
    // Helper to refresh profile data if needed
    if (user) await checkAndInitializeUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshProfile }}>
      {children}
      <StreakCelebrationModal
        open={showStreakModal}
        onOpenChange={setShowStreakModal}
        streakCount={newStreakValue}
        message="You logged in today! Keep the momentum going!"
        onConfirm={() => {
          // Maybe play a sound sound?
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // Instead of immediate redirect, show the prompt
      setShowAuthPrompt(true);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Dialog open={showAuthPrompt} onOpenChange={(open) => {
        setShowAuthPrompt(open);
        if (!open) {
          // If they close the dialog without signing in, redirect to home or keep them blocked?
          // Redirecting to auth page if they dismiss might be safer to ensure they don't see protected content.
          // Or redirect to landing page.
          navigate('/');
        }
      }}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-primary" />
              Sign In Required
            </DialogTitle>
            <DialogDescription>
              You need to sign in to access this page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              onClick={() => {
                // Store intended destination
                localStorage.setItem('redirectAfterAuth', location.pathname);
                navigate('/auth?mode=signup');
              }}
              className="w-full h-11 gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem('redirectAfterAuth', location.pathname);
                navigate('/auth');
              }}
              variant="outline"
              className="w-full h-11 gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return <>{children}</>;
}
