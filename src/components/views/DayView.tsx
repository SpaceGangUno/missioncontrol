import React, { useState, useEffect } from 'react';
import { Goal } from '../../types';
import { Heart, Lightbulb, Target, Rocket, UtensilsCrossed, Plus, Import, Play, Loader, Save, Edit2, HelpCircle, AlertCircle } from 'lucide-react';
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
  const { dayPlan, saveDayPlan, getDayPlan, startDay, updateStartedDay, updateGoal, addGoal, loading, goalsLoading, dayPlanLoading, error } = useStore();

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
    try {
      const today = new Date().toISOString().split('T')[0];
      getDayPlan(today);
    } catch (error) {
      console.error('Error loading day plan:', error);
      setLocalError('Failed to load day plan');
    }
  }, [getDayPlan]);

  // Update local state when day plan changes
  useEffect(() => {
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

  // Clear error after 5 seconds
  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  // Loading state
  if (loading || goalsLoading || dayPlanLoading || !initialLoadComplete) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-sky-400">Loading your day...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || localError) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 text-rose-400 mb-4">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <h2 className="text-lg font-semibold">Error</h2>
        </div>
        <p className="text-sky-400/80">{error || localError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleUpdateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      await updateGoal(id, updates);
      // Force a save of the day plan to ensure all changes are persisted
      const today = new Date().toISOString().split('T')[0];
      await saveDayPlan({
        ...localPlan,
        date: today
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      setLocalError('Failed to update goal');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* ... [Rest of the component remains unchanged] ... */}
      
      {/* Edit Goal Modal */}
      {editingGoal && (
        <EditGoalForm
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
          onUpdateGoal={handleUpdateGoal}
        />
      )}
    </div>
  );
}
