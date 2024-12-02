// First, let's modify the store to return the created goal ID
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
  user: any;
  currentTheme: ThemeColors;
  setUser: (user: any) => void;
  updateUserProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
  updateUserTheme: (themeId: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => Promise<{ id: string }>;
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
  updateCSSVariables(defaultTheme);
}

export const useStore = create<Store>((set, get) => ({
  goals: [],
  dayPlan: null,
  weekPlans: {},
  user: null,
  currentTheme: defaultTheme,

  setUser: (user) => {
    set({ user });
    if (user) {
      // Subscribe to goals
      const userGoalsRef = collection(db, `users/${user.uid}/goals`);
      onSnapshot(userGoalsRef, 
        (snapshot) => {
          const goals = snapshot.docs.map(doc => ({
            ...(doc.data() as Goal),
            id: doc.id
          }));
          set({ goals });
        }
      );

      // Subscribe to today's day plan
      const today = new Date().toISOString().split('T')[0];
      const userDayPlanRef = doc(db, `users/${user.uid}/dayPlans/${today}`);
      onSnapshot(userDayPlanRef, 
        (snapshot) => {
          if (snapshot.exists()) {
            const planData = snapshot.data() as Omit<DayPlan, 'id'>;
            set({ dayPlan: { ...planData, id: snapshot.id } });
          } else {
            set({ dayPlan: null });
          }
        }
      );
    } else {
      set({ goals: [], dayPlan: null, weekPlans: {} });
      updateCSSVariables(defaultTheme);
    }
  },

  updateUserProfile: async (profile) => {
    const user = auth.currentUser;
    if (!user) return;

    await updateProfile(user, profile);
    const userSettingsRef = doc(db, `users/${user.uid}/settings/preferences`);
    await updateDoc(userSettingsRef, profile);
    set((state) => ({ user: { ...state.user, ...profile } }));
  },

  updateUserTheme: async (themeId) => {
    const theme = themes.find(t => t.id === themeId) || defaultTheme;
    set({ currentTheme: theme });
    updateCSSVariables(theme);

    const user = auth.currentUser;
    if (!user) return;

    const userSettingsRef = doc(db, `users/${user.uid}/settings/preferences`);
    await setDoc(userSettingsRef, { theme: themeId }, { merge: true });
  },

  addGoal: async (goal) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const goalsRef = collection(db, `users/${user.uid}/goals`);
    const newGoalRef = doc(goalsRef);
    const newGoal = {
      ...goal,
      completed: false,
      createdAt: new Date().toISOString()
    };
    await setDoc(newGoalRef, newGoal);
    return { id: newGoalRef.id };
  },

  updateGoal: async (id, updates) => {
    const user = auth.currentUser;
    if (!user) return;

    const goalRef = doc(db, `users/${user.uid}/goals/${id}`);
    await updateDoc(goalRef, updates);
  },

  toggleGoal: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    const goal = get().goals.find(g => g.id === id);
    if (!goal) return;

    const goalRef = doc(db, `users/${user.uid}/goals/${id}`);
    await updateDoc(goalRef, { completed: !goal.completed });
  },

  deleteGoal: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    const goalRef = doc(db, `users/${user.uid}/goals/${id}`);
    await deleteDoc(goalRef);
  },

  saveDayPlan: async (plan) => {
    const user = auth.currentUser;
    if (!user) return;

    const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${plan.date}`);
    const now = new Date().toISOString();
    await setDoc(dayPlanRef, {
      ...plan,
      updatedAt: now,
      createdAt: now
    });
  },

  getDayPlan: async (date) => {
    const user = auth.currentUser;
    if (!user) return;

    const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${date}`);
    const docSnap = await getDoc(dayPlanRef);
    
    if (docSnap.exists()) {
      const planData = docSnap.data() as Omit<DayPlan, 'id'>;
      set({ dayPlan: { ...planData, id: date } });
    } else {
      set({ dayPlan: null });
    }
  },

  getWeekPlans: async () => {
    const user = auth.currentUser;
    if (!user) return;

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
    
    set({ weekPlans: plans });
  },

  assignGoalToDay: async (goalId, date) => {
    const user = auth.currentUser;
    if (!user) return;

    const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${date}`);
    const docSnap = await getDoc(dayPlanRef);
    const now = new Date().toISOString();
    
    if (docSnap.exists()) {
      const existingData = docSnap.data() as Omit<DayPlan, 'id'>;
      const existingGoals = existingData.topGoals || [];
      if (!existingGoals.includes(goalId)) {
        await updateDoc(dayPlanRef, {
          topGoals: [...existingGoals, goalId],
          updatedAt: now
        });
      }
    } else {
      await setDoc(dayPlanRef, {
        date,
        topGoals: [goalId],
        createdAt: now,
        updatedAt: now
      });
    }
  },

  startDay: async (plan) => {
    const user = auth.currentUser;
    if (!user) return;

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
    await updateDoc(dayPlanRef, {
      ...plan,
      status: 'started',
      startedAt: plan.startedAt,
      updatedAt: now
    });
  },

  updateStartedDay: async (plan) => {
    const user = auth.currentUser;
    if (!user) return;

    const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${plan.date}`);
    const docSnap = await getDoc(dayPlanRef);
    if (!docSnap.exists()) return;

    const existingData = docSnap.data() as Omit<DayPlan, 'id'>;
    const now = new Date().toISOString();
    
    await updateDoc(dayPlanRef, {
      ...existingData,
      ...plan,
      topGoals: plan.topGoals || existingData.topGoals || [],
      status: 'started',
      startedAt: existingData.startedAt,
      updatedAt: now
    });
  }
}));
