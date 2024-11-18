import { create } from 'zustand';
import { ref, set, get, push, update, remove, onValue } from 'firebase/database';
import { updateProfile } from 'firebase/auth';
import { db, auth } from './firebase';
import { Goal, UserSettings, ThemeColors } from '../types';
import { themes } from './themes';

interface Store {
  goals: Goal[];
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
}

function updateCSSVariables(theme: ThemeColors) {
  document.documentElement.style.setProperty('--theme-primary', hexToRgb(theme.primary));
  document.documentElement.style.setProperty('--theme-secondary', hexToRgb(theme.secondary));
  document.documentElement.style.setProperty('--theme-accent', hexToRgb(theme.accent));
  
  // Force a repaint to ensure styles are updated
  document.documentElement.style.display = 'none';
  document.documentElement.offsetHeight;
  document.documentElement.style.display = '';
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
  loading: true,
  error: null,
  user: null,
  currentTheme: themes[0],

  setUser: (user) => {
    set({ user });
    if (user) {
      // Listen for goals
      const userGoalsRef = ref(db, `users/${user.uid}/goals`);
      onValue(userGoalsRef, (snapshot) => {
        const data = snapshot.val();
        const goals = data ? Object.entries(data).map(([id, goal]) => ({
          ...(goal as any),
          id
        })) : [];
        set({ goals, loading: false });
      });

      // Listen for user settings
      const userSettingsRef = ref(db, `users/${user.uid}/settings`);
      onValue(userSettingsRef, (snapshot) => {
        const settings = snapshot.val();
        if (settings?.theme) {
          const theme = themes.find(t => t.id === settings.theme) || themes[0];
          set({ currentTheme: theme });
          updateCSSVariables(theme);
        }
      });
    } else {
      set({ goals: [], loading: false });
    }
  },

  updateUserProfile: async (profile) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateProfile(user, profile);
      const userSettingsRef = ref(db, `users/${user.uid}/settings`);
      await update(userSettingsRef, profile);
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
      const userSettingsRef = ref(db, `users/${user.uid}/settings`);
      await update(userSettingsRef, { theme: themeId });
    } catch (error) {
      set({ error: 'Failed to update theme' });
    }
  },

  addGoal: async (goal) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userGoalsRef = ref(db, `users/${user.uid}/goals`);
      const newGoalRef = push(userGoalsRef);
      await set(newGoalRef, {
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
      const goalRef = ref(db, `users/${user.uid}/goals/${id}`);
      await update(goalRef, updates);
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

      const goalRef = ref(db, `users/${user.uid}/goals/${id}`);
      await update(goalRef, { completed: !goal.completed });
    } catch (error) {
      set({ error: 'Failed to toggle goal' });
    }
  },

  deleteGoal: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const goalRef = ref(db, `users/${user.uid}/goals/${id}`);
      await remove(goalRef);
    } catch (error) {
      set({ error: 'Failed to delete goal' });
    }
  }
}));