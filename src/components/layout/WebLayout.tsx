import { ReactNode, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSessions } from '@/context/SessionContext';
import { useSettings } from '@/context/SettingsContext';
import { useTasks } from '@/context/TaskContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollToTopButton } from '../ScrollToTopButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

interface WebLayoutProps {
  children: ReactNode;
}

export function WebLayout({ children }: WebLayoutProps) {
  const { sessions } = useSessions();
  const { profileSettings } = useSettings();
  const { user } = useAuth();
  const { tasks } = useTasks();

  // Calculate weekly streak (number of days with at least 1 session)
  const weeklyStreak = sessions.filter(s => s > 0).length;

  // Get tasks due today
  const tasksDueToday = useMemo(() => {
    if (!tasks) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(task => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      deadline.setHours(0, 0, 0, 0);
      return deadline >= today && deadline < tomorrow && task.status !== 'done';
    });
  }, [tasks]);

  // Check if there are any notifications (tasks due today or upcoming features)
  const hasNotifications = tasksDueToday.length > 0 || true; // Always show upcoming features notification

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* ... (existing header) */}
        <header className="sticky top-0 z-40 h-14 border-b border-border bg-gradient-to-r from-background via-pastel-purple/5 to-pastel-yellow/5 px-8 flex items-center justify-end gap-4 backdrop-blur-sm">
          {/* ... (existing header content) */}
          {/* Streak */}
          <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">
            <span className="text-lg">🔥</span>
            <span className="font-semibold text-sm">{weeklyStreak} Day Streak</span>
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
                <Bell className="w-5 h-5" />
                {hasNotifications && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b border-border">
                <h4 className="font-medium">Notifications</h4>
              </div>
              <div className="p-2 max-h-[400px] overflow-y-auto">
                {/* Tasks Due Today */}
                {tasksDueToday.length > 0 ? (
                  tasksDueToday.map((task) => (
                    <div key={task.id} className="p-3 hover:bg-muted/50 rounded-md cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Task Due Today</p>
                          <p className="text-xs text-muted-foreground">"{task.title}" is due today</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    No tasks due today
                  </div>
                )}

                {/* Upcoming Exciting Features */}
                <div className="p-3 hover:bg-muted/50 rounded-md cursor-pointer transition-colors border-t border-border mt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Upcoming Exciting Features</p>
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                      </div>
                      <p className="text-xs text-muted-foreground">New collaboration tools and AI enhancements coming soon! 🚀</p>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Profile - Clickable to Settings */}
          <Link to="/settings">
            <Avatar className="w-8 h-8 border-2 border-border cursor-pointer hover:border-primary/50 transition-colors">
              <AvatarImage src={profileSettings.avatar_url || undefined} alt="Avatar" />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {profileSettings.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </header>
        <div className="flex-1">
          {children}
        </div>
      </main>
      <ScrollToTopButton />
    </div>
  );
}
