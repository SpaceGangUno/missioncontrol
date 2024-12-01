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
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

interface GoalWithTimeframe extends Goal {
  timeframe: TimeFrame;
}

export default function GoalsPage(): JSX.Element {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('monthly');
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

  useEffect(() => {
    const loadSavedPlans = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockPlans: DailyPlan[] = [
          {
            id: '1',
            date: new Date().toISOString().split('T')[0],
            gratitude: 'Sample gratitude entry',
            makeItEleven: 'Sample make it eleven entry',
            greatDay: 'Sample great day entry',
            topGoals: ['Goal 1', 'Goal 2', 'Goal 3', 'Goal 4', 'Goal 5'],
            sideQuest: 'Sample side quest',
            meals: {
              breakfast: 'Oatmeal',
              lunch: 'Salad',
              dinner: 'Grilled chicken'
            }
          }
        ];
        setSavedDailyPlans(mockPlans);
        
        const existingPlan = mockPlans.find(plan => plan.date === selectedDate);
        if (existingPlan) {
          setDailyPlan(existingPlan);
        }
      } catch (error) {
        console.error('Error loading saved plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedTimeframe === 'daily') {
      loadSavedPlans();
    }
  }, [selectedTimeframe, selectedDate]);

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

  const renderReadOnlyDay = () => (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4 glass-card p-4 rounded-lg">
        <button
          onClick={() => handleNavigateDay('prev')}
          className="p-2 hover:bg-sky-500/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-sky-300" />
        </button>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-300" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="glass-input py-1 px-2"
          />
        </div>

        <button
          onClick={() => handleNavigateDay('next')}
          className="p-2 hover:bg-sky-500/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-sky-300" />
        </button>
      </div>

      <div className="glass-card p-6 rounded-lg relative">
        <button
          onClick={() => setIsEditMode(true)}
          className="absolute top-4 right-4 p-2 hover:bg-sky-500/10 rounded-lg transition-colors text-sky-300 hover:text-sky-400"
        >
          <Edit2 className="w-5 h-5" />
        </button>

        <div className="space-y-8">
          {/* Gratitude */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
              🙏
            </div>
            <div>
              <h3 className="text-xl font-medium text-sky-100 mb-2">Gratitude</h3>
              <p className="text-lg text-sky-300 leading-relaxed">{dailyPlan.gratitude || 'No gratitude entry for today'}</p>
            </div>
          </div>

          {/* Make it an 11 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
              💫
            </div>
            <div>
              <h3 className="text-xl font-medium text-sky-100 mb-2">Make it an 11</h3>
              <p className="text-lg text-sky-300 leading-relaxed">{dailyPlan.makeItEleven || 'No entry for making today an 11'}</p>
            </div>
          </div>

          {/* Great Day Goals */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
              ⭐️
            </div>
            <div>
              <h3 className="text-xl font-medium text-sky-100 mb-2">Great Day Goals</h3>
              <p className="text-lg text-sky-300 leading-relaxed">{dailyPlan.greatDay || 'No great day goals set'}</p>
            </div>
          </div>

          {/* Top 5 Goals */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
              🎯
            </div>
            <div>
              <h3 className="text-xl font-medium text-sky-100 mb-2">Top 5 Goals</h3>
              <div className="space-y-3">
                {dailyPlan.topGoals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-300 text-lg">
                      {index + 1}
                    </div>
                    <p className="text-lg text-sky-300">{goal || 'No goal set'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Quest */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
              ⚔️
            </div>
            <div>
              <h3 className="text-xl font-medium text-sky-100 mb-2">Side Quest</h3>
              <p className="text-lg text-sky-300 leading-relaxed">{dailyPlan.sideQuest || 'No side quest set'}</p>
            </div>
          </div>

          {/* Meals */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
              🍽️
            </div>
            <div>
              <h3 className="text-xl font-medium text-sky-100 mb-2">Meals</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg text-sky-300/80 mb-1">Breakfast</h4>
                  <p className="text-lg text-sky-300">{dailyPlan.meals.breakfast || 'No breakfast planned'}</p>
                </div>
                <div>
                  <h4 className="text-lg text-sky-300/80 mb-1">Lunch</h4>
                  <p className="text-lg text-sky-300">{dailyPlan.meals.lunch || 'No lunch planned'}</p>
                </div>
                <div>
                  <h4 className="text-lg text-sky-300/80 mb-1">Dinner</h4>
                  <p className="text-lg text-sky-300">{dailyPlan.meals.dinner || 'No dinner planned'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDailyTemplate = () => (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-4 glass-card p-4 rounded-lg">
        <button
          onClick={() => handleNavigateDay('prev')}
          className="p-2 hover:bg-sky-500/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-sky-300" />
        </button>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-300" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="glass-input py-1 px-2"
          />
        </div>

        <button
          onClick={() => handleNavigateDay('next')}
          className="p-2 hover:bg-sky-500/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-sky-300" />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-sky-300">
          Loading...
        </div>
      ) : (
        <div className="glass-card p-6 rounded-lg">
          <div className="space-y-8">
            {/* Gratitude */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
                🙏
              </div>
              <div className="flex-1">
                <label className="block text-xl font-medium text-sky-100 mb-2">
                  Gratitude
                </label>
                <textarea
                  value={dailyPlan.gratitude}
                  onChange={(e) => handleDailyPlanChange('gratitude', e.target.value)}
                  className="glass-input min-h-[80px] text-lg"
                  placeholder="What are you grateful for today?"
                />
              </div>
            </div>

            {/* Make it an 11 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
                💫
              </div>
              <div className="flex-1">
                <label className="block text-xl font-medium text-sky-100 mb-2">
                  Make it an 11
                </label>
                <textarea
                  value={dailyPlan.makeItEleven}
                  onChange={(e) => handleDailyPlanChange('makeItEleven', e.target.value)}
                  className="glass-input min-h-[80px] text-lg"
                  placeholder="How will you make today exceptional?"
                />
              </div>
            </div>

            {/* Great Day Goals */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
                ⭐️
              </div>
              <div className="flex-1">
                <label className="block text-xl font-medium text-sky-100 mb-2">
                  Great Day Goals
                </label>
                <textarea
                  value={dailyPlan.greatDay}
                  onChange={(e) => handleDailyPlanChange('greatDay', e.target.value)}
                  className="glass-input min-h-[80px] text-lg"
                  placeholder="What would make today great?"
                />
              </div>
            </div>

            {/* Top 5 Goals */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
                🎯
              </div>
              <div className="flex-1">
                <label className="block text-xl font-medium text-sky-100 mb-2">
                  Top 5 Goals
                </label>
                <div className="space-y-3">
                  {dailyPlan.topGoals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-300 text-lg">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => handleTopGoalChange(index, e.target.value)}
                        className="glass-input text-lg flex-1"
                        placeholder={`Goal ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Quest */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
                ⚔️
              </div>
              <div className="flex-1">
                <label className="block text-xl font-medium text-sky-100 mb-2">
                  Side Quest
                </label>
                <textarea
                  value={dailyPlan.sideQuest}
                  onChange={(e) => handleDailyPlanChange('sideQuest', e.target.value)}
                  className="glass-input min-h-[80px] text-lg"
                  placeholder="Any additional goals or quests?"
                />
              </div>
            </div>

            {/* Meals */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-300 shrink-0">
                🍽️
              </div>
              <div className="flex-1">
                <label className="block text-xl font-medium text-sky-100 mb-2">
                  Meals
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-lg text-sky-300/80 mb-1">Breakfast</label>
                    <input
                      type="text"
                      value={dailyPlan.meals.breakfast}
                      onChange={(e) => handleMealChange('breakfast', e.target.value)}
                      className="glass-input text-lg"
                      placeholder="What's for breakfast?"
                    />
                  </div>
                  <div>
                    <label className="block text-lg text-sky-300/80 mb-1">Lunch</label>
                    <input
                      type="text"
                      value={dailyPlan.meals.lunch}
                      onChange={(e) => handleMealChange('lunch', e.target.value)}
                      className="glass-input text-lg"
                      placeholder="What's for lunch?"
                    />
                  </div>
                  <div>
                    <label className="block text-lg text-sky-300/80 mb-1">Dinner</label>
                    <input
                      type="text"
                      value={dailyPlan.meals.dinner}
                      onChange={(e) => handleMealChange('dinner', e.target.value)}
                      className="glass-input text-lg"
                      placeholder="What's for dinner?"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-6 py-3 text-lg text-sky-300 hover:bg-sky-500/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleSaveDailyPlan();
                    setIsEditMode(false);
                  }}
                  disabled={isSaving}
                  className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 text-lg"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? 'Saving...' : 'Save Day'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-sky-100 mb-2">Goals</h1>
          <div className="flex items-center gap-2 text-sky-300">
            <CheckCircle className="w-5 h-5" />
            <span>{completedGoals} of {totalGoals} goals completed ({Math.round(progressPercentage)}%)</span>
          </div>
        </div>
        {selectedTimeframe !== 'daily' && (
          <button
            onClick={() => setShowAddGoal(true)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Goal
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 mb-6 bg-sky-950/50 p-1 rounded-lg">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => {
              setSelectedTimeframe(timeframe);
              if (timeframe === 'daily') {
                setIsEditMode(false);
              }
            }}
            className={`flex-1 py-2 px-4 rounded-md transition-colors capitalize
              ${selectedTimeframe === timeframe 
                ? 'bg-sky-500 text-white' 
                : 'text-sky-300 hover:bg-sky-900/50'}`}
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
              className="glass-card p-4 rounded-lg flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => handleToggleGoal(goal.id)}
                  className="w-5 h-5 rounded border-sky-500 text-sky-500 focus:ring-sky-500"
                />
                <div>
                  <h3 className={`font-medium ${goal.completed ? 'line-through text-sky-300/60' : 'text-sky-100'}`}>
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-sm text-sky-300/80">{goal.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs
                  ${goal.priority === 'high' ? 'bg-rose-500/20 text-rose-300' :
                    goal.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'}`}>
                  {goal.priority}
                </span>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="p-1 text-sky-300/60 hover:text-sky-300 hover:bg-white/5 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredGoals.length === 0 && (
            <div className="text-center py-8 text-sky-300/60">
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
}
