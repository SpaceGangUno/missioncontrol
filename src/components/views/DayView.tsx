import React, { useState, useEffect } from 'react';
import { Goal } from '../../types';
import { Heart, Lightbulb, Target, Rocket, UtensilsCrossed, Plus, Import, Play, Loader, Save, Edit2, HelpCircle } from 'lucide-react';
import { useStore } from '../../lib/store';
import EditGoalForm from '../EditGoalForm';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
}

interface AnimatingGoal {
  id: string;
  action: 'takeoff' | 'landing';
}

// Tooltip component for help text
function Tooltip({ text }: { text: string }) {
  return (
    <div className="group relative">
      <HelpCircle className="w-4 h-4 text-sky-400/60 hover:text-sky-400" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-navy-800/95 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {text}
      </div>
    </div>
  );
}

export default function DayView({ goals, onToggleGoal }: Props) {
  console.log('DayView rendering with goals:', goals); // Debug log

  const { dayPlan, saveDayPlan, getDayPlan, startDay, updateStartedDay, updateGoal, addGoal, loading, goalsLoading, dayPlanLoading } = useStore();
  console.log('DayView store state - dayPlan:', dayPlan, 'loading:', loading, 'goalsLoading:', goalsLoading, 'dayPlanLoading:', dayPlanLoading); // Debug log

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [pendingQuickAdd, setPendingQuickAdd] = useState<string | null>(null);
  const [animatingGoal, setAnimatingGoal] = useState<AnimatingGoal | null>(null);
  const [localPlan, setLocalPlan] = useState({
    gratitude: '',
    wordOfDay: '',
    greatDay: '',
    makeItEleven: '',
    topGoals: [] as string[],
    meals: {
      breakfast: '',
      lunch: '',
      dinner: '',
    },
  });

  // Effect for animation
  useEffect(() => {
    if (animatingGoal) {
      const timer = setTimeout(() => {
        setAnimatingGoal(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [animatingGoal]);

  // Load day plan on mount
  useEffect(() => {
    console.log('Loading day plan...'); // Debug log
    const today = new Date().toISOString().split('T')[0];
    getDayPlan(today);
  }, [getDayPlan]);

  // Update local state when day plan changes
  useEffect(() => {
    console.log('Day plan updated:', dayPlan); // Debug log
    if (dayPlan) {
      setLocalPlan({
        gratitude: dayPlan.gratitude || '',
        wordOfDay: dayPlan.wordOfDay || '',
        greatDay: dayPlan.greatDay || '',
        makeItEleven: dayPlan.makeItEleven || '',
        topGoals: dayPlan.topGoals || [],
        meals: {
          breakfast: dayPlan.meals?.breakfast || '',
          lunch: dayPlan.meals?.lunch || '',
          dinner: dayPlan.meals?.dinner || '',
        },
      });
      setInitialLoadComplete(true);
    }
  }, [dayPlan]);

  // Rest of the component remains unchanged...

  // Loading state
  if (loading || goalsLoading || dayPlanLoading || !initialLoadComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-sky-400">Loading your day...</p>
        </div>
      </div>
    );
  }

  // Rest of the component remains unchanged...
  return (
    // ... [Rest of the JSX remains unchanged]
  );
}
