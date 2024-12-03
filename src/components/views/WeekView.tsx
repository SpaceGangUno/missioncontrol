import React, { useRef, useEffect, useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Plus } from 'lucide-react';
import { Goal } from '../../types';
import { useStore } from '../../lib/store';
import AddGoalForm from '../AddGoalForm';

interface WeekViewProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ selectedDate, onDateChange }) => {
  const { goals, weekPlans, toggleGoal, saveDayPlan, addGoal, getWeekPlans } = useStore();
  const selectedDayRef = useRef<HTMLDivElement>(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [addGoalDate, setAddGoalDate] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Get start of week for the selected date
  const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 0 });

  // Generate array of dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      formattedDate: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd')
    };
  });

  // Scroll to selected day when it changes
  useEffect(() => {
    if (selectedDayRef.current) {
      selectedDayRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [selectedDate]);

  // Load week plans when component mounts or refreshKey changes
  useEffect(() => {
    getWeekPlans();
  }, [getWeekPlans, refreshKey]);

  // Navigate to previous/next week
  const handleNavigateWeek = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    onDateChange(newDate.toISOString().split('T')[0]);
  };

  // Helper function to get goal title
  const getGoalTitle = (goalId: string): string => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.title || '';
  };

  // Helper function to check if goal is completed
  const isGoalCompleted = (goalId: string): boolean => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.completed || false;
  };

  // Handle goal toggle
  const handleToggleGoal = async (goalId: string) => {
    await toggleGoal(goalId);
    setRefreshKey(prev => prev + 1);
  };

  // Handle adding a new goal
  const handleAddGoal = async (goalData: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => {
    try {
      // Create the new goal with all required fields
      const newGoalData = {
        ...goalData,
        description: goalData.description || '',
        priority: goalData.priority || 'medium',
        category: goalData.category || 'personal',
        progress: 0,
        status: 'not_started' as const,
        timeframe: 'weekly' as const
      };

      // Add the goal to the store
      const result = await addGoal(newGoalData);

      if (result && result.id) {
        // Get or create the day plan
        const dayPlan = weekPlans[addGoalDate] || {
          date: addGoalDate,
          gratitude: '',
          wordOfDay: '',
          greatDay: '',
          makeItEleven: '',
          topGoals: [],
          sideQuest: '',
          meals: {
            breakfast: '',
            lunch: '',
            dinner: ''
          }
        };

        // Update the day plan with the new goal
        await saveDayPlan({
          ...dayPlan,
          date: addGoalDate,
          topGoals: [...(dayPlan.topGoals || []), result.id]
        });

        // Refresh the UI
        await getWeekPlans();
        setRefreshKey(prev => prev + 1);
      }

      setShowAddGoal(false);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-10 bg-background/80 backdrop-blur-lg p-4 rounded-xl">
        <button
          onClick={() => handleNavigateWeek('prev')}
          className="p-2 text-[#00f2ff] hover:bg-[#00f2ff]/10 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-lg font-medium text-sky-100">
          Week of {format(weekStart, 'MMM d, yyyy')}
        </div>
        <button
          onClick={() => handleNavigateWeek('next')}
          className="p-2 text-[#00f2ff] hover:bg-[#00f2ff]/10 rounded-xl transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2 mb-6 sticky top-20 z-10 bg-background/80 backdrop-blur-lg p-4 rounded-xl">
        {weekDates.map(({ dayName, dayNumber, formattedDate }) => (
          <button
            key={formattedDate}
            onClick={() => onDateChange(formattedDate)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              formattedDate === selectedDate
                ? 'bg-[#00f2ff] text-black'
                : 'text-[#00f2ff] hover:bg-[#00f2ff]/10'
            }`}
          >
            <span className="text-xs">{dayName}</span>
            <span className="text-lg font-medium">{dayNumber}</span>
          </button>
        ))}
      </div>

      {/* Daily Goals */}
      <div className="space-y-4">
        {weekDates.map(({ formattedDate, dayName, dayNumber }) => {
          const dayPlan = weekPlans[formattedDate];
          const isSelected = formattedDate === selectedDate;
          return (
            <div
              key={formattedDate}
              ref={isSelected ? selectedDayRef : null}
              className={`glass-card p-4 rounded-xl transition-all duration-300 ${
                isSelected ? 'ring-2 ring-[#00f2ff] ring-opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#00f2ff] text-black'
                      : 'bg-[#00f2ff]/10 text-[#00f2ff]'
                  }`}>
                    <div className="text-center">
                      <div className="text-xs">{dayName}</div>
                      <div className="text-lg font-medium leading-none">{dayNumber}</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-sky-100">
                    {format(new Date(formattedDate), 'MMMM d')}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {dayPlan?.topGoals?.length > 0 && (
                    <div className="text-sm text-[#00f2ff]">
                      {dayPlan.topGoals.filter(goalId => isGoalCompleted(goalId)).length} / {dayPlan.topGoals.length}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setAddGoalDate(formattedDate);
                      setShowAddGoal(true);
                    }}
                    className="p-2 text-[#00f2ff] hover:bg-[#00f2ff]/10 rounded-xl transition-colors"
                    title="Add Goal"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {dayPlan?.topGoals?.map((goalId, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleGoal(goalId)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        isGoalCompleted(goalId)
                          ? 'bg-[#00f2ff] text-black'
                          : 'bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff]/20'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <p className={`text-sm ${isGoalCompleted(goalId) ? 'line-through text-indigo-200/60' : 'text-indigo-200/80'}`}>
                      {getGoalTitle(goalId)}
                    </p>
                  </div>
                ))}
                {(!dayPlan?.topGoals || dayPlan.topGoals.length === 0) && (
                  <p className="text-sm text-indigo-200/60">No objectives set for this day</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <AddGoalForm
          onClose={() => setShowAddGoal(false)}
          onAddGoal={handleAddGoal}
        />
      )}
    </div>
  );
};

export default WeekView;
