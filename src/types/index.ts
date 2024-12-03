export interface Goal {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'personal' | 'work' | 'health' | 'learning' | 'creative';
  deadline?: Date | string;
  completed: boolean;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: Date | string;
}

export interface DayPlan {
  id: string;
  date: string;
  gratitude: string;
  wordOfDay: string;
  greatDay: string;
  makeItEleven: string;
  topGoals: string[];
  sideQuest: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  createdAt: string;
  updatedAt: string;
  status?: 'started';
  startedAt?: string;
}

export interface StartedDayPlan extends Omit<DayPlan, 'id' | 'createdAt' | 'updatedAt'> {
  status: 'started';
  startedAt: string;
}

export interface MonthlyPlan {
  id: string;
  month: number;
  year: number;
  goals: Goal[];
  reflection: string;
  overallProgress: number;
}

export interface ThemeColors {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  description: string;
  background: string;
  backgroundGradient?: string;
  fontFamily: string;
  cardBackground: string;
  textColor: string;
  secondaryTextColor: string;
}

export interface UserSettings {
  theme: string;
  displayName: string;
  photoURL?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface AnimatingGoal {
  id: string;
  action: 'takeoff' | 'landing';
}

export interface DayCardProps {
  date: string;
  goals: Goal[];
  onToggleGoal: (id: string) => void;
}

export interface TooltipProps {
  text: string;
  children?: React.ReactNode;
}

export interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
  onUpdateGoal?: (id: string, updates: Partial<Goal>) => Promise<void>;
  onAddGoal?: (goal: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => Promise<void>;
}
