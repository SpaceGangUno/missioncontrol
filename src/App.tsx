import React, { useState } from 'react';
import { useAuth } from './components/auth/AuthProvider';
import LoginPage from './components/auth/LoginPage';
import WelcomeScreen from './components/onboarding/WelcomeScreen';
import { useStore } from './lib/store';
import { Home, Heart, Wallet, Brain, User, Sparkles } from 'lucide-react';

type ViewType = 'home' | 'wellbeing' | 'finance' | 'insights' | 'profile';

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
  const progressScore = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 84; // Default to 84 for demo

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark text-white">
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        {/* Header with Settings Icon */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Hey {user.displayName.split(' ')[0]} 👋
            </h1>
            <p className="text-indigo-200 text-sm">Your financial wellness journey</p>
          </div>
          <button className="w-10 h-10 glass-card rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Financial Score Card */}
        <div className="glass-card p-6 mb-6 rounded-3xl hover-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">😊</span>
            </div>
            <div>
              <h2 className="text-sm text-indigo-200 mb-0.5">Financial Wellbeing Score</h2>
              <div className="text-3xl font-bold">
                {progressScore}
                <span className="text-lg text-indigo-300 ml-1">/100</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-500 progress-bar"
              style={{ '--progress': `${progressScore}%` } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Balance Card */}
        <div className="glass-card p-6 mb-6 rounded-3xl hover-card">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm text-indigo-200">Total Balance</h2>
            <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
              +2.4%
            </span>
          </div>
          <div className="text-3xl font-bold mb-6">$2,547.89</div>
          <div className="grid grid-cols-2 gap-3">
            <button className="glass-card hover:bg-white/10 p-3 rounded-2xl text-center text-sm text-indigo-200 transition-colors">
              Send Money
            </button>
            <button className="glass-card hover:bg-white/10 p-3 rounded-2xl text-center text-sm text-indigo-200 transition-colors">
              Add Funds
            </button>
          </div>
        </div>

        {/* Insight Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4 rounded-2xl hover-card">
            <Heart className="w-6 h-6 text-rose-400 mb-3" />
            <h3 className="font-medium text-sm mb-1">Stress Free</h3>
            <p className="text-xs text-indigo-200">
              Your spending is balanced this week
            </p>
          </div>
          <div className="glass-card p-4 rounded-2xl hover-card">
            <Brain className="w-6 h-6 text-sky-400 mb-3" />
            <h3 className="font-medium text-sm mb-1">Money Mindful</h3>
            <p className="text-xs text-indigo-200">
              You've saved 15% more than usual
            </p>
          </div>
        </div>

        {/* Morning Coffee Card */}
        <div className="glass-card p-4 rounded-2xl hover-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">☕️</span>
              <div>
                <h3 className="font-medium text-sm">Morning Coffee</h3>
                <p className="text-xs text-indigo-200">Self-care</p>
              </div>
            </div>
            <span className="text-emerald-400">$4.50</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 nav-glass py-2 px-6">
        <div className="flex justify-between max-w-md mx-auto">
          {[
            { icon: Home, label: 'Home', view: 'home' },
            { icon: Heart, label: 'Wellbeing', view: 'wellbeing' },
            { icon: Wallet, label: 'Finance', view: 'finance' },
            { icon: Brain, label: 'Insights', view: 'insights' },
            { icon: User, label: 'Profile', view: 'profile' },
          ].map(({ icon: Icon, label, view }) => (
            <button 
              key={view}
              onClick={() => setCurrentView(view as ViewType)}
              className={`flex flex-col items-center transition-colors ${
                currentView === view 
                  ? 'text-violet-400' 
                  : 'text-indigo-300 hover:text-indigo-200'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
