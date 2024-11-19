import React, { useState } from 'react';
import { Goal } from '../../types';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import { Heart, Lightbulb, Target, Rocket, UtensilsCrossed, GripHorizontal, Plus } from 'lucide-react';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
}

interface DayPlan {
  gratitude: string;
  wordOfDay: string;
  greatDay: string;
  makeItEleven: string;
  topGoals: string[];
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

export default function DayView({ goals, onToggleGoal }: Props) {
  const [plan, setPlan] = useState<DayPlan>({
    gratitude: '',
    wordOfDay: '',
    greatDay: '',
    makeItEleven: '',
    topGoals: [],
    meals: {
      breakfast: '',
      lunch: '',
      dinner: '',
    },
  });

  const [isDragging, setIsDragging] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    if (!over || over.id !== 'top-goals') return;

    const goalId = active.id as string;
    if (!plan.topGoals.includes(goalId) && plan.topGoals.length < 5) {
      setPlan(prev => ({
        ...prev,
        topGoals: [...prev.topGoals, goalId],
      }));
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const removeTopGoal = (goalId: string) => {
    setPlan(prev => ({
      ...prev,
      topGoals: prev.topGoals.filter(id => id !== goalId),
    }));
  };

  const getGoalById = (id: string) => goals.find(goal => goal.id === id);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAddText.trim() && plan.topGoals.length < 5) {
      // For quick-add, we'll create a temporary ID
      const tempId = `temp-${Date.now()}`;
      setPlan(prev => ({
        ...prev,
        topGoals: [...prev.topGoals, tempId],
      }));
      setQuickAddText('');
      setShowQuickAdd(false);
    }
  };

  return (
    <div className="space-y-6">
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

      <DndContext 
        sensors={sensors} 
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Main Content */}
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
                  value={plan.gratitude}
                  onChange={e => setPlan(prev => ({ ...prev, gratitude: e.target.value }))}
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
                  value={plan.wordOfDay}
                  onChange={e => setPlan(prev => ({ ...prev, wordOfDay: e.target.value }))}
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
                  value={plan.greatDay}
                  onChange={e => setPlan(prev => ({ ...prev, greatDay: e.target.value }))}
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
                  value={plan.makeItEleven}
                  onChange={e => setPlan(prev => ({ ...prev, makeItEleven: e.target.value }))}
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
                {plan.topGoals.length < 5 && (
                  <button
                    onClick={() => setShowQuickAdd(true)}
                    className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Quick Add
                  </button>
                )}
              </div>
              <div 
                id="top-goals" 
                className={`space-y-3 min-h-[100px] rounded-lg transition-colors ${
                  isDragging ? 'bg-sky-900/20 border-2 border-dashed border-sky-400/50' : ''
                }`}
              >
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
                {plan.topGoals.map(goalId => {
                  const goal = getGoalById(goalId);
                  const isTemp = goalId.startsWith('temp-');
                  return (
                    <div key={goalId} className="glass-card p-3 flex items-center justify-between">
                      <span>{isTemp ? goalId.replace('temp-', '') : goal?.title}</span>
                      <button
                        onClick={() => removeTopGoal(goalId)}
                        className="text-sky-400/60 hover:text-sky-400"
                      >
                        ×
                      </button>
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
                      value={plan.meals[meal as keyof typeof plan.meals]}
                      onChange={e => setPlan(prev => ({
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

          {/* Weekly Goals Sidebar */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-sky-400" />
              Weekly Goals
              <span className="text-sm text-sky-400/60">(drag to add)</span>
            </h3>
            <div className="space-y-3">
              {goals.map(goal => (
                <div
                  key={goal.id}
                  className="glass-card p-3 cursor-move hover:bg-sky-900/30 transition-colors group"
                  draggable
                >
                  <div className="flex items-start gap-2">
                    <GripHorizontal className="w-4 h-4 text-sky-400/40 group-hover:text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-sm text-sky-400/60 line-clamp-2">
                        {goal.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}
