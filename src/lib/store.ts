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
  initialized: boolean;
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
  loading: false,
  goalsLoading: false,
  dayPlanLoading: false,
  error: null,
  user: null,
  currentTheme: defaultTheme,
  initialized: false,

  setUser: (user) => {
    set({ user });
    if (user) {
      // Set initial loading states
      set({ loading: true, goalsLoading: true, dayPlanLoading: true });

      try {
        // Subscribe to goals
        const userGoalsRef = collection(db, `users/${user.uid}/goals`);
        const unsubscribeGoals = onSnapshot(userGoalsRef, 
          (snapshot) => {
            const goals = snapshot.docs.map(doc => ({
              ...(doc.data() as Goal),
              id: doc.id
            }));
            set((state) => ({ 
              ...state,
              goals,
              goalsLoading: false,
              loading: !state.dayPlanLoading,
              initialized: true
            }));
          },
          (error) => {
            console.error('Goals subscription error:', error);
            set((state) => ({ 
              ...state,
              error: 'Failed to load goals',
              goalsLoading: false,
              loading: false,
              initialized: true
            }));
          }
        );

        // Subscribe to today's day plan
        const today = new Date().toISOString().split('T')[0];
        const userDayPlanRef = doc(db, `users/${user.uid}/dayPlans/${today}`);
        const unsubscribeDayPlan = onSnapshot(userDayPlanRef, 
          (snapshot) => {
            if (snapshot.exists()) {
              const planData = snapshot.data() as Omit<DayPlan, 'id'>;
              set((state) => ({ 
                ...state,
                dayPlan: { ...planData, id: snapshot.id },
                dayPlanLoading: false,
                loading: !state.goalsLoading,
                initialized: true
              }));
            } else {
              set((state) => ({ 
                ...state,
                dayPlan: null,
                dayPlanLoading: false,
                loading: !state.goalsLoading,
                initialized: true
              }));
            }
          },
          (error) => {
            console.error('Day plan subscription error:', error);
            set((state) => ({ 
              ...state,
              error: 'Failed to load day plan',
              dayPlanLoading: false,
              loading: false,
              initialized: true
            }));
          }
        );

        // Subscribe to week plans
        const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
        const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(startDate, i), 'yyyy-MM-dd'));
        
        weekDays.forEach(date => {
          const dayPlanRef = doc(db, `users/${user.uid}/dayPlans/${date}`);
          onSnapshot(dayPlanRef, 
            (snapshot) => {
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
            },
            (error) => {
              console.error('Week plans subscription error:', error);
            }
          );
        });

        // Subscribe to user settings
        const userSettingsRef = doc(db, `users/${user.uid}/settings/preferences`);
        onSnapshot(userSettingsRef, 
          (snapshot) => {
            const settings = snapshot.data();
            if (settings?.theme) {
              const theme = themes.find(t => t.id === settings.theme) || defaultTheme;
              set((state: Store) => ({ ...state, currentTheme: theme }));
              updateCSSVariables(theme);
            } else {
              updateCSSVariables(defaultTheme);
            }
          },
          (error) => {
            console.error('Settings subscription error:', error);
          }
        );

        // Set up cleanup
        return () => {
          unsubscribeGoals();
          unsubscribeDayPlan();
        };
      } catch (error) {
        console.error('Error setting up subscriptions:', error);
        set({ 
          error: 'Failed to initialize data',
          loading: false,
          goalsLoading: false,
          dayPlanLoading: false,
          initialized: true
        });
      }
    } else {
      // Reset state when user logs out
      set({ 
        goals: [], 
        dayPlan: null, 
        weekPlans: {}, 
        loading: false,
        goalsLoading: false,
        dayPlanLoading: false,
        error: null,
        initialized: true
      });
      updateCSSVariables(defaultTheme);
    }
  },

  // ... [Rest of the store implementation remains unchanged]
}));
