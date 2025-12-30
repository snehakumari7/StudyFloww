import { WebLayout } from '@/components/layout/WebLayout';
import { FocusTimer } from '@/components/timer/FocusTimer';
import { toast } from 'sonner';

export default function TimerPage() {
  const handleSessionComplete = (duration: number) => {
    toast.success(`Great work! You completed a ${duration / 60} minute focus session.`);
  };

  return (
    <WebLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-foreground">Focus Timer</h1>
          <p className="text-muted-foreground mt-1">
            Use the Pomodoro technique to stay focused and productive
          </p>
        </div>

        {/* Timer */}
        <FocusTimer onSessionComplete={handleSessionComplete} />

        {/* Tips */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: '25 min focus',
              description: 'Work on a single task without distractions',
            },
            {
              title: '5 min break',
              description: 'Rest your mind before the next session',
            },
            {
              title: 'Track progress',
              description: 'Build your streak with consistent sessions',
            },
          ].map((tip, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-1">{tip.title}</h3>
              <p className="text-sm text-muted-foreground">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </WebLayout>
  );
}
