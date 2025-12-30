import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  CheckSquare, 
  Clock, 
  Layout, 
  Users, 
  Zap 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-foreground selection:text-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground text-background rounded-md flex items-center justify-center font-bold text-lg">
              S
            </div>
            <span className="font-bold text-xl tracking-tight">StudyFlow</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="notion-button-ghost">
                Log in
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="notion-button">
                Get StudyFlow free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="fade-in">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
              Your second brain for <br />
              <span className="text-muted-foreground">academic success.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Manage tasks, track focus, and collaborate with peers. 
              All in one minimalist workspace designed for deep work.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="h-12 px-8 text-lg notion-button">
                  Start for free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-border hover:bg-accent hover:text-accent-foreground">
                  View demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual - Abstract Representation of the App */}
          <div className="relative fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="rounded-xl border border-border shadow-2xl bg-card overflow-hidden max-w-4xl mx-auto aspect-[16/10] flex flex-col">
              {/* Fake Browser Header */}
              <div className="h-10 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                </div>
                <div className="ml-4 h-6 w-64 bg-background rounded-md border border-border/50" />
              </div>
              
              {/* App Content Placeholder */}
              <div className="flex-1 flex bg-background">
                {/* Sidebar */}
                <div className="w-48 border-r border-border bg-muted/10 p-4 hidden md:block">
                  <div className="space-y-4">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-muted/50 rounded" />
                      <div className="h-3 w-3/4 bg-muted/50 rounded" />
                      <div className="h-3 w-5/6 bg-muted/50 rounded" />
                    </div>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="flex-1 p-8">
                  <div className="h-8 w-48 bg-foreground/10 rounded mb-8" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Kanban Column 1 */}
                    <div className="space-y-3">
                      <div className="h-4 w-20 bg-muted rounded mb-2" />
                      <div className="p-3 border border-border rounded-lg bg-card shadow-sm">
                        <div className="h-3 w-3/4 bg-muted rounded mb-2" />
                        <div className="h-2 w-1/2 bg-muted/50 rounded" />
                      </div>
                      <div className="p-3 border border-border rounded-lg bg-card shadow-sm">
                        <div className="h-3 w-full bg-muted rounded mb-2" />
                        <div className="h-2 w-1/3 bg-muted/50 rounded" />
                      </div>
                    </div>
                    
                    {/* Kanban Column 2 */}
                    <div className="space-y-3">
                      <div className="h-4 w-20 bg-muted rounded mb-2" />
                      <div className="p-3 border border-border rounded-lg bg-card shadow-sm">
                        <div className="h-3 w-5/6 bg-muted rounded mb-2" />
                        <div className="h-2 w-1/2 bg-muted/50 rounded" />
                      </div>
                    </div>
                    
                    {/* Kanban Column 3 */}
                    <div className="space-y-3">
                      <div className="h-4 w-20 bg-muted rounded mb-2" />
                      <div className="p-3 border border-border rounded-lg bg-card shadow-sm opacity-60">
                         <div className="h-3 w-2/3 bg-muted rounded mb-2" />
                         <div className="h-2 w-1/4 bg-muted/50 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-muted/30 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to focus</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple, powerful tools that adapt to your workflow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Layout className="w-6 h-6" />}
              title="Kanban Boards"
              description="Visualize your tasks and progress with flexible boards."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="AI Breakdown"
              description="Let AI break down complex assignments into manageable steps."
            />
            <FeatureCard 
              icon={<Clock className="w-6 h-6" />}
              title="Focus Timer"
              description="Built-in Pomodoro timer to help you stay in the flow."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6" />}
              title="Study Rooms"
              description="Join virtual rooms to study alongside peers for accountability."
            />
            <FeatureCard 
              icon={<CheckSquare className="w-6 h-6" />}
              title="Task Tracking"
              description="Keep track of deadlines and assignments in one place."
            />
            <FeatureCard 
              icon={<div className="font-bold text-xl">Aa</div>}
              title="Minimalist Design"
              description="Distraction-free interface inspired by the tools you love."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-border">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to get to work?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join students who are mastering their workflow with StudyFlow.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="h-12 px-8 text-lg notion-button">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-muted/10">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-foreground text-background rounded-sm flex items-center justify-center font-bold text-xs">
              S
            </div>
            <span className="font-semibold">StudyFlow</span>
          </div>
          
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2024 StudyFlow Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200">
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 text-foreground">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
