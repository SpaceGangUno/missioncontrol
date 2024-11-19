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

export interface DayPlan {
  id: string;
  date: string;
  gratitude: string;
  wordOfDay: string;
  greatDay: string;
  makeItEleven: string;
  topGoals: string[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  createdAt: string;
  updatedAt: string;
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
