// Core Data Models

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  estimatedTime?: number; // in minutes
  subtasks: SubTask[];
  collaborators?: Collaborator[];
  createdAt: Date;
  lastEditedAt?: Date;
  parentId?: string; // For potential future nesting
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  isAiSuggested?: boolean;
  estimatedTime?: number;
}

export interface AiSuggestion {
  id: string;
  title: string;
  estimatedTime?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  streak: number;
  totalStudyHours: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  streak: number;
  lastActive?: Date;
  // Reduced complexity for now
}

export interface Collaborator extends Friend {
  role: 'viewer' | 'editor' | 'admin';
}

export interface StudySession {
  id: string;
  userId: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  notes?: string;
}

export interface TimerSettings {
  focus_duration: number;
  short_break: number;
  long_break: number;
  sessions_before_long_break: number;
  auto_start_breaks: boolean;
  auto_start_pomodoros: boolean;
}

export interface ProfileSettings {
  full_name: string | null;
  avatar_url: string | null;
  avatar_type: 'panda' | 'custom' | null;
  total_study_minutes: number;
  streak_days: number;
}

