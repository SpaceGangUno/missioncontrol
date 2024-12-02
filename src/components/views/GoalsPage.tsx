import React, { useState, useEffect } from 'react';
import { Goal } from '../../types';
import AddGoalForm from '../AddGoalForm';
import { Plus, CheckCircle, Save, ChevronLeft, ChevronRight, Calendar, Edit2 } from 'lucide-react';

type TimeFrame = 'yearly' | 'monthly' | 'weekly' | 'daily';

interface DailyPlan {
  id?: string;
  date: string;
  gratitude: string;
  makeItEleven: string;
  greatDay: string;
  topGoals: string[];
  sideQuest: string;
  notes: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

interface GoalWithTimeframe extends Goal {
  timeframe: TimeFrame;
}

const GoalsPage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('monthly');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goals, setGoals] = useState<GoalWithTimeframe[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [savedDailyPlans, setSavedDailyPlans] = useState<DailyPlan[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>({
    date: selectedDate,
    gratitude: '',
    makeItEleven: '',
    greatDay: '',
    topGoals: ['', '', '', '', ''],
    sideQuest: '',
    notes: '',
    meals: {
      breakfast: '',
      lunch: '',
      dinner: ''
    }
  });

  const timeframes: TimeFrame[] = ['yearly', 'monthly', 'weekly', 'daily'];

  const completedGoals = goals.filter(goal => goal.completed).length;
  const totalGoals = goals.length;
  const progressPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  useEffect(() => {
    const loadSavedPlans = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockPlans: DailyPlan[] = [
          {
            id: '1',
            date: new Date().toISOString().split('T')[0],
            gratitude: 'Sample gratitude entry',
            makeItEleven: 'Sample make it eleven entry',
            greatDay: 'Sample great day entry',
            topGoals: ['Goal 1', 'Goal 2', 'Goal 3', 'Goal 4', 'Goal 5'],
            sideQuest: 'Sample side quest',
            notes: 'Sample notes for the day',
            meals: {
              breakfast: 'Oatmeal',
              lunch: 'Salad',
              dinner: 'Grilled chicken'
            }
          }
        ];
        setSavedDailyPlans(mockPlans);
        
        const existingPlan = mockPlans.find(plan => plan.date === selectedDate);
        if (existingPlan) {
          setDailyPlan(existingPlan);
        }
      } catch (error) {
        console.error('Error loading saved plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedTimeframe === 'daily') {
      loadSavedPlans();
    }
  }, [selectedTimeframe, selectedDate]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const existingPlan = savedDailyPlans.find(plan => plan.date === newDate);
    if (existingPlan) {
      setDailyPlan(existingPlan);
    } else {
      setDailyPlan({
        date: newDate,
        gratitude: '',
        makeItEleven: '',
        greatDay: '',
        topGoals: ['', '', '', '', ''],
        sideQuest: '',
        notes: '',
        meals: {
          breakfast: '',
          lunch: '',
          dinner: ''
        }
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

  const handleDailyPlanChange = (field: keyof Omit<DailyPlan, 'id' | 'date' | 'meals'>, value: string) => {
    setDailyPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMealChange = (meal: keyof DailyPlan['meals'], value: string) => {
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
      topGoals: prev.topGoals.map((goal, i) => i === index ? value : goal)
    }));
  };

  const handleSaveDailyPlan = async () => {
    setIsSaving(true);
    try {
      console.log('Saving daily plan:', dailyPlan);
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedPlans = savedDailyPlans.filter(plan => plan.date !== dailyPlan.date);
      setSavedDailyPlans([...updatedPlans, { ...dailyPlan, id: dailyPlan.id || Date.now().toString() }]);
    } catch (error) {
      console.error('Error saving daily plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredGoals = goals.filter(goal => goal.timeframe === selectedTimeframe);

  const renderReadOnlyDay = () => {
    return (
      // ... (keep the existing renderReadOnlyDay implementation)
    );
  };

  const renderDailyTemplate = () => {
    return (
      // ... (keep the existing renderDailyTemplate implementation)
    );
  };

  return (
    // ... (keep the existing return implementation)
  );
};

export default GoalsPage;
