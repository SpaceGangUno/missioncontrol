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
  const { dayPlan, saveDayPlan, getDayPlan, startDay, updateStartedDay, error, updateGoal, addGoal } = useStore();
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
    const today = new Date().toISOString().split('T')[0];
    getDayPlan(today);
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
        meals: dayPlan.meals || {
          breakfast: '',
          lunch: '',
          dinner: '',
        },
      });
    }
  }, [dayPlan]);

  // Handle pending quick add when goals update
  useEffect(() => {
    if (pendingQuickAdd) {
      const newGoal = goals.find(g => g.title === pendingQuickAdd);
      if (newGoal) {
        setLocalPlan(prev => {
          const updatedGoals = [...prev.topGoals, newGoal.id];
          const today = new Date().toISOString().split('T')[0];
          
          if (dayPlan?.status === 'started') {
            updateStartedDay({
              date: today,
              ...prev,
              topGoals: updatedGoals,
            });
          } else {
            saveDayPlan({
              date: today,
              ...prev,
              topGoals: updatedGoals,
            });
          }

          return {
            ...prev,
            topGoals: updatedGoals,
          };
        });

        setPendingQuickAdd(null);
      }
    }
  }, [goals, pendingQuickAdd, dayPlan, updateStartedDay, saveDayPlan]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const today = new Date().toISOString().split('T')[0];
      if (dayPlan?.status === 'started') {
        await updateStartedDay({
          date: today,
          ...localPlan,
        });
      } else {
        await saveDayPlan({
          date: today,
          ...localPlan,
        });
      }
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving day plan:', error);
      setLocalError('Failed to save changes. Please try again.');
      setIsSaving(false);
    }
  };

  const handleStartDay = async () => {
    try {
      setIsStarting(true);
      setLocalError(null);
      await handleSave();
      const today = new Date().toISOString().split('T')[0];
      await startDay({
        date: today,
        ...localPlan,
        status: 'started',
        startedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error starting day:', error);
      setLocalError('Failed to start day. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAddText.trim() && localPlan.topGoals.length < 5) {
      try {
        const newGoal = {
          title: quickAddText.trim(),
          description: '',
          priority: 'medium' as const,
          category: 'personal',
          status: 'not_started' as const,
          progress: 0
        };
        
        await addGoal(newGoal);
        setPendingQuickAdd(newGoal.title);
        setQuickAddText('');
        setShowQuickAdd(false);
      } catch (error) {
        console.error('Error adding quick goal:', error);
        setLocalError('Failed to add goal. Please try again.');
      }
    }
  };

  const removeTopGoal = async (goalId: string) => {
    try {
      setLocalPlan(prev => {
        const updatedGoals = prev.topGoals.filter(id => id !== goalId);
        const today = new Date().toISOString().split('T')[0];
        
        if (dayPlan?.status === 'started') {
          updateStartedDay({
            date: today,
            ...prev,
            topGoals: updatedGoals,
          });
        } else {
          saveDayPlan({
            date: today,
            ...prev,
            topGoals: updatedGoals,
          });
        }

        return {
          ...prev,
          topGoals: updatedGoals,
        };
      });
    } catch (error) {
      console.error('Error removing goal:', error);
      setLocalError('Failed to remove goal. Please try again.');
    }
  };

  const handleImportGoal = async (goalId: string) => {
    if (!localPlan.topGoals.includes(goalId) && localPlan.topGoals.length < 5) {
      try {
        setLocalPlan(prev => {
          const updatedGoals = [...prev.topGoals, goalId];
          const today = new Date().toISOString().split('T')[0];
          
          if (dayPlan?.status === 'started') {
            updateStartedDay({
              date: today,
              ...prev,
              topGoals: updatedGoals,
            });
          } else {
            saveDayPlan({
              date: today,
              ...prev,
              topGoals: updatedGoals,
            });
          }

          return {
            ...prev,
            topGoals: updatedGoals,
          };
        });

        if (localPlan.topGoals.length === 4) {
          setShowImportModal(false);
        }
      } catch (error) {
        console.error('Error importing goal:', error);
        setLocalError('Failed to import goal. Please try again.');
      }
    }
  };

  const handleUpdateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      await updateGoal(id, updates);
      setEditingGoal(null);
      // Force a save of the day plan to ensure all changes are persisted
      await handleSave();
    } catch (error) {
      console.error('Error updating goal:', error);
      setLocalError('Failed to update goal. Please try again.');
    }
  };

  const handleToggleGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    const isCompleted = goal?.completed || goal?.status === 'completed';
    setAnimatingGoal({
      id: goalId,
      action: isCompleted ? 'landing' : 'takeoff'
    });
    onToggleGoal(goalId);
  };

  // Sort goals to prioritize in_progress goals
  const sortedGoals = [...goals].sort((a: Goal, b: Goal) => {
    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
    if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;
    return 0;
  });

  // Check if day is started
  const isStarted = dayPlan?.status === 'started';

  return (
    <div className="space-y-6 pb-24">
      <style>
        {`
          @keyframes blastOff {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-100px) rotate(45deg); opacity: 0; }
          }
          @keyframes landing {
            0% { transform: translateY(-100px) rotate(45deg); opacity: 0; }
            100% { transform: translateY(0) rotate(0deg); opacity: 1; }
          }
          .blast-off { animation: blastOff 1s ease-out forwards; }
          .landing { animation: landing 1s ease-in forwards; }
        `}
      </style>

      {/* Error Message */}
      {localError && (
        <div className="fixed top-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
          {localError}
        </div>
      )}

      {/* Daily Header */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-sky-100">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>
      </div>

      {/* Main Goals Section - Moved to top for priority */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-sky-100">Today's Goals</h3>
            <Tooltip text="Set up to 5 main goals to focus on today. Click the rocket to mark them complete!" />
          </div>
          <div className="flex gap-2">
            {localPlan.topGoals.length < 5 && (
              <>
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors px-3 py-1.5 rounded-md hover:bg-sky-400/10"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors px-3 py-1.5 rounded-md hover:bg-sky-400/10"
                >
                  <Import className="w-4 h-4" />
                  Add Existing
                </button>
              </>
            )}
          </div>
        </div>
        <div className="space-y-3 min-h-[100px]">
          {showQuickAdd && (
            <form onSubmit={handleQuickAdd} className="flex gap-2">
              <input
                type="text"
                value={quickAddText}
                onChange={(e) => setQuickAddText(e.target.value)}
                placeholder="What would you like to accomplish today?"
                className="glass-input flex-1"
                autoFocus
              />
              <button 
                type="submit"
                className="px-3 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
              >
                Add
              </button>
              <button 
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="px-3 py-2 bg-sky-900/50 text-white rounded hover:bg-sky-900/70 transition-colors"
              >
                Cancel
              </button>
            </form>
          )}
          {localPlan.topGoals.map(goalId => {
            const goal = goals.find(g => g.id === goalId);
            const isCurrentDayTask = goal?.status === 'in_progress';
            const isCompleted = goal?.completed || goal?.status === 'completed';
            const isAnimating = animatingGoal?.id === goalId;
            const animationClass = isAnimating 
              ? animatingGoal.action === 'takeoff' 
                ? 'blast-off' 
                : 'landing'
              : '';

            return (
              <div 
                key={goalId} 
                className={`glass-card p-3 flex items-center justify-between ${
                  isCurrentDayTask ? 'border-l-4 border-sky-400' : ''
                } ${isCompleted ? 'opacity-50' : ''}`}
              >
                <span className={isCompleted ? 'line-through' : ''}>{goal?.title || goalId}</span>
                <div className="flex items-center gap-2">
                  {goal && (
                    <>
                      <button
                        onClick={() => handleToggleGoal(goal.id)}
                        className={`text-sky-400/60 hover:text-sky-400 p-1 ${isCompleted ? 'text-green-400' : ''}`}
                        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                      >
                        <Rocket 
                          className={`w-4 h-4 ${animationClass}`}
                        />
                      </button>
                      <button
                        onClick={() => setEditingGoal(goal)}
                        className="text-sky-400/60 hover:text-sky-400 p-1"
                        aria-label="Edit goal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => removeTopGoal(goalId)}
                    className="text-sky-400/60 hover:text-sky-400 p-1"
                    aria-label="Remove goal"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Reflection Section */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-sky-100">Daily Reflection</h3>
          <Tooltip text="Take a moment to reflect and set your intentions for the day" />
        </div>

        {/* Gratitude */}
        <div>
          <label className="flex items-center gap-2 text-lg font-semibold text-sky-100 mb-3">
            <Heart className="w-5 h-5 text-rose-400" />
            What makes you smile today?
          </label>
          <textarea
            value={localPlan.gratitude}
            onChange={e => setLocalPlan(prev => ({ ...prev, gratitude: e.target.value }))}
            className="glass-input min-h-[80px]"
            placeholder="List a few things you're thankful for..."
          />
        </div>

        {/* Word of the Day */}
        <div>
          <label className="flex items-center gap-2 text-lg font-semibold text-sky-100 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Today's inspiring word
          </label>
          <input
            type="text"
            value={localPlan.wordOfDay}
            onChange={e => setLocalPlan(prev => ({ ...prev, wordOfDay: e.target.value }))}
            className="glass-input"
            placeholder="Choose a word that inspires you today..."
          />
        </div>

        {/* Great Day */}
        <div>
          <label className="flex items-center gap-2 text-lg font-semibold text-sky-100 mb-3">
            <Target className="w-5 h-5 text-emerald-400" />
            What would make today great?
          </label>
          <textarea
            value={localPlan.greatDay}
            onChange={e => setLocalPlan(prev => ({ ...prev, greatDay: e.target.value }))}
            className="glass-input min-h-[80px]"
            placeholder="List 1-3 things that would make today wonderful..."
          />
        </div>

        {/* Make it Special */}
        <div>
          <label className="flex items-center gap-2 text-lg font-semibold text-sky-100 mb-3">
            <Rocket className="w-5 h-5 text-purple-400" />
            One amazing thing I'll do today
          </label>
          <textarea
            value={localPlan.makeItEleven}
            onChange={e => setLocalPlan(prev => ({ ...prev, makeItEleven: e.target.value }))}
            className="glass-input min-h-[80px]"
            placeholder="What's one special thing you'll do to make today extraordinary?"
          />
        </div>
      </div>

      {/* Meal Planning Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <UtensilsCrossed className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-sky-100">Meal Planning</h3>
          <Tooltip text="Plan your meals to stay energized throughout the day" />
        </div>
        <div className="space-y-4">
          {[
            { meal: 'breakfast', label: 'Morning Energy' },
            { meal: 'lunch', label: 'Midday Fuel' },
            { meal: 'dinner', label: 'Evening Nourishment' }
          ].map(({ meal, label }) => (
            <div key={meal}>
              <label className="block text-sm font-medium text-sky-100 mb-2">
                {label}:
              </label>
              <input
                type="text"
                value={localPlan.meals[meal as keyof typeof localPlan.meals]}
                onChange={e => setLocalPlan(prev => ({
                  ...prev,
                  meals: {
                    ...prev.meals,
                    [meal]: e.target.value
                  }
                }))}
                className="glass-input"
                placeholder={`What's on the menu for ${meal}?`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Fixed Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-900/90 backdrop-blur-xl border-t border-sky-500/30 shadow-lg shadow-navy-900/50 z-[70]">
        <div className="max-w-2xl mx-auto flex gap-3 justify-end">
          {isStarted ? (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-white rounded-lg transition-all hover:scale-105 backdrop-blur-sm active:scale-95 touch-manipulation min-w-[100px]"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          ) : (
            <button
              onClick={handleStartDay}
              disabled={isStarting}
              className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] backdrop-blur-sm neon-glow active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isStarting ? (
                <Loader className="w-6 h-6 animate-spin" />
              ) : (
                <Play className="w-6 h-6" />
              )}
              {isStarting ? 'Getting Ready...' : 'Begin Your Day'}
            </button>
          )}
        </div>
      </div>

      {/* Import Goals Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[80]">
          <div className="glass-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-sky-100">Choose from Your Goals</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-sky-400/60 hover:text-sky-400 text-xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {sortedGoals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => handleImportGoal(goal.id)}
                  disabled={localPlan.topGoals.includes(goal.id)}
                  className={`w-full glass-card p-3 text-left hover:bg-sky-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    goal.status === 'in_progress' ? 'border-l-4 border-sky-400' : ''
                  }`}
                >
                  <div className="font-medium">{goal.title}</div>
                  <div className="text-sm text-sky-400/60 line-clamp-2">
                    {goal.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
