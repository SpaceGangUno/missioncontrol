import React, { useState, useEffect } from 'react';
import { useAuth } from './components/auth/AuthProvider';
import LoginPage from './components/auth/LoginPage';
import WelcomeScreen from './components/onboarding/WelcomeScreen';
import GoalsPage from './components/views/GoalsPage';
import { useStore } from './lib/store';
import { Home, Heart, Wallet, Target, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { DayPlan, Goal } from './types';

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

  // Calculate completion percentage
  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const progressScore = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 18; // Default to 18 for demo

  // Get today's daily plan
  const today = new Date().toISOString().split('T')[0];
  const todaysPlan = weekPlans[today];

  // Find goal by ID and get its details
  const getGoalDetails = (goalId: string): { title: string; completed: boolean } => {
    const goal = goals.find(g => g.id === goalId);
    return {
      title: goal?.title || 'Unknown Goal',
      completed: goal?.completed || false
    };
  };

  // Handle goal toggle
  const handleToggleGoal = async (goalId: string) => {
    await toggleGoal(goalId);
    // Refresh week plans to ensure UI is up to date
    await getWeekPlans();
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
                <p className="text-indigo-200/80 text-sm">Your financial wellness journey</p>
              </div>
              <button className="w-10 h-10 glass-card rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </button>
            </div>

            {/* Financial Score Card */}
            <div className="glass-card p-6 mb-4 rounded-[24px]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">😊</span>
                </div>
                <div>
                  <h2 className="text-sm text-indigo-200/80 mb-0.5">Financial Wellbeing Score</h2>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{progressScore}</span>
                    <span className="text-lg text-indigo-200/60 ml-1">/100</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500 progress-bar"
                  style={{ '--progress': `${progressScore}%` } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Top Goals Card */}
            <div className="glass-card p-6 mb-4 rounded-[24px]">
              <h2 className="text-sm text-indigo-200/80 mb-4">Top Goals for Today</h2>
              <div className="space-y-4">
                {todaysPlan?.topGoals?.map((goalId: string, index: number) => {
                  if (!goalId) {
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-300 text-lg">
                          {index + 1}
                        </div>
                        <p className="text-sm text-indigo-200/80">No goal set</p>
                      </div>
                    );
                  }

                  const { title, completed } = getGoalDetails(goalId);
                  return (
                    <div key={goalId} className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleGoal(goalId)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          completed
                            ? 'bg-sky-500 text-white'
                            : 'bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <p className={`text-sm text-indigo-200/80 ${completed ? 'line-through' : ''}`}>
                        {title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="glass-card p-4 rounded-[20px] hover-card">
                <Heart className="w-6 h-6 text-rose-400 mb-3" />
                <h3 className="font-medium text-sm mb-1">Stress Free</h3>
                <p className="text-xs text-indigo-200/60">
                  Your spending is balanced this week
                </p>
              </div>
              <div className="glass-card p-4 rounded-[20px] hover-card">
                <Target className="w-6 h-6 text-cyan-400 mb-3" />
                <h3 className="font-medium text-sm mb-1">Money Mindful</h3>
                <p className="text-xs text-indigo-200/60">
                  You've saved 15% more than usual
                </p>
              </div>
            </div>

            {/* Morning Coffee Card */}
            <div className="glass-card p-4 rounded-[20px] hover-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">☕️</span>
                  <div>
                    <h3 className="font-medium text-sm">Morning Coffee</h3>
                    <p className="text-xs text-indigo-200/60">Self-care</p>
                  </div>
                </div>
                <span className="text-emerald-400">$4.50</span>
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
