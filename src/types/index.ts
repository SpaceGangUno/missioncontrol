export interface Goal {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
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
}

export interface UserSettings {
  theme: string;
  displayName: string;
  photoURL?: string;
}