import React from 'react';
import { Goal } from '../types';
import GoalList from './GoalList';
import { useStore } from '../lib/store';
import { Heart, Lightbulb, Target, Rocket, Loader } from 'lucide-react';

interface Props {
  missions: Goal[];
  onToggleMission: (id: string) => void;
  onUpdateProgress: (id: string, status: Goal['status'], progress: number) => void;
}

export default function MissionList({ missions, onToggleMission, onUpdateProgress }: Props) {
  const { dayPlan, goals, loading, goalsLoading, dayPlanLoading } = useStore();
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

  // Set initial load complete when both goals and day plan are loaded
  React.useEffect(() => {
    if (goals.length > 0 && dayPlan) {
      setInitialLoadComplete(true);
    }
  }, [goals, dayPlan]);

  const getGoalById = (id: string) => goals.find(goal => goal.id === id);

  // Enforce 5 goal maximum for top goals
  const topGoals = dayPlan?.topGoals.slice(0, 5) || [];

  // Loading state
  if (loading || goalsLoading || dayPlanLoading || !initialLoadComplete) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-sky-400">Loading your missions...</p>
        </div>
      </div>
    );
  }

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
                {Object.entries(dayPlan.meals || {}).map(([meal, value]) => (
                  <div key={meal}>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}:
                    </label>
                    <div className="glass-input w-full px-3 py-2">
                      {value || `No ${meal} planned yet`}
                    </div>
                  </div>
                ))}
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
    </div>
  );
}
