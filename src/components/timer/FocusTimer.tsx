import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { useTimer } from '@/context/TimerContext';
import { useSessions } from '@/context/SessionContext';
import { useState, useEffect } from 'react';

interface FocusTimerProps {
  onSessionComplete?: (duration: number) => void;
  initialFocusDuration?: number;
  initialBreakDuration?: number;
}

export function FocusTimer({
  onSessionComplete, // Note: Global context handles session completion logic now, but we can keep this for UI feedback/toast
  initialFocusDuration = 25,
  initialBreakDuration = 5
}: FocusTimerProps) {
  const { timerSettings, updateTimerSettings } = useSettings();
  const {
    mode,
    setMode,
    timeLeft,
    isActive,
    toggleTimer,
    resetTimer,
    progress
  } = useTimer();
  const { sessions } = useSessions();

  // Local state only for settings dialog
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempFocus, setTempFocus] = useState(timerSettings.focus_duration || initialFocusDuration);
  const [tempBreak, setTempBreak] = useState(timerSettings.short_break || initialBreakDuration);

  // Sync temp settings when global settings change
  useEffect(() => {
    setTempFocus(timerSettings.focus_duration || initialFocusDuration);
    setTempBreak(timerSettings.short_break || initialBreakDuration);
  }, [timerSettings, initialFocusDuration, initialBreakDuration]);

  const handleSaveSettings = async () => {
    await updateTimerSettings({
      focus_duration: tempFocus,
      short_break: tempBreak,
    });
    // Context will pick up the change and update timeLeft if not active
    setSettingsOpen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Only trigger the provided callback for UI feedback if needed, 
  // though the real logic is in TimerContext -> AddSession
  // We can't easily hook into "onComplete" here since it happens in context. 
  // App-level toasts might be better placed in context or just rely on the streak modal.

  // Count sessions from context
  const totalSessions = sessions.reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4 min-h-[400px] flex flex-col">
      {/* Mode tabs */}
      <div className="flex justify-center gap-2 mb-3">
        <button
          onClick={() => setMode('focus')}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
            mode === 'focus'
              ? "bg-yellow-400 text-white shadow-lg"
              : "bg-black text-white hover:bg-black/80"
          )}
        >
          Work
        </button>
        <button
          onClick={() => setMode('break')}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
            mode === 'break'
              ? "bg-yellow-400 text-black shadow-lg"
              : "bg-black text-white hover:bg-black/80"
          )}
        >
          Break
        </button>
      </div>

      {/* Timer display */}
      <div className="relative w-44 h-44 mx-auto mb-3 flex-1 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="42%"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="14"
          />
          <circle
            cx="50%"
            cy="50%"
            r="42%"
            fill="none"
            stroke={mode === 'focus' ? "#FFE58F" : "#FFE58F"}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42} ${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
            style={{ strokeDasharray: `${2 * Math.PI * 0.42 * 100}%` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-foreground tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            {mode === 'focus' ? 'Stay focused' : 'Take a break'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="w-10 h-10 rounded-full"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          onClick={toggleTimer}
          size="lg"
          className="w-14 h-14 rounded-full shadow-lg bg-yellow-400 text-white border-0"
        >
          {isActive ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Timer Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="focusTime">Work Duration</Label>
                  <span className="text-sm font-medium text-foreground">{tempFocus} min</span>
                </div>
                <Slider
                  id="focusTime"
                  min={5}
                  max={60}
                  step={5}
                  value={[tempFocus]}
                  onValueChange={(value) => setTempFocus(value[0])}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="breakTime">Break Duration</Label>
                  <span className="text-sm font-medium text-foreground">{tempBreak} min</span>
                </div>
                <Slider
                  id="breakTime"
                  min={1}
                  max={30}
                  step={1}
                  value={[tempBreak]}
                  onValueChange={(value) => setTempBreak(value[0])}
                />
              </div>
              <Button
                onClick={handleSaveSettings}
                className="w-full gradient-primary text-white border-0"
              >
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions count */}
      <div className="text-center mt-3">
        <span className="text-xs text-muted-foreground">
          Sessions today: <span className="font-medium text-foreground">{totalSessions}</span>
        </span>
      </div>
    </div>
  );
}
