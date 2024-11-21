import React, { useRef, useEffect } from 'react';
import { Goal } from '../../types';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Calendar, Rocket, CircleDot, ChevronLeft, ChevronRight, HelpCircle, Loader } from 'lucide-react';
import { useStore } from '../../lib/store';

// ... [Previous interfaces and components remain unchanged]

export default function WeekView({ goals, onToggleGoal }: Props) {
  const { weekPlans, loading, goalsLoading, dayPlanLoading } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [animatingGoal, setAnimatingGoal] = React.useState<AnimatingGoal | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);
  
  const today = new Date();
  const startDate = startOfWeek(today, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Handle animation
  useEffect(() => {
    if (animatingGoal) {
      const timer = setTimeout(() => {
        setAnimatingGoal(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [animatingGoal]);

  // Set initial load complete when goals and week plans are loaded
  useEffect(() => {
    if (goals.length > 0 && Object.keys(weekPlans).length > 0) {
      setInitialLoadComplete(true);
    }
  }, [goals, weekPlans]);

  // Find today's index in the week
  const todayIndex = weekDays.findIndex(day => isSameDay(day, today));

  // Set initial scroll position to today
  useEffect(() => {
    if (scrollContainerRef.current && todayIndex !== -1) {
      const cardWidth = 300;
      const scrollPosition = todayIndex * cardWidth;
      scrollContainerRef.current.scrollLeft = scrollPosition;
      setCurrentIndex(todayIndex);
    }
  }, [todayIndex]);

  // Loading state
  if (loading || goalsLoading || dayPlanLoading || !initialLoadComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-sky-400" />
          <p className="text-sky-400">Loading your week...</p>
        </div>
      </div>
    );
  }

  const scrollToDay = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const newIndex = direction === 'left' ? 
        Math.max(0, currentIndex - 1) : 
        Math.min(6, currentIndex + 1);
      
      const cardWidth = 300;
      const scrollPosition = newIndex * cardWidth;
      
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      setCurrentIndex(newIndex);
    }
  };

  const handleToggleGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    const isCompleted = goal?.completed || goal?.status === 'completed';
    setAnimatingGoal({
      id: goalId,
      action: isCompleted ? 'landing' : 'takeoff'
    });
    onToggleGoal(goalId);
  };

  return (
    <div className="mobile-container pb-safe relative">
      <style>
        {`
          @keyframes blastOff {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-100px) rotate(45deg); opacity: 0; }
          }
          @keyframes landing {
            0% { transform: translateY(-100px) rotate(45deg); opacity: 0; }
            100% { transform: translateY(0) rotate(0deg); opacity: 1; }
          }
          .blast-off { animation: blastOff 1s ease-out forwards; }
          .landing { animation: landing 1s ease-in forwards; }
        `}
      </style>

      {/* Week Overview Header */}
      <div className="glass-card p-4 mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-sky-100">Week at a Glance</h2>
        <Tooltip text="See your goals for the entire week. Swipe or use arrows to navigate between days." />
      </div>

      {/* Navigation Buttons */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-10 pointer-events-none">
        <button
          onClick={() => scrollToDay('left')}
          disabled={currentIndex === 0}
          className={`p-2 rounded-full bg-slate-800/80 backdrop-blur-sm pointer-events-auto ${
            currentIndex === 0 ? 'opacity-30' : 'hover:bg-slate-700/80'
          }`}
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scrollToDay('right')}
          disabled={currentIndex === 6}
          className={`p-2 rounded-full bg-slate-800/80 backdrop-blur-sm pointer-events-auto ${
            currentIndex === 6 ? 'opacity-30' : 'hover:bg-slate-700/80'
          }`}
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Horizontal Scrolling Container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-3 px-3 -mx-3 hide-scrollbar snap-x snap-mandatory"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {weekDays.map((day) => (
          <div 
            key={format(day, 'yyyy-MM-dd')} 
            className="snap-center shrink-0"
          >
            <DayCard
              day={day}
              dayPlan={weekPlans[format(day, 'yyyy-MM-dd')]}
              onToggleGoal={handleToggleGoal}
              animatingGoal={animatingGoal}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
