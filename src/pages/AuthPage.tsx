import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Check for stored redirect destination
        const redirectTo = localStorage.getItem('redirectAfterAuth');
        if (redirectTo) {
          localStorage.removeItem('redirectAfterAuth');
          navigate(redirectTo);
        } else {
          navigate('/');
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Check for stored redirect destination
        const redirectTo = localStorage.getItem('redirectAfterAuth');
        if (redirectTo) {
          localStorage.removeItem('redirectAfterAuth');
          navigate(redirectTo);
        } else {
          navigate('/');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Login Failed',
              description: 'Invalid email or password. Please try again.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully signed in.',
          });
        }
      } else {
        const redirectUrl = `${window.location.origin}/`;

        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: 'Account Exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive',
            });
            setIsLogin(true);
          } else {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          // Manually create profile and timer settings if user was created
          if (signUpData.user) {
            try {
              // Create profile
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                  user_id: signUpData.user.id,
                  full_name: fullName,
                }, {
                  onConflict: 'user_id'
                });

              if (profileError) {
                console.error('Error creating profile:', profileError);
              }

              // Create timer settings
              const { error: timerError } = await supabase
                .from('timer_settings')
                .upsert({
                  user_id: signUpData.user.id,
                }, {
                  onConflict: 'user_id'
                });

              if (timerError) {
                console.error('Error creating timer settings:', timerError);
              }
            } catch (err) {
              console.error('Error setting up user:', err);
            }
          }

          toast({
            title: 'Account Created!',
            description: signUpData.user ? 'Welcome to StudyFlow. You are now signed in.' : 'Please check your email to confirm your account.',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left Side - Decorative with Panda */}
      <div className="hidden lg:flex lg:w-2/5 relative bg-gradient-to-br from-pastel-purple/20 via-pastel-yellow/10 to-background overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[400px] h-[400px] bg-pastel-purple/10 rounded-full -top-20 -left-20 animate-pulse-slow" />
          <div className="absolute w-[300px] h-[300px] bg-pastel-yellow/10 rounded-full bottom-0 right-0 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center px-12 h-full">
          {/* Quote */}
          <div className="text-center mb-12 fade-in">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              Your Second Brain for Productivity !
            </h2>
            <p className="text-lg text-muted-foreground font-sans">
              {isLogin
                ? 'Welcome back to your organized workspace'
                : 'Start organizing your tasks and boost your productivity'}
            </p>
          </div>

          {/* Animated Panda */}
          <div className="relative w-full max-w-md h-64 flex items-center justify-center">
            <div className="w-48 md:w-56 animate-float">
              <img
                src="/panda-writing.png"
                alt="Panda writing"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>

        {/* Back link on left side */}
        <div className="absolute top-6 left-6 z-20">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col lg:w-3/5">
        {/* Back link for mobile */}
        <div className="lg:hidden p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>

        {/* Auth form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md fade-in">
            <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-lg">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-muted-foreground">
                  {isLogin
                    ? 'Sign in to continue your learning journey with AI-powered productivity'
                    : 'Start your productivity journey today with AI-powered task management'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-11 h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary"
                      />
                    </div>
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl gradient-primary text-white border-0 text-base font-medium hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </form>

              {/* Switch mode */}
              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-1 text-primary hover:underline font-medium"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
