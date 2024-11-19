import { create } from 'zustand';
import { doc, collection, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from './firebase';
import { Goal, UserSettings, ThemeColors, DayPlan, StartedDayPlan } from '../types';
import { themes } from './themes';

interface Store {
  goals: Goal[];
  dayPlan: DayPlan | null;
  loading: boolean;
  error: string | null;
  user: any;
  currentTheme: ThemeColors;
  setUser: (user: any) => void;
  updateUserProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
  updateUserTheme: (themeId: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  toggleGoal: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  saveDayPlan: (plan: Omit<DayPlan, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getDayPlan: (date: string) => Promise<void>;
  startDay: (plan: StartedDayPlan) => Promise<void>;
}

function updateCSSVariables(theme: ThemeColors) {
  // Colors
  document.documentElement.style.setProperty('--theme-primary', hexToRgb(theme.primary));
  document.documentElement.style.setProperty('--theme-secondary', hexToRgb(theme.secondary));
  document.documentElement.style.setProperty('--theme-accent', hexToRgb(theme.accent));
  
  // Background
  document.documentElement.style.setProperty('--theme-background', theme.background);
  if (theme.backgroundGradient) {
    document.documentElement.style.setProperty('--theme-background-gradient', theme.backgroundGradient);
  }
  
  // Card Background
  document.documentElement.style.setProperty('--theme-card-background', theme.cardBackground);
  
  // Text Colors
  document.documentElement.style.setProperty('--theme-text-color', theme.textColor);
  document.documentElement.style.setProperty('--theme-text-secondary', theme.secondaryTextColor);
  
  // Font Family
  document.documentElement.style.setProperty('--theme-font-family', theme.fontFamily);
  
  // Add font link if it doesn't exist
  const fontName = theme.fontFamily.split(',')[0].replace(/['"]/g, '');
  const fontId = `theme-font-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
  
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }
}

function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : 
    '56 189 248';
}

export const useStore = create<Store>((set, get) => ({
  goals: [],
  dayPlan: null,
  loading: true,
  error: null,
  user: null,
  currentTheme: themes[0],

  setUser: (user) => {
    set({ user });
    if (user) {
      // Listen for goals
      const userGoalsRef = collection(db, `users/${user.uid}/goals`);
      onSnapshot(userGoalsRef, (snapshot) => {
        const goals = snapshot.docs.map(doc => ({
          ...(doc.data() as Goal),
          id: doc.id
        }));
        set({ goals, loading: false });
      });

      // Listen for today's day plan
      const today = new Date().toISOString().split('T')[0];
      const userDayPlanRef = doc(db, `users/${user.uid}/dayPlans/${today}`);
      onSnapshot(userDayPlanRef, (snapshot) => {
        if (snapshot.exists()) {
          set({ dayPlan: { ...snapshot.data() as DayPlan, id: snapshot.id } });
        } else {
          set({ dayPlan: null });
        }
      });

      // Listen for user settings
      const userSettingsRef = doc(db, `users/${user.uid}/settings/preferences`);
      onSnapshot(userSettingsRef, (snapshot) => {
        const settings = snapshot.data();
        if (settings?.theme) {
          const theme = themes.find(t => t.id === settings.theme) || themes[0];
          set({ currentTheme: theme });
          updateCSSVariables(theme);
        }
      });
    } else {
      set({ goals: [], dayPlan: null, loading: false });
    }
  },

  updateUserProfile: async (profile) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateProfile(user, profile);
      const userSettingsRef = doc(db, `users/${user.uid}/settings/preferences`);
      await updateDoc(userSettingsRef, profile);
      set({ user: { ...get().user, ...profile } });
    } catch (error) {
      set({ error: 'Failed to update profile' });
    }
  },

  updateUserTheme: async (themeId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const theme = themes.find(t => t.id === themeId);
      if (!theme) return;

      // Update theme immediately in state
      set({ currentTheme: theme });
      updateCSSVariables(theme);

      // Then persist to database
      const userSettingsRef = doc(db, `users/${user.uid}/settings/preferences`);
      await setDoc(userSettingsRef, { theme: themeId }, { merge: true });
    } catch (error) {
      set({ error: 'Failed to update theme' });
    }
  },

  addGoal: async (goal) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const goalsRef = collection(db, `users/${user.uid}/goals`);
      const newGoalRef = doc(goalsRef);
      await setDoc(newGoalRef, {
        ...goal,
        completed: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      set({ error: 'Failed to add goal' });
    }
  },

  updateGoal: async (id, updates) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const goalRef = doc(db, `users/${user.uid}/goals/${id}`);
      await updateDoc(goalRef, updates);
    } catch (error) {
      set({ error: 'Failed to update goal' });
    }
  },

  toggleGoal: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const goal = get().goals.find(g => g.id === id);
      if (!goal) return;

      const goalRef = doc(db, `users/${user.uid}/goals/${id}`);
      await updateDoc(goalRef, { completed: !goal.completed });
    } catch (error) {
      set({ error: 'Failed to toggle goal' });
    }
  },

  deleteGoal: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const goalRef = doc(db, `users/${user.uid}/goals/${id}`);
      await deleteDoc(goalRef);
    } catch (error) {
      set({ error: 'Failed to delete goal' });
    }
  },

  saveDayPlan: async (plan) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${plan.date}`);
      const now = new Date().toISOString();
      
      const docSnap = await getDoc(dayPlanRef);
      if (docSnap.exists()) {
        await updateDoc(dayPlanRef, {
          ...plan,
          updatedAt: now
        });
      } else {
        await setDoc(dayPlanRef, {
          ...plan,
          createdAt: now,
          updatedAt: now
        });
      }
    } catch (error) {
      set({ error: 'Failed to save day plan' });
    }
  },

  getDayPlan: async (date) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${date}`);
      const docSnap = await getDoc(dayPlanRef);
      
      if (docSnap.exists()) {
        set({ dayPlan: { ...docSnap.data() as DayPlan, id: docSnap.id } });
      } else {
        set({ dayPlan: null });
      }
    } catch (error) {
      set({ error: 'Failed to get day plan' });
    }
  },

  startDay: async (plan) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // First update the goals to in_progress
      const goalsRef = collection(db, `users/${user.uid}/goals`);
      const updatePromises = plan.topGoals.map(async (goalId) => {
        if (!goalId.startsWith('temp-')) {
          const goalRef = doc(goalsRef, goalId);
          return updateDoc(goalRef, {
            status: 'in_progress',
            progress: 50
          });
        }
      }).filter(Boolean);

      // Wait for all goal updates to complete
      await Promise.all(updatePromises);

      // Then update the day plan
      const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${plan.date}`);
      await updateDoc(dayPlanRef, {
        status: 'started',
        startedAt: plan.startedAt,
        updatedAt: new Date().toISOString()
      });

      // Finally, create the started day record
      const startedDayRef = doc(db, `users/${user.uid}/startedDays/${plan.date}`);
      await setDoc(startedDayRef, {
        ...plan,
        createdAt: new Date().toISOString()
      });

      // Update local state
      set(state => ({
        dayPlan: state.dayPlan ? {
          ...state.dayPlan,
          status: 'started',
          startedAt: plan.startedAt
        } : null
      }));
    } catch (error) {
      console.error('Failed to start day:', error);
      set({ error: 'Failed to start day' });
      throw error; // Re-throw to handle in component
    }
  }
}));
