import { useState } from 'react';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  CheckSquare,
  Columns3,
  Timer,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', requiresAuth: false }, // Public demo
  { icon: CheckSquare, label: 'Tasks', path: '/tasks', requiresAuth: true },
  { icon: Columns3, label: 'Task Overview', path: '/kanban', requiresAuth: true },
  { icon: Timer, label: 'Focus Timer', path: '/timer', requiresAuth: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    // Navigate is now handled in useAuth or we can do it here too, but useAuth handles it better for consistency
  };

  return (
    <aside
      className={cn(
        "h-[100dvh] sticky top-0 bg-gradient-to-b from-sidebar-background to-pastel-purple/10 border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo & Collapse */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="StudyFlow" className="w-8 h-8 object-cover" />
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground">StudyFlow</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                requiresAuth={item.requiresAuth}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
                activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <NavLink
          to="/settings"
          requiresAuth={true}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
          activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-colors",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
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
      </div>
    </aside>
  );
}
