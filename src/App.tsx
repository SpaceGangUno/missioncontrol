import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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
import { Rocket, Calendar, Clock, CalendarDays, User, LogOut, Settings, Menu, X } from 'lucide-react';
import { auth } from './lib/firebase';
import { Goal } from './types';

function AppContent() {
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date();
  const { goals, addGoal, toggleGoal, updateGoal } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

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
    }
  };

  const handleViewChange = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  const handleUpdateProgress = async (id: string, status: Goal['status'], progress: number) => {
    try {
      await updateGoal(id, { status, progress });
    } catch (error) {
      console.error('Error updating goal progress:', error);
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
        <nav className="glass-card mb-6 p-3 sm:p-4 rounded-xl flex items-center justify-between relative z-30">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="sm:hidden p-2 hover:bg-white/5 rounded-lg"
          >
            {showMobileMenu ? (
              <X className="w-5 h-5 text-sky-400" />
            ) : (
              <Menu className="w-5 h-5 text-sky-400" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-sky-400" />
              <span className="font-medium">Mission Control</span>
            </Link>
            <Link
              to="/month"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname === '/month' ? 'bg-indigo-500/20 text-white' : 'text-sky-400/60 hover:text-sky-400'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Month</span>
            </Link>
            <Link
              to="/week"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname === '/week' ? 'bg-indigo-500/20 text-white' : 'text-sky-400/60 hover:text-sky-400'
              }`}
            >
              <CalendarDays className="w-5 h-5" />
              <span>Week</span>
            </Link>
            <Link
              to="/day"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                location.pathname === '/day' ? 'bg-indigo-500/20 text-white' : 'text-sky-400/60 hover:text-sky-400'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Day</span>
            </Link>
          </div>

          {/* Mobile Title */}
          {!showMobileMenu && (
            <Link to="/" className="sm:hidden flex items-center gap-2">
              <Rocket className="w-5 h-5 text-sky-400" />
              <span className="font-medium">Mission Control</span>
            </Link>
          )}

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-sky-100 hidden sm:inline">{user.displayName}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-80 glass-card rounded-lg shadow-xl z-50">
                <div className="p-4 border-b border-sky-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sky-100">{user.displayName}</h3>
                      <p className="text-sm text-sky-400/60">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/5 rounded-lg transition-colors text-rose-400"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {showSettings && (
                  <div className="p-4 border-t border-sky-500/10">
                    <ThemeSelector />
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="sm:hidden glass-card mb-6 p-2 rounded-xl">
            <button
              onClick={() => handleViewChange('/')}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                location.pathname === '/' ? 'bg-indigo-500/20 text-white' : 'text-sky-400/60'
              }`}
            >
              <Rocket className="w-5 h-5" />
              Mission Control
            </button>
            <button
              onClick={() => handleViewChange('/month')}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                location.pathname === '/month' ? 'bg-indigo-500/20 text-white' : 'text-sky-400/60'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Month
            </button>
            <button
              onClick={() => handleViewChange('/week')}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                location.pathname === '/week' ? 'bg-indigo-500/20 text-white' : 'text-sky-400/60'
              }`}
            >
              <CalendarDays className="w-5 h-5" />
              Week
            </button>
            <button
              onClick={() => handleViewChange('/day')}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                location.pathname === '/day' ? 'bg-indigo-500/20 text-white' : 'text-sky-400/60'
              }`}
            >
              <Clock className="w-5 h-5" />
              Day
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="relative z-20">
          <Routes>
            <Route path="/" element={
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
            } />
            <Route path="/month" element={
              <MonthlyView 
                goals={goals} 
                onToggleGoal={toggleGoal} 
                onUpdateGoal={updateGoal}
                onAddGoal={addGoal}
              />
            } />
            <Route path="/week" element={
              <WeekView goals={goals} onToggleGoal={toggleGoal} />
            } />
            <Route path="/day" element={
              <DayView goals={goals} onToggleGoal={toggleGoal} />
            } />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
