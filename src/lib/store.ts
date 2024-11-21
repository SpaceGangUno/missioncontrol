import { create } from 'zustand';
import { doc, collection, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from './firebase';
import { Goal, UserSettings, ThemeColors, DayPlan, StartedDayPlan } from '../types';
import { themes } from './themes';
import { updateCSSVariables } from './theme-utils';
import { startOfWeek, addDays, format } from 'date-fns';

interface Store {
  goals: Goal[];
  dayPlan: DayPlan | null;
  weekPlans: Record<string, DayPlan>;
  loading: boolean;
  goalsLoading: boolean;
  dayPlanLoading: boolean;
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

// Initialize default theme
const defaultTheme = themes[0];
if (typeof window !== 'undefined') {
  try {
    updateCSSVariables(defaultTheme);
  } catch (error) {
    console.error('Failed to initialize theme:', error);
  }
}

export const useStore = create<Store>((set, get) => ({
  goals: [],
  dayPlan: null,
  weekPlans: {},
  loading: true,
  goalsLoading: true,
  dayPlanLoading: true,
  error: null,
  user: null,
  currentTheme: defaultTheme,

  setUser: (user) => {
    set({ user });
    if (user) {
      set({ loading: true, goalsLoading: true, dayPlanLoading: true });

      const userGoalsRef = collection(db, `users/${user.uid}/goals`);
      onSnapshot(userGoalsRef, (snapshot) => {
        const goals = snapshot.docs.map(doc => ({
          ...(doc.data() as Goal),
          id: doc.id
        }));
        set((state) => ({ 
          ...state,
          goals,
          goalsLoading: false,
          loading: !state.dayPlanLoading
        }));
      });

      const today = new Date().toISOString().split('T')[0];
      const userDayPlanRef = doc(db, `users/${user.uid}/dayPlans/${today}`);
      onSnapshot(userDayPlanRef, (snapshot) => {
        if (snapshot.exists()) {
          const planData = snapshot.data() as Omit<DayPlan, 'id'>;
          set((state) => ({ 
            ...state,
            dayPlan: { ...planData, id: snapshot.id },
            dayPlanLoading: false,
            loading: !state.goalsLoading
          }));
        } else {
          set((state) => ({ 
            ...state,
            dayPlan: null,
            dayPlanLoading: false,
            loading: !state.goalsLoading
          }));
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
          const theme = themes.find(t => t.id === settings.theme) || defaultTheme;
          set((state: Store) => ({ ...state, currentTheme: theme }));
          updateCSSVariables(theme);
        } else {
          updateCSSVariables(defaultTheme);
        }
      });
    } else {
      set({ 
        goals: [], 
        dayPlan: null, 
        weekPlans: {}, 
        loading: false,
        goalsLoading: false,
        dayPlanLoading: false
      });
      updateCSSVariables(defaultTheme);
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
    const theme = themes.find(t => t.id === themeId) || defaultTheme;
    
    set((state: Store) => ({ ...state, currentTheme: theme }));
    updateCSSVariables(theme);

    if (!user) return;

    try {
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
        description: goal.description || '',
        completed: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      set((state: Store) => ({ ...state, error: 'Failed to add goal' }));
      throw error;
    }
  },

  updateGoal: async (id, updates) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const goalRef = doc(db, `users/${user.uid}/goals/${id}`);
      const docSnap = await getDoc(goalRef);
      
      if (!docSnap.exists()) {
        throw new Error('Goal not found');
      }

      const currentData = docSnap.data() as Goal;
      const updatedData = {
        ...currentData,
        ...updates,
        description: updates.description ?? currentData.description ?? ''
      };

      await updateDoc(goalRef, updatedData);
    } catch (error) {
      set((state: Store) => ({ ...state, error: 'Failed to update goal' }));
      throw error;
    }
  },

  toggleGoal: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const goal = get().goals.find(g => g.id === id);
      if (!goal) return;

      const goalRef = doc(db, `users/${user.uid}/goals/${id}`);
      await updateDoc(goalRef, { 
        completed: !goal.completed,
        status: !goal.completed ? 'completed' : 'in_progress'
      });
    } catch (error) {
      set((state: Store) => ({ ...state, error: 'Failed to toggle goal' }));
      throw error;
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
      throw error;
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
        : {
            date: plan.date,
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

      set((state: Store) => ({
        ...state,
        dayPlan: { ...updatedPlan, id: plan.date },
        weekPlans: {
          ...state.weekPlans,
          [plan.date]: { ...updatedPlan, id: plan.date }
        }
      }));
    } catch (error) {
      set((state: Store) => ({ ...state, error: 'Failed to save day plan' }));
      throw error;
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
        set((state: Store) => ({ 
          ...state,
          dayPlan: { ...planData, id: date },
          weekPlans: {
            ...state.weekPlans,
            [date]: { ...planData, id: date }
          }
        }));
      } else {
        set((state: Store) => ({ ...state, dayPlan: null }));
      }
    } catch (error) {
      set((state: Store) => ({ ...state, error: 'Failed to get day plan' }));
      throw error;
    }
  },

  getWeekPlans: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
      const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(startDate, i), 'yyyy-MM-dd'));
      
      const plans: Record<string, DayPlan> = {};
      
      await Promise.all(weekDays.map(async (date) => {
        const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${date}`);
        const docSnap = await getDoc(dayPlanRef);
        
        if (docSnap.exists()) {
          const planData = docSnap.data() as Omit<DayPlan, 'id'>;
          plans[date] = { ...planData, id: date };
        }
      }));
      
      set((state: Store) => ({ ...state, weekPlans: plans }));
    } catch (error) {
      set((state: Store) => ({ ...state, error: 'Failed to get week plans' }));
      throw error;
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
        updatedPlan = {
          date,
          gratitude: '',
          wordOfDay: '',
          greatDay: '',
          makeItEleven: '',
          topGoals: [goalId],
          meals: {
            breakfast: '',
            lunch: '',
            dinner: ''
          },
          createdAt: now,
          updatedAt: now
        };
        await setDoc(dayPlanRef, updatedPlan);
      }

      if (updatedPlan) {
        set((state: Store) => ({
          ...state,
          weekPlans: {
            ...state.weekPlans,
            [date]: { ...updatedPlan, id: date }
          }
        }));
      }
    } catch (error) {
      set((state: Store) => ({ ...state, error: 'Failed to assign goal to day' }));
      throw error;
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

      set((state: Store) => ({
        ...state,
        dayPlan: { ...updatedPlan, id: plan.date },
        weekPlans: {
          ...state.weekPlans,
          [plan.date]: { ...updatedPlan, id: plan.date }
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

      set((state: Store) => ({
        ...state,
        dayPlan: { ...updatedPlan, id: plan.date },
        weekPlans: {
          ...state.weekPlans,
          [plan.date]: { ...updatedPlan, id: plan.date }
        }
      }));
    } catch (error) {
      console.error('Failed to update started day:', error);
      set((state: Store) => ({ ...state, error: 'Failed to update started day' }));
      throw error;
    }
  }
}));
