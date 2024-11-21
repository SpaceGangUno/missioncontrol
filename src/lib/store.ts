// ... [Previous imports remain unchanged]

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
  // ... [Rest of the interface remains unchanged]
}

// ... [Previous helper functions remain unchanged]

export const useStore = create<Store>((set, get) => ({
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
}));
