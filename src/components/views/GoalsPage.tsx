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
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('daily');
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

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const mockPlans: DailyPlan[] = [
          {
            id: '1',
            date: new Date().toISOString().split('T')[0],
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
          }
        ];
        setSavedDailyPlans(mockPlans);
        
        const existingPlan = mockPlans.find(plan => plan.date === selectedDate);
        if (existingPlan) {
          setDailyPlan(existingPlan);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []); // Run only once when component mounts

  // Load saved plans when timeframe changes to daily
  useEffect(() => {
    if (selectedTimeframe === 'daily') {
      const loadSavedPlans = async () => {
        setIsLoading(true);
        try {
          const existingPlan = savedDailyPlans.find(plan => plan.date === selectedDate);
          if (existingPlan) {
            setDailyPlan(existingPlan);
          }
        } catch (error) {
          console.error('Error loading saved plans:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadSavedPlans();
    }
  }, [selectedTimeframe, selectedDate, savedDailyPlans]);

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
      <div className="space-y-6 sm:space-y-8">
        {/* Date Navigation */}
        <div className="mobile-date-nav glass-card">
          <button
            onClick={() => handleNavigateDay('prev')}
            className="mobile-nav-button"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300" />
          </button>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="glass-input dyslexic-input py-2 px-3 sm:px-4 rounded-xl"
            />
          </div>

          <button
            onClick={() => handleNavigateDay('next')}
            className="mobile-nav-button"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300" />
          </button>
        </div>

        <div className="glass-card dyslexic-card rounded-xl relative">
          <button
            onClick={() => setIsEditMode(true)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 hover:bg-sky-500/10 rounded-xl transition-colors text-sky-300 hover:text-sky-400"
          >
            <Edit2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="space-y-8 sm:space-y-12">
            {/* Gratitude */}
            <div className="mobile-input-group">
              <div className="mobile-icon">
                🙏
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="dyslexic-heading text-sky-100">Gratitude</h3>
                <p className="dyslexic-text text-sky-300">{dailyPlan.gratitude || 'No gratitude entry for today'}</p>
              </div>
            </div>

            {/* Make it an 11 */}
            <div className="mobile-input-group">
              <div className="mobile-icon">
                💫
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="dyslexic-heading text-sky-100">Make it an 11</h3>
                <p className="dyslexic-text text-sky-300">{dailyPlan.makeItEleven || 'No entry for making today an 11'}</p>
              </div>
            </div>

            {/* Great Day Goals */}
            <div className="mobile-input-group">
              <div className="mobile-icon">
                ⭐️
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="dyslexic-heading text-sky-100">Great Day Goals</h3>
                <p className="dyslexic-text text-sky-300">{dailyPlan.greatDay || 'No great day goals set'}</p>
              </div>
            </div>

            {/* Top 5 Goals */}
            <div className="mobile-input-group">
              <div className="mobile-icon">
                🎯
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="dyslexic-heading text-sky-100">Top 5 Goals</h3>
                <div className="space-y-3 sm:space-y-4">
                  {dailyPlan.topGoals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-300 text-lg sm:text-xl">
                        {index + 1}
                      </div>
                      <p className="dyslexic-text text-sky-300">{goal || 'No goal set'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Quest */}
            <div className="mobile-input-group">
              <div className="mobile-icon">
                ⚔️
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="dyslexic-heading text-sky-100">Side Quest</h3>
                <p className="dyslexic-text text-sky-300">{dailyPlan.sideQuest || 'No side quest set'}</p>
              </div>
            </div>

            {/* Notes */}
            <div className="mobile-input-group">
              <div className="mobile-icon">
                📝
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="dyslexic-heading text-sky-100">Notes</h3>
                <p className="dyslexic-text text-sky-300 whitespace-pre-wrap">{dailyPlan.notes || 'No notes for today'}</p>
              </div>
            </div>

            {/* Meals */}
            <div className="mobile-input-group">
              <div className="mobile-icon">
                🍽️
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="dyslexic-heading text-sky-100">Meals</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="text-lg sm:text-xl text-sky-300/80 mb-1 sm:mb-2">Breakfast</h4>
                    <p className="dyslexic-text text-sky-300">{dailyPlan.meals.breakfast || 'No breakfast planned'}</p>
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl text-sky-300/80 mb-1 sm:mb-2">Lunch</h4>
                    <p className="dyslexic-text text-sky-300">{dailyPlan.meals.lunch || 'No lunch planned'}</p>
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl text-sky-300/80 mb-1 sm:mb-2">Dinner</h4>
                    <p className="dyslexic-text text-sky-300">{dailyPlan.meals.dinner || 'No dinner planned'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDailyTemplate = () => {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Date Navigation */}
        <div className="mobile-date-nav glass-card">
          <button
            onClick={() => handleNavigateDay('prev')}
            className="mobile-nav-button"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300" />
          </button>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="glass-input dyslexic-input py-2 px-3 sm:px-4 rounded-xl"
            />
          </div>

          <button
            onClick={() => handleNavigateDay('next')}
            className="mobile-nav-button"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 sm:py-12 text-sky-300 dyslexic-text">
            Loading...
          </div>
        ) : (
          <div className="glass-card dyslexic-card rounded-xl">
            <div className="space-y-8 sm:space-y-12">
              {/* Gratitude */}
              <div className="mobile-input-group">
                <div className="mobile-icon">
                  🙏
                </div>
                <div className="flex-1 min-w-0">
                  <label className="dyslexic-label block">
                    Gratitude
                  </label>
                  <textarea
                    value={dailyPlan.gratitude}
                    onChange={(e) => handleDailyPlanChange('gratitude', e.target.value)}
                    className="glass-input dyslexic-input min-h-[120px]"
                    placeholder="..."
                  />
                </div>
              </div>

              {/* Make it an 11 */}
              <div className="mobile-input-group">
                <div className="mobile-icon">
                  💫
                </div>
                <div className="flex-1 min-w-0">
                  <label className="dyslexic-label block">
                    Make it an 11
                  </label>
                  <textarea
                    value={dailyPlan.makeItEleven}
                    onChange={(e) => handleDailyPlanChange('makeItEleven', e.target.value)}
                    className="glass-input dyslexic-input min-h-[120px]"
                    placeholder="..."
                  />
                </div>
              </div>

              {/* Great Day Goals */}
              <div className="mobile-input-group">
                <div className="mobile-icon">
                  ⭐️
                </div>
                <div className="flex-1 min-w-0">
                  <label className="dyslexic-label block">
                    Great Day Goals
                  </label>
                  <textarea
                    value={dailyPlan.greatDay}
                    onChange={(e) => handleDailyPlanChange('greatDay', e.target.value)}
                    className="glass-input dyslexic-input min-h-[120px]"
                    placeholder="..."
                  />
                </div>
              </div>

              {/* Top 5 Goals */}
              <div className="mobile-input-group">
                <div className="mobile-icon">
                  🎯
                </div>
                <div className="flex-1 min-w-0">
                  <label className="dyslexic-label block">
                    Top 5 Goals
                  </label>
                  <div className="space-y-3 sm:space-y-4">
                    {dailyPlan.topGoals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-300 text-lg sm:text-xl">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={goal}
                          onChange={(e) => handleTopGoalChange(index, e.target.value)}
                          className="glass-input dyslexic-input flex-1"
                          placeholder="..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side Quest */}
              <div className="mobile-input-group">
                <div className="mobile-icon">
                  ⚔️
                </div>
                <div className="flex-1 min-w-0">
                  <label className="dyslexic-label block">
                    Side Quest
                  </label>
                  <textarea
                    value={dailyPlan.sideQuest}
                    onChange={(e) => handleDailyPlanChange('sideQuest', e.target.value)}
                    className="glass-input dyslexic-input min-h-[120px]"
                    placeholder="..."
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mobile-input-group">
                <div className="mobile-icon">
                  📝
                </div>
                <div className="flex-1 min-w-0">
                  <label className="dyslexic-label block">
                    Notes
                  </label>
                  <textarea
                    value={dailyPlan.notes}
                    onChange={(e) => handleDailyPlanChange('notes', e.target.value)}
                    className="glass-input dyslexic-input min-h-[160px]"
                    placeholder="..."
                  />
                </div>
              </div>

              {/* Meals */}
              <div className="mobile-input-group">
                <div className="mobile-icon">
                  🍽️
                </div>
                <div className="flex-1 min-w-0">
                  <label className="dyslexic-label block">
                    Meals
                  </label>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="text-lg sm:text-xl text-sky-300/80 mb-1 sm:mb-2 block">Breakfast</label>
                      <input
                        type="text"
                        value={dailyPlan.meals.breakfast}
                        onChange={(e) => handleMealChange('breakfast', e.target.value)}
                        className="glass-input dyslexic-input"
                        placeholder="..."
                      />
                    </div>
                    <div>
                      <label className="text-lg sm:text-xl text-sky-300/80 mb-1 sm:mb-2 block">Lunch</label>
                      <input
                        type="text"
                        value={dailyPlan.meals.lunch}
                        onChange={(e) => handleMealChange('lunch', e.target.value)}
                        className="glass-input dyslexic-input"
                        placeholder="..."
                      />
                    </div>
                    <div>
                      <label className="text-lg sm:text-xl text-sky-300/80 mb-1 sm:mb-2 block">Dinner</label>
                      <input
                        type="text"
                        value={dailyPlan.meals.dinner}
                        onChange={(e) => handleMealChange('dinner', e.target.value)}
                        className="glass-input dyslexic-input"
                        placeholder="..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button
                  onClick={() => setIsEditMode(false)}
                  className="mobile-button text-sky-300 hover:bg-sky-500/10"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleSaveDailyPlan();
                    setIsEditMode(false);
                  }}
                  disabled={isSaving}
                  className="mobile-button bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-50"
                >
                  <Save className="w-5 h-5 sm:w-6 sm:h-6" />
                  {isSaving ? 'Saving...' : 'Save Day'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mobile-container">
      {/* Header Section */}
      <div className="mobile-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="dyslexic-heading text-3xl sm:text-4xl text-sky-100 mb-2 sm:mb-3">Goals</h1>
          <div className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl text-sky-300">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>{completedGoals} of {totalGoals} goals completed ({Math.round(progressPercentage)}%)</span>
          </div>
        </div>
        {selectedTimeframe !== 'daily' && (
          <button
            onClick={() => setShowAddGoal(true)}
            className="mobile-button bg-sky-500 hover:bg-sky-600 text-white"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            Add Goal
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="mobile-tabs">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => {
              setSelectedTimeframe(timeframe);
              if (timeframe === 'daily') {
                setIsEditMode(false);
              }
            }}
            className={`mobile-tab ${
              selectedTimeframe === timeframe 
                ? 'bg-sky-500 text-white' 
                : 'text-sky-300 hover:bg-sky-900/50'
            }`}
          >
            {timeframe}
          </button>
        ))}
      </div>

      {/* Content Section */}
      {selectedTimeframe === 'daily' ? (
        isEditMode ? renderDailyTemplate() : renderReadOnlyDay()
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className="mobile-goal-card glass-card"
            >
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => handleToggleGoal(goal.id)}
                  className="mobile-checkbox"
                />
                <div className="min-w-0">
                  <h3 className={`dyslexic-text truncate ${goal.completed ? 'line-through text-sky-300/60' : 'text-sky-100'}`}>
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-base sm:text-lg text-sky-300/80 mt-1 line-clamp-2">{goal.description}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-base sm:text-lg flex-1 sm:flex-none text-center
                  ${goal.priority === 'high' ? 'bg-rose-500/20 text-rose-300' :
                    goal.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'}`}>
                  {goal.priority}
                </span>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="p-2 text-sky-300/60 hover:text-sky-300 hover:bg-white/5 rounded-lg transition-colors flex-1 sm:flex-none"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredGoals.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-sky-300/60 dyslexic-text">
              No {selectedTimeframe} goals yet. Click the "Add Goal" button to create one.
            </div>
          )}
        </div>
      )}

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

export default GoalsPage;
