import React, { useState, useEffect } from 'react';
import { Goal } from '../../types';
import { Heart, Lightbulb, Target, Rocket, UtensilsCrossed, Plus, Import, Play, Loader, Save, Edit2, HelpCircle } from 'lucide-react';
import { useStore } from '../../lib/store';
import EditGoalForm from '../EditGoalForm';

// ... [Previous interfaces and Tooltip component remain unchanged]

export default function DayView({ goals, onToggleGoal }: Props) {
  // ... [All state and effects remain unchanged]

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

      {/* Daily Reflection Section - Moved above goals */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-sky-100">Daily Reflection</h3>
          <Tooltip text="Take a moment to reflect and set your intentions for the day" />
        </div>

        {/* Gratitude - Updated text */}
        <div>
          <label className="flex items-center gap-2 text-lg font-semibold text-sky-100 mb-3">
            <Heart className="w-5 h-5 text-rose-400" />
            What are you grateful for today?
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

      {/* Main Goals Section */}
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
