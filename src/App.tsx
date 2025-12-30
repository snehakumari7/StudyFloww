import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth } from "@/hooks/useAuth";
import { TaskProvider } from "@/context/TaskContext";
import { SessionProvider } from "@/context/SessionContext";
import { TimerProvider } from "@/context/TimerContext";
import { SettingsProvider } from "@/context/SettingsContext";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import KanbanPage from "./pages/KanbanPage";
import TimerPage from "./pages/TimerPage";
import StreaksPage from "./pages/StreaksPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { LoadingScreen } from "./components/LoadingScreen";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isLoading && <LoadingScreen onFinished={() => setIsLoading(false)} />}
        <BrowserRouter>
          <AuthProvider>
            <SettingsProvider>
              <SessionProvider>
                <TimerProvider>
                  <TaskProvider>
                    <Routes>
                      {/* Public Routes - Demo Dashboard */}
                      <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                      <Route path="/auth" element={<AuthPage />} />

                      {/* Protected Web App Routes */}
                      <Route path="/dashboard" element={<RequireAuth><ErrorBoundary><Dashboard /></ErrorBoundary></RequireAuth>} />
                      <Route path="/tasks" element={<RequireAuth><TasksPage /></RequireAuth>} />
                      <Route path="/kanban" element={<RequireAuth><KanbanPage /></RequireAuth>} />
                      <Route path="/timer" element={<RequireAuth><TimerPage /></RequireAuth>} />
                      <Route path="/streaks" element={<RequireAuth><StreaksPage /></RequireAuth>} />
                      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />

                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TaskProvider>
                </TimerProvider>
              </SessionProvider>
            </SettingsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
