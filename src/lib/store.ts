import { create } from 'zustand';
import { doc, collection, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth, firebaseInitialized } from './firebase';
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
  setUser: (user: any) => Promise<void>;
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

// Helper function to create an empty day plan
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

// Initialize default theme
const defaultTheme = themes[0];
if (typeof window !== 'undefined') {
  try {
    updateCSSVariables(defaultTheme);
  } catch (error) {
    console.error('Failed to initialize theme:', error);
  }
}

// Store cleanup functions
let unsubscribeGoals: Unsubscribe | undefined;
let unsubscribeDayPlan: Unsubscribe | undefined;
let timeoutId: NodeJS.Timeout | undefined;

export const useStore = create<Store>((set, get) => {
  const store: Store = {
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

    setUser: async (user) => {
      try {
        // Clean up existing subscriptions
        if (unsubscribeGoals) unsubscribeGoals();
        if (unsubscribeDayPlan) unsubscribeDayPlan();
        if (timeoutId) clearTimeout(timeoutId);

        // Wait for Firebase to initialize
        await firebaseInitialized;

        set({ user });
        if (user) {
          // Set initial loading states
          set({ loading: true, goalsLoading: true, dayPlanLoading: true, initialized: false });

          try {
            // Subscribe to goals
            const userGoalsRef = collection(db, `users/${user.uid}/goals`);
            unsubscribeGoals = onSnapshot(userGoalsRef, 
              (snapshot) => {
                const goals = snapshot.docs.map(doc => ({
                  ...(doc.data() as Goal),
                  id: doc.id
                }));
                set((state) => ({ 
                  ...state,
                  goals,
                  goalsLoading: false,
                  loading: !state.dayPlanLoading || state.initialized,
                  initialized: true,
                  error: null // Clear any previous errors
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
            unsubscribeDayPlan = onSnapshot(userDayPlanRef, 
              (snapshot) => {
                if (snapshot.exists()) {
                  const planData = snapshot.data() as Omit<DayPlan, 'id'>;
                  set((state) => ({ 
                    ...state,
                    dayPlan: { ...planData, id: snapshot.id },
                    dayPlanLoading: false,
                    loading: !state.goalsLoading || state.initialized,
                    initialized: true,
                    error: null // Clear any previous errors
                  }));
                } else {
                  set((state) => ({ 
                    ...state,
                    dayPlan: null,
                    dayPlanLoading: false,
                    loading: !state.goalsLoading || state.initialized,
                    initialized: true,
                    error: null // Clear any previous errors
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

            // Set a timeout to prevent infinite loading
            timeoutId = setTimeout(() => {
              set((state) => {
                if (state.loading || state.goalsLoading || state.dayPlanLoading) {
                  return {
                    ...state,
                    loading: false,
                    goalsLoading: false,
                    dayPlanLoading: false,
                    error: 'Loading timed out. Please check your internet connection and try again.',
                    initialized: true
                  };
                }
                return state;
              });
            }, 30000); // 30 second timeout

          } catch (error) {
            console.error('Error setting up subscriptions:', error);
            set({ 
              error: 'Failed to initialize data. Please try again.',
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
      } catch (error) {
        console.error('Error in setUser:', error);
        set({ 
          error: 'Failed to initialize Firebase. Please try again.',
          loading: false,
          goalsLoading: false,
          dayPlanLoading: false,
          initialized: true
        });
      }
    },

    updateUserProfile: async (profile) => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        await updateProfile(user, profile);
        const userSettingsRef = doc(db, `users/${user.uid}/settings/preferences`);
        await updateDoc(userSettingsRef, profile);
        set((state) => ({ ...state, user: { ...state.user, ...profile } }));
      } catch (error) {
        set((state) => ({ ...state, error: 'Failed to update profile' }));
      }
    },

    updateUserTheme: async (themeId) => {
      const user = auth.currentUser;
      const theme = themes.find(t => t.id === themeId) || defaultTheme;
      
      set((state) => ({ ...state, currentTheme: theme }));
      updateCSSVariables(theme);

      if (!user) return;

      try {
        const userSettingsRef = doc(db, `users/${user.uid}/settings/preferences`);
        await setDoc(userSettingsRef, { theme: themeId }, { merge: true });
      } catch (error) {
        set((state) => ({ ...state, error: 'Failed to update theme' }));
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
        set((state) => ({ ...state, error: 'Failed to add goal' }));
      }
    },

    updateGoal: async (id, updates) => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const goalRef = doc(db, `users/${user.uid}/goals/${id}`);
        await updateDoc(goalRef, updates);
      } catch (error) {
        set((state) => ({ ...state, error: 'Failed to update goal' }));
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
        set((state) => ({ ...state, error: 'Failed to toggle goal' }));
      }
    },

    deleteGoal: async (id) => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const goalRef = doc(db, `users/${user.uid}/goals/${id}`);
        await deleteDoc(goalRef);
      } catch (error) {
        set((state) => ({ ...state, error: 'Failed to delete goal' }));
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

        const finalPlan: DayPlan = { ...updatedPlan, id: plan.date };
        set((state) => ({
          ...state,
          dayPlan: finalPlan,
          weekPlans: {
            ...state.weekPlans,
            [plan.date]: finalPlan
          }
        }));
      } catch (error) {
        set((state) => ({ ...state, error: 'Failed to save day plan' }));
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
          const finalPlan: DayPlan = { ...planData, id: date };
          set((state) => ({ 
            ...state,
            dayPlan: finalPlan,
            weekPlans: {
              ...state.weekPlans,
              [date]: finalPlan
            }
          }));
        } else {
          set((state) => ({ ...state, dayPlan: null }));
        }
      } catch (error) {
        set((state) => ({ ...state, error: 'Failed to get day plan' }));
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
        
        set((state) => ({ ...state, weekPlans: plans }));
      } catch (error) {
        set((state) => ({ ...state, error: 'Failed to get week plans' }));
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
          const finalPlan: DayPlan = { ...updatedPlan, id: date };
          set((state) => ({
            ...state,
            weekPlans: {
              ...state.weekPlans,
              [date]: finalPlan
            }
          }));
        }
      } catch (error) {
        set((state) => ({ ...state, error: 'Failed to assign goal to day' }));
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
          updatedAt: now,
          createdAt: now
        };

        await updateDoc(dayPlanRef, updatedPlan);

        const finalPlan: DayPlan = { ...updatedPlan, id: plan.date };
        set((state) => ({
          ...state,
          dayPlan: finalPlan,
          weekPlans: {
            ...state.weekPlans,
            [plan.date]: finalPlan
          }
        }));
      } catch (error) {
        console.error('Failed to start day:', error);
        set((state) => ({ ...state, error: 'Failed to start day' }));
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

        const finalPlan: DayPlan = { ...updatedPlan, id: plan.date };
        set((state) => ({
          ...state,
          dayPlan: finalPlan,
          weekPlans: {
            ...state.weekPlans,
            [plan.date]: finalPlan
          }
        }));
      } catch (error) {
        console.error('Failed to update started day:', error);
        set((state) => ({ ...state, error: 'Failed to update started day' }));
        throw error;
      }
    }
  };

  return store;
});
