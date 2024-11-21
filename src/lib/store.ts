import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

// ... [Previous helper functions remain unchanged]

export const useStore = create<Store>()(
  (set, get) => ({
    goals: [],
    dayPlan: null,
    weekPlans: {},
    loading: true,
    goalsLoading: true,
    dayPlanLoading: true,
    error: null,
    user: null,
    currentTheme: themes[0],

    setUser: (user) => {
      set({ user });
      if (user) {
        // Set initial loading states
        set({ loading: true, goalsLoading: true, dayPlanLoading: true });

        // Subscribe to goals
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
            // Only set loading to false if both goals and dayPlan are loaded
            loading: !state.dayPlanLoading
          }));
        });

        // Subscribe to today's day plan
        const today = new Date().toISOString().split('T')[0];
        const userDayPlanRef = doc(db, `users/${user.uid}/dayPlans/${today}`);
        onSnapshot(userDayPlanRef, (snapshot) => {
          if (snapshot.exists()) {
            const planData = snapshot.data() as Omit<DayPlan, 'id'>;
            set((state) => ({ 
              ...state,
              dayPlan: { ...planData, id: snapshot.id },
              dayPlanLoading: false,
              // Only set loading to false if both goals and dayPlan are loaded
              loading: !state.goalsLoading
            }));
          } else {
            set((state) => ({ 
              ...state,
              dayPlan: null,
              dayPlanLoading: false,
              // Only set loading to false if both goals and dayPlan are loaded
              loading: !state.goalsLoading
            }));
          }
        });

        // Subscribe to week plans
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

        // Subscribe to user settings
        const userSettingsRef = doc(db, `users/${user.uid}/settings/preferences`);
        onSnapshot(userSettingsRef, (snapshot) => {
          const settings = snapshot.data();
          if (settings?.theme) {
            const theme = themes.find(t => t.id === settings.theme) || themes[0];
            set((state: Store) => ({ ...state, currentTheme: theme }));
            updateCSSVariables(theme);
          } else {
            updateCSSVariables(themes[0]);
          }
        });
      } else {
        // Reset state when user logs out
        set({ 
          goals: [], 
          dayPlan: null, 
          weekPlans: {}, 
          loading: false,
          goalsLoading: false,
          dayPlanLoading: false
        });
        updateCSSVariables(themes[0]);
      }
    },

    // ... [Rest of the store implementation remains unchanged]
  })
);
