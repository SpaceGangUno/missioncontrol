import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './components/auth/AuthProvider';
import LoginPage from './components/auth/LoginPage';
import WelcomeScreen from './components/onboarding/WelcomeScreen';
import WelcomeBack from './components/auth/WelcomeBack';
import { useStore } from './lib/store';
import MissionHeader from './components/MissionHeader';
import MissionOverview from './components/MissionOverview';
import MissionList from './components/MissionList';
import MissionPlanner from './components/MissionPlanner';
import MonthlyView from './components/views/MonthlyView';
import WeekView from './components/views/WeekView';
import DayView from './components/views/DayView';
import ThemeSelector from './components/ThemeSelector';
import { Rocket, Calendar, Clock, CalendarDays, User, LogOut, Settings, Menu, X, Loader, AlertCircle } from 'lucide-react';
import { auth } from './lib/firebase';
import { Goal } from './types';

type ViewType = 'mission-control' | 'month' | 'week' | 'day';

export default function App() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('mission-control');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date();
  const { goals, loading: storeLoading, goalsLoading, dayPlanLoading, error: storeError, initialized, addGoal, toggleGoal, updateGoal } = useStore();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Set a timeout for loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (storeLoading || goalsLoading || dayPlanLoading) {
        setLoadingTimeout(true);
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [storeLoading, goalsLoading, dayPlanLoading]);

  // Handle click outside profile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
        setShowSettings(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show loading state
  if (authLoading || (!initialized && (storeLoading || goalsLoading || dayPlanLoading))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-sky-400">Loading your missions...</p>
          {loadingTimeout && (
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors"
            >
              Taking too long? Click to retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show error state
  if (authError || storeError || appError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card p-6 max-w-md mx-auto">
          <div className="flex items-center gap-3 text-rose-400 mb-4">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <h2 className="text-lg font-semibold">Error</h2>
          </div>
          <p className="text-sky-400/80">{authError || storeError || appError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onShowWelcome={() => setShowWelcomeBack(true)} />;
  }

  if (!user.displayName) {
    return <WelcomeScreen />;
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setAppError('Failed to sign out');
    }
  };

  const handleViewChange = (view: ViewType) => {
    console.log('Changing view to:', view);
    setCurrentView(view);
    setShowMobileMenu(false);
  };

  const handleUpdateProgress = async (id: string, status: Goal['status'], progress: number) => {
    try {
      await updateGoal(id, { status, progress });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      setAppError('Failed to update goal progress');
    }
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'month':
        return (
          <MonthlyView 
            goals={goals} 
            onToggleGoal={toggleGoal} 
            onUpdateGoal={updateGoal}
            onAddGoal={addGoal}
          />
        );
      case 'week':
        return <WeekView goals={goals} onToggleGoal={toggleGoal} />;
      case 'day':
        return <DayView goals={goals} onToggleGoal={toggleGoal} />;
      default:
        return (
          <>
            <MissionHeader />
            <MissionOverview date={currentDate} missions={goals} view="month" />
            <MissionPlanner onAddMission={addGoal} />
            <MissionList 
              missions={goals} 
              onToggleMission={toggleGoal} 
              onUpdateProgress={handleUpdateProgress}
            />
          </>
        );
    }
  };

  return (
    <>
      {showWelcomeBack && (
        <WelcomeBack 
          name={user.displayName} 
          onComplete={() => setShowWelcomeBack(false)} 
        />
      )}
      
      <div className="min-h-screen p-4 sm:p-6">
        {/* ... [Rest of the component remains unchanged] ... */}
      </div>
    </>
  );
}
