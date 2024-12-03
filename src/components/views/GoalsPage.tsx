import React, { useState, useEffect } from 'react';
import { Goal, DayPlan } from '../../types';
import AddGoalForm from '../AddGoalForm';
import { Plus, CheckCircle, Save, ChevronLeft, ChevronRight, Calendar, Edit2 } from 'lucide-react';
import { useStore } from '../../lib/store';

type TimeFrame = 'yearly' | 'monthly' | 'weekly' | 'daily';

interface GoalWithTimeframe extends Goal {
  timeframe: TimeFrame;
}

interface DailyPlanWithText extends Omit<DayPlan, 'topGoals'> {
  topGoals: string[];
  topGoalTexts: string[];
}

// Helper function to ensure array has 5 slots
const ensureFiveSlots = (arr: string[]): string[] => {
  const result = [...arr];
  while (result.length < 5) {
    result.push('');
  }
  return result;
};

const GoalsPage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('daily');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goals, setGoals] = useState<GoalWithTimeframe[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlanWithText>({
    id: '',
    date: selectedDate,
    gratitude: '',
    makeItEleven: '',
    greatDay: '',
    topGoals: ['', '', '', '', ''],
    topGoalTexts: ['', '', '', '', ''],
    sideQuest: '',
    meals: {
      breakfast: '',
      lunch: '',
      dinner: ''
    },
    createdAt: '',
    updatedAt: '',
    wordOfDay: ''
  });

  const { saveDayPlan, weekPlans, getWeekPlans, addGoal, goals: storeGoals } = useStore();

  const timeframes: TimeFrame[] = ['yearly', 'monthly', 'weekly', 'daily'];

  const completedGoals = goals.filter(goal => goal.completed).length;
  const totalGoals = goals.length;
  const progressPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const existingPlan = weekPlans[selectedDate];
        if (existingPlan) {
          const goalTexts = existingPlan.topGoals.map(goalId => {
            const goal = storeGoals.find(g => g.id === goalId);
            return goal?.title || '';
          });

          setDailyPlan({
            ...existingPlan,
            gratitude: existingPlan.gratitude || '',
            makeItEleven: existingPlan.makeItEleven || '',
            greatDay: existingPlan.greatDay || '',
            topGoals: ensureFiveSlots(existingPlan.topGoals || []),
            topGoalTexts: ensureFiveSlots(goalTexts),
            sideQuest: existingPlan.sideQuest || '',
            meals: existingPlan.meals || {
              breakfast: '',
              lunch: '',
              dinner: ''
            },
            wordOfDay: existingPlan.wordOfDay || ''
          });
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [selectedDate, weekPlans, storeGoals]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const existingPlan = weekPlans[newDate];
    if (existingPlan) {
      const goalTexts = existingPlan.topGoals.map(goalId => {
        const goal = storeGoals.find(g => g.id === goalId);
        return goal?.title || '';
      });

      setDailyPlan({
        ...existingPlan,
        gratitude: existingPlan.gratitude || '',
        makeItEleven: existingPlan.makeItEleven || '',
        greatDay: existingPlan.greatDay || '',
        topGoals: ensureFiveSlots(existingPlan.topGoals || []),
        topGoalTexts: ensureFiveSlots(goalTexts),
        sideQuest: existingPlan.sideQuest || '',
        meals: existingPlan.meals || {
          breakfast: '',
          lunch: '',
          dinner: ''
        },
        wordOfDay: existingPlan.wordOfDay || ''
      });
    } else {
      setDailyPlan({
        id: '',
        date: newDate,
        gratitude: '',
        makeItEleven: '',
        greatDay: '',
        topGoals: ['', '', '', '', ''],
        topGoalTexts: ['', '', '', '', ''],
        sideQuest: '',
        meals: {
          breakfast: '',
          lunch: '',
          dinner: ''
        },
        createdAt: '',
        updatedAt: '',
        wordOfDay: ''
      });
    }
  };

  const handleNavigateDay = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    handleDateChange(newDate.toISOString().split('T')[0]);
  };

  const handleAddGoal = async (goalData: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => {
    const newGoal: GoalWithTimeframe = {
      ...goalData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
      timeframe: selectedTimeframe,
    };
    setGoals([...goals, newGoal]);
  };

  const handleToggleGoal = (goalId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const handleDailyPlanChange = (field: keyof Omit<DayPlan, 'id' | 'date' | 'meals' | 'createdAt' | 'updatedAt'>, value: string) => {
    setDailyPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMealChange = (meal: keyof DayPlan['meals'], value: string) => {
    setDailyPlan(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [meal]: value
      }
    }));
  };

  const handleTopGoalChange = (index: number, value: string) => {
    setDailyPlan(prev => ({
      ...prev,
      topGoalTexts: prev.topGoalTexts.map((text, i) => i === index ? value : text)
    }));
  };

  const handleSaveDailyPlan = async () => {
    setIsSaving(true);
    try {
      const goalIds = await Promise.all(
        dailyPlan.topGoalTexts.map(async (goalText) => {
          if (!goalText) return '';

          const existingGoal = storeGoals.find(g => g.title === goalText);
          if (existingGoal) {
            return existingGoal.id;
          }

          if (goalText.trim()) {
            try {
              const result = await addGoal({
                title: goalText,
                description: '',
                priority: 'medium',
                category: 'personal',
                progress: 0,
                status: 'not_started'
              });
              return result.id;
            } catch (error) {
              console.error('Error creating goal:', error);
              return '';
            }
          }

          return '';
        })
      );

      await saveDayPlan({
        date: dailyPlan.date,
        gratitude: dailyPlan.gratitude,
        makeItEleven: dailyPlan.makeItEleven,
        greatDay: dailyPlan.greatDay,
        topGoals: goalIds.filter(id => id !== ''),
        sideQuest: dailyPlan.sideQuest,
        meals: dailyPlan.meals,
        wordOfDay: dailyPlan.wordOfDay
      });

      await getWeekPlans();
    } catch (error) {
      console.error('Error saving daily plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getGoalTitle = (goalId: string): string => {
    const goal = storeGoals.find(g => g.id === goalId);
    return goal?.title || '';
  };

  const filteredGoals = goals.filter(goal => goal.timeframe === selectedTimeframe);

  return (
    <div className="mobile-container">
      {/* ... JSX remains the same ... */}
    </div>
  );
};

export default GoalsPage;
