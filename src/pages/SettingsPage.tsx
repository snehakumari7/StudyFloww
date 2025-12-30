import { useState, useEffect, useRef } from 'react';
import { WebLayout } from '@/components/layout/WebLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Timer, LogOut, Save, Loader2, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AVATAR_PRESETS = [
  { id: 'pastel-bear', name: 'Bear', path: '/pastel-bear.png' },
  { id: 'pastel-rabbit', name: 'Rabbit', path: '/pastel-rabbit.png' },
  { id: 'pastel-panda', name: 'Panda', path: '/pastel-panda.png' },
  { id: 'pastel-chick', name: 'Chick', path: '/pastel-chick.png' },
  { id: 'pastel-cat', name: 'Cat', path: '/pastel-cat.png' },
  { id: 'pastel-dog', name: 'Dog', path: '/pastel-dog.png' },
  { id: 'pastel-koala', name: 'Koala', path: '/pastel-koala.png' },
  { id: 'pastel-hamster', name: 'Hamster', path: '/pastel-hamster.png' },
];

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { timerSettings, profileSettings, updateTimerSettings, updateProfileSettings, loading: settingsLoading } = useSettings();
  const [saving, setSaving] = useState(false);
  const [localTimerSettings, setLocalTimerSettings] = useState(timerSettings);
  const [localProfile, setLocalProfile] = useState(profileSettings);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    setLocalTimerSettings(timerSettings);
  }, [timerSettings]);

  useEffect(() => {
    setLocalProfile(profileSettings);
  }, [profileSettings]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await Promise.all([
        updateTimerSettings(localTimerSettings),
        updateProfileSettings({
          full_name: localProfile.full_name,
          avatar_url: localProfile.avatar_url,
          avatar_type: localProfile.avatar_type,
        }),
      ]);

      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully.',
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.data?.message || error.message || 'Failed to save settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (avatarId: string) => {
    const avatar = AVATAR_PRESETS.find(p => p.id === avatarId);
    if (avatar) {
      // Optimistic UI
      setLocalProfile(prev => ({
        ...prev,
        avatar_url: avatar.path,
        avatar_type: 'panda',
      }));

      try {
        await updateProfileSettings({
          avatar_url: avatar.path,
          avatar_type: 'panda', // Using 'panda' type for consistency or maybe switch to 'custom' if 'panda' implies old stickers? 
          // Actually, let's keep 'panda' as 'preset' to avoid DB constraint issues if any, although valid types are typically unchecked text unless enum.
        });
      } catch (e) {
        // Revert on failure
        setLocalProfile(profileSettings);
      }
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    // File size check (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image under 2MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfileSettings({
        avatar_url: data.publicUrl,
        avatar_type: 'custom',
      });

      setLocalProfile(prev => ({
        ...prev,
        avatar_url: data.publicUrl,
        avatar_type: 'custom',
      }));

      toast({
        title: 'Avatar Updated',
        description: 'Your avatar has been uploaded successfully.',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (settingsLoading) {
    return (
      <WebLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </WebLayout>
    );
  }

  return (
    <WebLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Selection */}
              <div className="space-y-3">
                <Label>Avatar</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-2 border-border">
                    <AvatarImage src={localProfile.avatar_url || undefined} alt="Avatar" />
                    <AvatarFallback className="text-2xl">
                      {localProfile.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingAvatar ? 'Uploading...' : 'Upload Custom'}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      {localProfile.avatar_type === 'custom' && localProfile.avatar_url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await updateProfileSettings({
                              avatar_url: AVATAR_PRESETS[0].path,
                              avatar_type: 'panda',
                            });
                            setLocalProfile(prev => ({
                              ...prev,
                              avatar_url: AVATAR_PRESETS[0].path,
                              avatar_type: 'panda',
                            }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Choose a cute avatar or upload your own</p>
                  </div>
                </div>

                {/* Avatar Presets Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-8 gap-3 mt-4 p-4 bg-muted/30 rounded-xl overflow-y-auto max-h-[300px]">
                  {AVATAR_PRESETS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleAvatarSelect(avatar.id)}
                      className={`
                        relative aspect-square rounded-xl border-2 transition-all hover:scale-105
                        ${localProfile.avatar_url === avatar.path
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                          : 'border-transparent hover:border-primary/20 hover:bg-background/50'
                        }
                      `}
                      title={avatar.name}
                    >
                      <img
                        src={avatar.path}
                        alt={avatar.name}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={localProfile.full_name || ''}
                  onChange={(e) => setLocalProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Your name"
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="flex gap-6 pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">Total Study Time</p>
                  <p className="text-lg font-semibold">{Math.floor(profileSettings.total_study_minutes / 60)}h {profileSettings.total_study_minutes % 60}m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-lg font-semibold">{profileSettings.streak_days} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timer Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Timer Settings
              </CardTitle>
              <CardDescription>Customize your focus and break durations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="focusDuration">Focus Duration (min)</Label>
                  <Input
                    id="focusDuration"
                    type="number"
                    min={1}
                    max={120}
                    value={localTimerSettings.focus_duration}
                    onChange={(e) => setLocalTimerSettings(prev => ({
                      ...prev,
                      focus_duration: parseInt(e.target.value) || 25
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortBreak">Short Break (min)</Label>
                  <Input
                    id="shortBreak"
                    type="number"
                    min={1}
                    max={30}
                    value={localTimerSettings.short_break}
                    onChange={(e) => setLocalTimerSettings(prev => ({
                      ...prev,
                      short_break: parseInt(e.target.value) || 5
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreak">Long Break (min)</Label>
                  <Input
                    id="longBreak"
                    type="number"
                    min={1}
                    max={60}
                    value={localTimerSettings.long_break}
                    onChange={(e) => setLocalTimerSettings(prev => ({
                      ...prev,
                      long_break: parseInt(e.target.value) || 15
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionsBeforeLong">Sessions Before Long Break</Label>
                <Input
                  id="sessionsBeforeLong"
                  type="number"
                  min={1}
                  max={10}
                  value={localTimerSettings.sessions_before_long_break}
                  onChange={(e) => setLocalTimerSettings(prev => ({
                    ...prev,
                    sessions_before_long_break: parseInt(e.target.value) || 4
                  }))}
                  className="max-w-[120px]"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-start Breaks</Label>
                    <p className="text-sm text-muted-foreground">Automatically start break when focus ends</p>
                  </div>
                  <Switch
                    checked={localTimerSettings.auto_start_breaks}
                    onCheckedChange={(checked) => setLocalTimerSettings(prev => ({ ...prev, auto_start_breaks: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-start Focus Sessions</Label>
                    <p className="text-sm text-muted-foreground">Automatically start focus when break ends</p>
                  </div>
                  <Switch
                    checked={localTimerSettings.auto_start_pomodoros}
                    onCheckedChange={(checked) => setLocalTimerSettings(prev => ({ ...prev, auto_start_pomodoros: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will sign you out of your account. You will need to sign in again to access your data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut} className="bg-red-500 hover:bg-red-600">
                    Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 gradient-primary text-white border-0"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </WebLayout>
  );
}
