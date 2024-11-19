import React from 'react';
import { Goal } from '../types';
import GoalList from './GoalList';
import { useStore } from '../lib/store';
import { Heart, Lightbulb, Target, Rocket, Play, Check } from 'lucide-react';

interface Props {
  missions: Goal[];
  onToggleMission: (id: string) => void;
  onUpdateProgress: (id: string, status: Goal['status'], progress: number) => void;
}

export default function MissionList({ missions, onToggleMission, onUpdateProgress }: Props) {
  const { dayPlan, goals } = useStore();

  const getGoalById = (id: string) => goals.find(goal => goal.id === id);

  // Enforce 5 goal maximum for top goals
  const topGoals = dayPlan?.topGoals.slice(0, 5) || [];

  const handleStartDay = () => {
    // Set all top goals to 'in_progress' status
    topGoals.forEach(goalId => {
      const goal = getGoalById(goalId);
      if (goal && goal.status === 'not_started') {
        onUpdateProgress(goalId, 'in_progress', 50);
      }
    });
  };

  const handleSubmitMeals = () => {
    // Handle meal submission
    console.log('Meals submitted');
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Today's Plan */}
      {dayPlan && (
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-6">Today's Mission</h2>
          <div className="glass-card p-6 space-y-6">
            {/* Top Goals */}
            {topGoals.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-sky-100 flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-sky-400" />
                  Top Goals
                </h3>
                <div className="space-y-2">
                  {topGoals.map(goalId => {
                    const goal = getGoalById(goalId);
                    const isTemp = goalId.startsWith('temp-');
                    return (
                      <div key={goalId} className="glass-card p-3">
                        <span>{isTemp ? goalId.replace('temp-', '') : goal?.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily Focus */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dayPlan.gratitude && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-sky-100 mb-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    Grateful for
                  </h4>
                  <p className="text-sky-200/80">{dayPlan.gratitude}</p>
                </div>
              )}
              
              {dayPlan.wordOfDay && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-sky-100 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Word of the Day
                  </h4>
                  <p className="text-sky-200/80">{dayPlan.wordOfDay}</p>
                </div>
              )}
              
              {dayPlan.makeItEleven && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-sky-100 mb-2">
                    <Rocket className="w-4 h-4 text-purple-400" />
                    Making it an 11
                  </h4>
                  <p className="text-sky-200/80">{dayPlan.makeItEleven}</p>
                </div>
              )}
            </div>

            {/* Meals Section */}
            <div>
              <h3 className="text-lg font-semibold text-sky-100 flex items-center gap-2 mb-4">
                <Rocket className="w-5 h-5 text-sky-400" />
                Meals for the day
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Breakfast:
                  </label>
                  <input
                    type="text"
                    className="glass-input w-full"
                    placeholder="Enter breakfast"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Lunch:
                  </label>
                  <input
                    type="text"
                    className="glass-input w-full"
                    placeholder="Enter lunch"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Dinner:
                  </label>
                  <input
                    type="text"
                    className="glass-input w-full"
                    placeholder="Enter dinner"
                  />
                </div>
                <button
                  onClick={handleSubmitMeals}
                  className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] backdrop-blur-sm active:scale-95 touch-manipulation"
                >
                  <Check className="w-5 h-5" />
                  Submit Meals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Missions */}
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-6">Active Missions</h2>
        <GoalList 
          goals={missions} 
          onToggleGoal={onToggleMission} 
          onUpdateProgress={onUpdateProgress}
        />
      </div>

      {/* Start the Day Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-900/95 backdrop-blur-md border-t border-sky-500/10">
        <button
          onClick={handleStartDay}
          className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] backdrop-blur-sm neon-glow active:scale-95 touch-manipulation"
        >
          <Play className="w-6 h-6" />
          Start the Day
        </button>
      </div>

      {/* Bottom Padding to Account for Fixed Button */}
      <div className="h-24" />
    </div>
  );
}
