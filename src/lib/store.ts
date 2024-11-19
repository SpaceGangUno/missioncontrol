import { create } from 'zustand';
import { doc, collection, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from './firebase';
import { Goal, UserSettings, ThemeColors, DayPlan, StartedDayPlan } from '../types';
import { themes } from './themes';
import { startOfWeek, addDays, format } from 'date-fns';

interface Store {
  goals: Goal[];
  dayPlan: DayPlan | null;
  weekPlans: Record<string, DayPlan>;
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
  getWeekPlans: () => Promise<void>;
  assignGoalToDay: (goalId: string, date: string) => Promise<void>;
  startDay: (plan: StartedDayPlan) => Promise<void>;
  updateStartedDay: (plan: Partial<DayPlan> & { date: string }) => Promise<void>;
}

function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : 
    '56 189 248';
}

function updateCSSVariables(theme: ThemeColors): void {
  document.documentElement.style.setProperty('--theme-primary', hexToRgb(theme.primary));
  document.documentElement.style.setProperty('--theme-secondary', hexToRgb(theme.secondary));
  document.documentElement.style.setProperty('--theme-accent', hexToRgb(theme.accent));
  document.documentElement.style.setProperty('--theme-background', theme.background);
  if (theme.backgroundGradient) {
    document.documentElement.style.setProperty('--theme-background-gradient', theme.backgroundGradient);
  }
  document.documentElement.style.setProperty('--theme-card-background', theme.cardBackground);
  document.documentElement.style.setProperty('--theme-text-color', theme.textColor);
  document.documentElement.style.setProperty('--theme-text-secondary', theme.secondaryTextColor);
  document.documentElement.style.setProperty('--theme-font-family', theme.fontFamily);
  
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

function createEmptyDayPlan(date: string, now: string): Omit<DayPlan, 'id'> {
  return {
    date,
    gratitude: '',
    wordOfDay: '',
    greatDay: '',
    makeItEleven: '',
    topGoals: [],
    meals: {
      breakfast: '',
      lunch: '',
      dinner: ''
    },
    createdAt: now,
    updatedAt: now
  };
}

function createDayPlan(data: Partial<Omit<DayPlan, 'id'>>, date: string, now: string): DayPlan {
  const base = createEmptyDayPlan(date, now);
  return {
    ...base,
    ...data,
    id: date,
    createdAt: data.createdAt || now,
    updatedAt: now,
    status: data.status as 'started' | undefined,
    startedAt: data.startedAt
  };
}

export const useStore = create<Store>((set, get) => {
  const store: Store = {
    goals: [],
    dayPlan: null,
    weekPlans: {},
    loading: true,
    error: null,
    user: null,
    currentTheme: themes[0],

    setUser: (user) => {
      set({ user });
      if (user) {
        const userGoalsRef = collection(db, `users/${user.uid}/goals`);
        onSnapshot(userGoalsRef, (snapshot) => {
          const goals = snapshot.docs.map(doc => ({
            ...(doc.data() as Goal),
            id: doc.id
          }));
          set({ goals, loading: false });
        });

        const today = new Date().toISOString().split('T')[0];
        const userDayPlanRef = doc(db, `users/${user.uid}/dayPlans/${today}`);
        onSnapshot(userDayPlanRef, (snapshot) => {
          if (snapshot.exists()) {
            const planData = snapshot.data() as Omit<DayPlan, 'id'>;
            set({ dayPlan: { ...planData, id: snapshot.id } });
          } else {
            set({ dayPlan: null });
          }
        });

        const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
        const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(startDate, i), 'yyyy-MM-dd'));
        
        weekDays.forEach(date => {
          const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${date}`);
          onSnapshot(dayPlanRef, (snapshot) => {
            if (snapshot.exists()) {
              const planData = snapshot.data() as Omit<DayPlan, 'id'>;
              set((state: Store) => ({
                ...state,
                weekPlans: {
                  ...state.weekPlans,
                  [date]: { ...planData, id: snapshot.id }
                }
              }));
            }
          });
        });

        const userSettingsRef = doc(db, `users/${user.uid}/settings/preferences`);
        onSnapshot(userSettingsRef, (snapshot) => {
          const settings = snapshot.data();
          if (settings?.theme) {
            const theme = themes.find(t => t.id === settings.theme) || themes[0];
            set((state: Store) => ({ ...state, currentTheme: theme }));
            updateCSSVariables(theme);
          }
        });
      } else {
        set({ goals: [], dayPlan: null, weekPlans: {}, loading: false });
      }
    },

    updateUserProfile: async (profile) => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        await updateProfile(user, profile);
        const userSettingsRef = doc(db, `users/${user.uid}/settings/preferences`);
        await updateDoc(userSettingsRef, profile);
        set((state: Store) => ({ ...state, user: { ...state.user, ...profile } }));
      } catch (error) {
        set((state: Store) => ({ ...state, error: 'Failed to update profile' }));
      }
    },

    updateUserTheme: async (themeId) => {
      const user = auth.currentUser;
      if (!user) {
        // If no user is logged in, just update the theme locally
        const theme = themes.find(t => t.id === themeId) || themes[0];
        set((state: Store) => ({ ...state, currentTheme: theme }));
        updateCSSVariables(theme);
        return;
      }

      try {
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return;

        set((state: Store) => ({ ...state, currentTheme: theme }));
        updateCSSVariables(theme);

        const userSettingsRef = doc(db, `users/${user.uid}/settings/preferences`);
        await setDoc(userSettingsRef, { theme: themeId }, { merge: true });
      } catch (error) {
        set((state: Store) => ({ ...state, error: 'Failed to update theme' }));
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
        set((state: Store) => ({ ...state, error: 'Failed to add goal' }));
      }
    },

    updateGoal: async (id, updates) => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const goalRef = doc(db, `users/${user.uid}/goals/${id}`);
        await updateDoc(goalRef, updates);
      } catch (error) {
        set((state: Store) => ({ ...state, error: 'Failed to update goal' }));
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
        set((state: Store) => ({ ...state, error: 'Failed to toggle goal' }));
      }
    },

    deleteGoal: async (id) => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const goalRef = doc(db, `users/${user.uid}/goals/${id}`);
        await deleteDoc(goalRef);
      } catch (error) {
        set((state: Store) => ({ ...state, error: 'Failed to delete goal' }));
      }
    },

    saveDayPlan: async (plan) => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${plan.date}`);
        const now = new Date().toISOString();
        
        const docSnap = await getDoc(dayPlanRef);
        const existingData = docSnap.exists() 
          ? docSnap.data() as Omit<DayPlan, 'id'>
          : createEmptyDayPlan(plan.date, now);
        
        const updatedPlan = {
          ...existingData,
          ...plan,
          topGoals: plan.topGoals || existingData.topGoals || [],
          updatedAt: now
        };
        
        if (docSnap.exists()) {
          await updateDoc(dayPlanRef, updatedPlan);
        } else {
          await setDoc(dayPlanRef, updatedPlan);
        }

        const finalPlan = createDayPlan(updatedPlan, plan.date, now);
        set((state: Store) => ({
          ...state,
          dayPlan: finalPlan,
          weekPlans: {
            ...state.weekPlans,
            [plan.date]: finalPlan
          }
        }));
      } catch (error) {
        set((state: Store) => ({ ...state, error: 'Failed to save day plan' }));
      }
    },

    getDayPlan: async (date) => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${date}`);
        const docSnap = await getDoc(dayPlanRef);
        
        if (docSnap.exists()) {
          const planData = docSnap.data() as Omit<DayPlan, 'id'>;
          const now = new Date().toISOString();
          const plan = createDayPlan(planData, date, now);
          set((state: Store) => ({ 
            ...state,
            dayPlan: plan,
            weekPlans: {
              ...state.weekPlans,
              [date]: plan
            }
          }));
        } else {
          set((state: Store) => ({ ...state, dayPlan: null }));
        }
      } catch (error) {
        set((state: Store) => ({ ...state, error: 'Failed to get day plan' }));
      }
    },

    getWeekPlans: async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
        const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(startDate, i), 'yyyy-MM-dd'));
        
        const plans: Record<string, DayPlan> = {};
        const now = new Date().toISOString();
        
        await Promise.all(weekDays.map(async (date) => {
          const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${date}`);
          const docSnap = await getDoc(dayPlanRef);
          
          if (docSnap.exists()) {
            const planData = docSnap.data() as Omit<DayPlan, 'id'>;
            plans[date] = createDayPlan(planData, date, now);
          }
        }));
        
        set((state: Store) => ({ ...state, weekPlans: plans }));
      } catch (error) {
        set((state: Store) => ({ ...state, error: 'Failed to get week plans' }));
      }
    },

    assignGoalToDay: async (goalId, date) => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${date}`);
        const docSnap = await getDoc(dayPlanRef);
        const now = new Date().toISOString();
        
        let updatedPlan;
        if (docSnap.exists()) {
          const existingData = docSnap.data() as Omit<DayPlan, 'id'>;
          const existingGoals = existingData.topGoals || [];
          if (!existingGoals.includes(goalId)) {
            updatedPlan = {
              ...existingData,
              topGoals: [...existingGoals, goalId],
              updatedAt: now
            };
            await updateDoc(dayPlanRef, updatedPlan);
          }
        } else {
          updatedPlan = createEmptyDayPlan(date, now);
          updatedPlan.topGoals = [goalId];
          await setDoc(dayPlanRef, updatedPlan);
        }

        if (updatedPlan) {
          const finalPlan = createDayPlan(updatedPlan, date, now);
          set((state: Store) => ({
            ...state,
            weekPlans: {
              ...state.weekPlans,
              [date]: finalPlan
            }
          }));
        }
      } catch (error) {
        set((state: Store) => ({ ...state, error: 'Failed to assign goal to day' }));
      }
    },

    startDay: async (plan) => {
      const user = auth.currentUser;
      if (!user) return;

      try {
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

        await Promise.all(updatePromises);

        const now = new Date().toISOString();
        const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${plan.date}`);
        const updatedPlan = {
          ...plan,
          status: 'started' as const,
          startedAt: plan.startedAt,
          updatedAt: now
        };

        await updateDoc(dayPlanRef, updatedPlan);

        const finalPlan = createDayPlan(updatedPlan, plan.date, now);
        set((state: Store) => ({
          ...state,
          dayPlan: finalPlan,
          weekPlans: {
            ...state.weekPlans,
            [plan.date]: finalPlan
          }
        }));
      } catch (error) {
        console.error('Failed to start day:', error);
        set((state: Store) => ({ ...state, error: 'Failed to start day' }));
        throw error;
      }
    },

    updateStartedDay: async (plan) => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${plan.date}`);
        const now = new Date().toISOString();

        const docSnap = await getDoc(dayPlanRef);
        if (!docSnap.exists()) {
          throw new Error('Day plan not found');
        }

        const existingData = docSnap.data() as Omit<DayPlan, 'id'>;
        
        const updatedPlan = {
          ...existingData,
          ...plan,
          topGoals: plan.topGoals || existingData.topGoals || [],
          status: 'started' as const,
          startedAt: existingData.startedAt,
          updatedAt: now
        };

        await updateDoc(dayPlanRef, updatedPlan);

        if (plan.topGoals) {
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

          await Promise.all(updatePromises);
        }

        const finalPlan = createDayPlan(updatedPlan, plan.date, now);
        const weekPlans = { ...get().weekPlans };
        weekPlans[plan.date] = finalPlan;

        set((state: Store) => ({
          ...state,
          dayPlan: finalPlan,
          weekPlans
        }));
      } catch (error) {
        console.error('Failed to update started day:', error);
        set((state: Store) => ({ ...state, error: 'Failed to update started day' }));
        throw error;
      }
    }
  };

  return store;
});
