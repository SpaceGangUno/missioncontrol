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
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark p-6 text-white">
      {/* Header with Settings Icon */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Hey {user.displayName.split(' ')[0]} 👋
          </h1>
          <p className="text-indigo-200">Your financial wellness journey</p>
        </div>
        <button className="w-12 h-12 glass-card rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-secondary" />
        </button>
      </div>

      {/* Financial Score Card */}
      <div className="glass-card p-6 mb-6 rounded-3xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">😊</span>
          </div>
          <div>
            <h2 className="text-lg text-indigo-200">Financial Wellbeing Score</h2>
            <div className="text-4xl font-bold">
              {progressScore}
              <span className="text-xl text-indigo-300 ml-1">/100</span>
            </div>
          </div>
        </div>
        <div className="bg-white/10 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-secondary to-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${progressScore}%` }}
          />
        </div>
      </div>

      {/* Balance Card */}
      <div className="glass-card p-6 mb-6 rounded-3xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg text-indigo-200">Total Balance</h2>
          <span className="text-sm px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
            +2.4%
          </span>
        </div>
        <div className="text-4xl font-bold mb-6">$2,547.89</div>
        <div className="grid grid-cols-2 gap-4">
          <button className="glass-card hover:bg-glass-hover p-3 rounded-xl text-center text-secondary">
            Send Money
          </button>
          <button className="glass-card hover:bg-glass-hover p-3 rounded-xl text-center text-secondary">
            Add Funds
          </button>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-2 gap-4 mb-20">
        <div className="glass-card p-5 rounded-3xl">
          <Heart className="w-8 h-8 text-rose-400 mb-3" />
          <h3 className="font-semibold mb-2">Stress Free</h3>
          <p className="text-sm text-indigo-200">
            Your spending is balanced this week
          </p>
        </div>
        <div className="glass-card p-5 rounded-3xl">
          <Brain className="w-8 h-8 text-sky-400 mb-3" />
          <h3 className="font-semibold mb-2">Money Mindful</h3>
          <p className="text-sm text-indigo-200">
            You've saved 15% more than usual
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 nav-glass py-4 px-6">
        <div className="flex justify-between max-w-lg mx-auto">
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
                  ? 'text-secondary' 
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
