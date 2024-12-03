import React, { useState, useEffect } from 'react';
import { useAuth } from './components/auth/AuthProvider';
import LoginPage from './components/auth/LoginPage';
import WelcomeScreen from './components/onboarding/WelcomeScreen';
import GoalsPage from './components/views/GoalsPage';
import { useStore } from './lib/store';
import { Home, Heart, Wallet, Target, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { DayPlan } from './types';

type ViewType = 'home' | 'wellbeing' | 'finance' | 'goals' | 'profile';

export default function App() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const { goals, weekPlans, getWeekPlans, toggleGoal } = useStore();

  // Load week plans when component mounts or user changes
  useEffect(() => {
    if (user) {
      getWeekPlans();
    }
  }, [user, getWeekPlans]);

  if (!user) {
    return <LoginPage onShowWelcome={() => {}} />;
  }

  if (!user.displayName) {
    return <WelcomeScreen />;
  }

  // Get today's daily plan
  const today = new Date().toISOString().split('T')[0];
  const todaysPlan = weekPlans[today];

  // Calculate daily progress
  const calculateDailyProgress = () => {
    if (!todaysPlan?.topGoals?.length) return 0;

    const completedDailyGoals = todaysPlan.topGoals.filter(goalId => {
      const goal = goals.find(g => g.id === goalId);
      return goal?.completed;
    }).length;

    return Math.round((completedDailyGoals / todaysPlan.topGoals.length) * 100);
  };

  const progressScore = calculateDailyProgress();

  // Helper function to get goal title from ID
  const getGoalTitle = (goalId: string): string => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.title || 'Unknown Goal';
  };

  // Helper function to get goal completion status
  const isGoalCompleted = (goalId: string): boolean => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.completed || false;
  };

  // Handle goal toggle
  const handleToggleGoal = async (goalId: string) => {
    await toggleGoal(goalId);
    await getWeekPlans(); // Refresh plans to update UI
  };

  const renderView = () => {
    switch (currentView) {
      case 'goals':
        return <GoalsPage />;
      default:
        return (
          <>
            {/* Header with Settings Icon */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-1">
                  Greetings {user?.displayName?.split(' ')[0] || 'User'} 👽
                </h1>
                <p className="text-indigo-200/80 text-sm">Your cosmic journey awaits</p>
              </div>
              <button className="w-10 h-10 glass-card rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#00f2ff]" />
              </button>
            </div>

            {/* Daily Progress Card */}
            <div className="glass-card p-6 mb-4 rounded-[24px]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h2 className="text-sm text-indigo-200/80 mb-0.5">Mission Progress</h2>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-[#00f2ff]">{progressScore}</span>
                    <span className="text-lg text-indigo-200/60 ml-1">/100</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="progress-bar h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressScore}%` }}
                />
              </div>
              <p className="text-sm text-indigo-200/60 mt-2">
                {progressScore === 100 
                  ? 'Mission accomplished! 🎉' 
                  : progressScore > 0 
                    ? `${progressScore}% of today's mission completed`
                    : 'Begin your mission for today'}
              </p>
            </div>

            {/* Top Goals Card */}
            <div className="glass-card p-6 mb-4 rounded-[24px]">
              <h2 className="text-sm text-indigo-200/80 mb-4">Mission Objectives</h2>
              <div className="space-y-4">
                {todaysPlan?.topGoals?.map((goalId: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <button
                      onClick={() => goalId && handleToggleGoal(goalId)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        goalId && isGoalCompleted(goalId)
                          ? 'bg-[#00f2ff] text-black'
                          : 'bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff]/20'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <p className={`text-sm ${goalId && isGoalCompleted(goalId) ? 'line-through text-indigo-200/60' : 'text-indigo-200/80'}`}>
                      {goalId ? getGoalTitle(goalId) : 'No objective set'}
                    </p>
                  </div>
                )) || Array(5).fill(null).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] text-lg">
                      {index + 1}
                    </div>
                    <p className="text-sm text-indigo-200/80">No objective set</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Quest Card */}
            <div className="glass-card p-6 mb-4 rounded-[24px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] text-lg">
                  ⚔️
                </div>
                <h2 className="text-sm text-indigo-200/80">Side Mission</h2>
              </div>
              <p className="text-sm text-indigo-200/80">
                {todaysPlan?.sideQuest || 'No side mission available'}
              </p>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="glass-card p-4 rounded-[20px] hover-card">
                <Heart className="w-6 h-6 text-[#ff00cc] mb-3" />
                <h3 className="font-medium text-sm mb-1">Cosmic Balance</h3>
                <p className="text-xs text-indigo-200/60">
                  Your energy is aligned this week
                </p>
              </div>
              <div className="glass-card p-4 rounded-[20px] hover-card">
                <Target className="w-6 h-6 text-[#00f2ff] mb-3" />
                <h3 className="font-medium text-sm mb-1">Star Tracker</h3>
                <p className="text-xs text-indigo-200/60">
                  15% ahead of mission schedule
                </p>
              </div>
            </div>

            {/* Morning Coffee Card */}
            <div className="glass-card p-4 rounded-[20px] hover-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">☕️</span>
                  <div>
                    <h3 className="font-medium text-sm">Space Coffee</h3>
                    <p className="text-xs text-indigo-200/60">Energy boost</p>
                  </div>
                </div>
                <span className="text-[#00f2ff]">$4.50</span>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark text-white">
      <div className="max-w-md mx-auto px-5 pt-8 pb-20">
        {renderView()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 nav-glass py-2">
        <div className="flex justify-between max-w-md mx-auto px-8">
          {[
            { icon: Home, label: 'Home', view: 'home' },
            { icon: Heart, label: 'Wellbeing', view: 'wellbeing' },
            { icon: Wallet, label: 'Finance', view: 'finance' },
            { icon: Target, label: 'Goals', view: 'goals' },
            { icon: User, label: 'Profile', view: 'profile' },
          ].map(({ icon: Icon, label, view }) => (
            <button 
              key={view}
              onClick={() => setCurrentView(view as ViewType)}
              className={`flex flex-col items-center transition-colors ${
                currentView === view 
                  ? 'nav-item-active' 
                  : 'text-indigo-200/60 hover:text-indigo-200/80'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
