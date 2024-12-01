import React, { useState } from 'react';
import { useAuth } from './components/auth/AuthProvider';
import LoginPage from './components/auth/LoginPage';
import WelcomeScreen from './components/onboarding/WelcomeScreen';
import { useStore } from './lib/store';
import { Home, Heart, Wallet, Target, User, Sparkles } from 'lucide-react';

type ViewType = 'home' | 'wellbeing' | 'finance' | 'goals' | 'profile';

export default function App() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const { goals } = useStore();

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark text-white">
      <div className="max-w-md mx-auto px-5 pt-8 pb-20">
        {/* Header with Settings Icon */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Hey {user.displayName.split(' ')[0]} 👋
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

        {/* Balance Card */}
        <div className="glass-card p-6 mb-4 rounded-[24px]">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm text-indigo-200/80">Total Balance</h2>
            <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
              +2.4%
            </span>
          </div>
          <div className="text-3xl font-bold mb-6">$2,547.89</div>
          <div className="grid grid-cols-2 gap-3">
            <button className="glass-button py-3 rounded-2xl text-center text-sm text-cyan-400 hover:text-cyan-300">
              Send Money
            </button>
            <button className="glass-button py-3 rounded-2xl text-center text-sm text-cyan-400 hover:text-cyan-300">
              Add Funds
            </button>
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
