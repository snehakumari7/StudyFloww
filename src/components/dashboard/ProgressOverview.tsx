import { Task } from '@/types';
import { CheckCircle2, Circle, Clock, TrendingUp } from 'lucide-react';

interface ProgressOverviewProps {
  tasks: Task[];
  totalStudyMinutes: number;
}

export function ProgressOverview({ tasks, totalStudyMinutes }: ProgressOverviewProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: Circle,
      color: 'text-muted-foreground',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-success',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: TrendingUp,
      color: 'text-primary',
    },
    {
      label: 'Study Time',
      value: `${Math.round(totalStudyMinutes / 60)}h`,
      icon: Clock,
      color: 'text-warning',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6 min-h-[400px] flex flex-col">
      <h3 className="font-semibold text-foreground mb-4">Progress Overview</h3>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium text-foreground">{Math.round(overallProgress)}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-3 rounded-lg bg-surface-hover/50">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-2xl font-semibold text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
