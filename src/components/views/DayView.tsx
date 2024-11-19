import React, { useState, useEffect } from 'react';
import { Goal } from '../../types';
import { Heart, Lightbulb, Target, Rocket, UtensilsCrossed, Plus, Import, Play, Loader } from 'lucide-react';
import { useStore } from '../../lib/store';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
}

export default function DayView({ goals, onToggleGoal }: Props) {
  const { dayPlan, saveDayPlan, getDayPlan, startDay, error } = useStore();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
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

  // Clear error after 5 seconds
  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  const handleSave = async () => {
    const today = new Date().toISOString().split('T')[0];
    await saveDayPlan({
      date: today,
      ...localPlan,
      // Preserve started status if it exists
      ...(dayPlan?.status === 'started' ? { 
        status: 'started',
        startedAt: dayPlan.startedAt 
      } : {})
    });
  };

  const handleStartDay = async () => {
    try {
      setIsStarting(true);
      setLocalError(null);

      // First save any pending changes
      await handleSave();
      
      // Then start the day
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

  // Auto-save on changes
  useEffect(() => {
    const timeoutId = setTimeout(handleSave, 1000);
    return () => clearTimeout(timeoutId);
  }, [localPlan]);

  const getGoalById = (id: string) => goals.find(goal => goal.id === id);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAddText.trim() && localPlan.topGoals.length < 5) {
      // For quick-add, we'll create a temporary ID
      const tempId = `temp-${quickAddText}`;
      setLocalPlan(prev => ({
        ...prev,
        topGoals: [...prev.topGoals, tempId],
      }));
      setQuickAddText('');
      setShowQuickAdd(false);
    }
  };

  const removeTopGoal = (goalId: string) => {
    setLocalPlan(prev => ({
      ...prev,
      topGoals: prev.topGoals.filter(id => id !== goalId),
    }));
  };

  const handleImportGoal = (goalId: string) => {
    if (!localPlan.topGoals.includes(goalId) && localPlan.topGoals.length < 5) {
      setLocalPlan(prev => ({
        ...prev,
        topGoals: [...prev.topGoals, goalId],
      }));
    }
  };

  // Check if day is started
  const isStarted = dayPlan?.status === 'started';

  return (
    <div className="space-y-6 pb-24">
      {/* Error Message */}
      {localError && (
        <div className="fixed top-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
          {localError}
        </div>
      )}

      {/* Daily Header */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-sky-100 mb-4">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Reflection Section */}
        <div className="glass-card p-6 space-y-6">
          {/* Gratitude */}
          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-sky-100 mb-3">
              <Heart className="w-5 h-5 text-rose-400" />
              I'm grateful for:
            </label>
            <textarea
              value={localPlan.gratitude}
              onChange={e => setLocalPlan(prev => ({ ...prev, gratitude: e.target.value }))}
              className="glass-input min-h-[80px]"
              placeholder="Write what you're grateful for..."
            />
          </div>

          {/* Word of the Day */}
          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-sky-100 mb-3">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Word of the day:
            </label>
            <input
              type="text"
              value={localPlan.wordOfDay}
              onChange={e => setLocalPlan(prev => ({ ...prev, wordOfDay: e.target.value }))}
              className="glass-input"
              placeholder="Enter your word of the day..."
            />
          </div>

          {/* Great Day */}
          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-sky-100 mb-3">
              <Target className="w-5 h-5 text-emerald-400" />
              Today will be great if I:
            </label>
            <textarea
              value={localPlan.greatDay}
              onChange={e => setLocalPlan(prev => ({ ...prev, greatDay: e.target.value }))}
              className="glass-input min-h-[80px]"
              placeholder="What would make today great?"
            />
          </div>

          {/* Make it Eleven */}
          <div>
            <label className="flex items-center gap-2 text-lg font-semibold text-sky-100 mb-3">
              <Rocket className="w-5 h-5 text-purple-400" />
              I'll make today an 11 by:
            </label>
            <textarea
              value={localPlan.makeItEleven}
              onChange={e => setLocalPlan(prev => ({ ...prev, makeItEleven: e.target.value }))}
              className="glass-input min-h-[80px]"
              placeholder="How will you exceed expectations today?"
            />
          </div>
        </div>

        {/* Top 5 Goals Section */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-sky-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-400" />
              Top 5 Goals
            </h3>
            {!isStarted && (
              <div className="flex gap-2">
                {localPlan.topGoals.length < 5 && (
                  <>
                    <button
                      onClick={() => setShowQuickAdd(true)}
                      className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors px-3 py-1.5 rounded-md hover:bg-sky-400/10"
                    >
                      <Plus className="w-4 h-4" />
                      Quick Add
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors px-3 py-1.5 rounded-md hover:bg-sky-400/10"
                    >
                      <Import className="w-4 h-4" />
                      Import Goals
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="space-y-3 min-h-[100px]">
            {showQuickAdd && (
              <form onSubmit={handleQuickAdd} className="flex gap-2">
                <input
                  type="text"
                  value={quickAddText}
                  onChange={(e) => setQuickAddText(e.target.value)}
                  placeholder="Enter a quick goal..."
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
              const goal = getGoalById(goalId);
              const isTemp = goalId.startsWith('temp-');
              return (
                <div key={goalId} className="glass-card p-3 flex items-center justify-between">
                  <span>{isTemp ? goalId.replace('temp-', '') : goal?.title}</span>
                  {!isStarted && (
                    <button
                      onClick={() => removeTopGoal(goalId)}
                      className="text-sky-400/60 hover:text-sky-400"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Meals Section */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-sky-100 mb-4 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
            Meals for the day
          </h3>
          <div className="space-y-4">
            {['breakfast', 'lunch', 'dinner'].map((meal) => (
              <div key={meal}>
                <label className="block text-sm font-medium text-sky-100 mb-2 capitalize">
                  {meal}:
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
                  placeholder={`Enter your ${meal} plan...`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start Day Button */}
      {!isStarted && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-900/95 backdrop-blur-md border-t border-sky-500/10">
          <div className="max-w-2xl mx-auto">
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
              {isStarting ? 'Starting Day...' : 'Start the Day'}
            </button>
          </div>
        </div>
      )}

      {/* Import Goals Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-sky-100">Import Weekly Goals</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-sky-400/60 hover:text-sky-400 text-xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {goals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => {
                    handleImportGoal(goal.id);
                    if (localPlan.topGoals.length === 4) {
                      setShowImportModal(false);
                    }
                  }}
                  disabled={localPlan.topGoals.includes(goal.id)}
                  className="w-full glass-card p-3 text-left hover:bg-sky-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}
