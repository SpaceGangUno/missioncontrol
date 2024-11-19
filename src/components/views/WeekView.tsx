import React, { useRef, useEffect } from 'react';
import { Goal } from '../../types';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Calendar, Rocket, CircleDot, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { useStore } from '../../lib/store';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
}

interface AnimatingGoal {
  id: string;
  action: 'takeoff' | 'landing';
}

interface GoalItemProps {
  goal: Goal | { id: string; title: string; description?: string; completed?: boolean };
  isTemp?: boolean;
  onToggleGoal?: (id: string) => void;
  isAnimating?: boolean;
  animationAction?: 'takeoff' | 'landing';
}

// Tooltip component for help text
function Tooltip({ text }: { text: string }) {
  return (
    <div className="group relative">
      <HelpCircle className="w-4 h-4 text-sky-400/60 hover:text-sky-400" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-navy-800/95 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {text}
      </div>
    </div>
  );
}

function GoalItem({ goal, isTemp = false, onToggleGoal, isAnimating, animationAction }: GoalItemProps) {
  const isCompleted = 'completed' in goal ? goal.completed : false;
  const animationClass = isAnimating ? (animationAction === 'takeoff' ? 'blast-off' : 'landing') : '';

  return (
    <div className={`glass-card p-2 ${
      isCompleted ? 'opacity-50' : ''
    } ${isTemp ? 'border-l-2 border-sky-400/30' : ''}`}>
      <div className="flex items-start gap-2">
        {isTemp ? (
          <CircleDot className="w-3 h-3 text-sky-400/60 shrink-0 mt-0.5" />
        ) : (
          <div className="flex-shrink-0">
            <Rocket className={`w-4 h-4 text-sky-400 shrink-0 mt-0.5 ${animationClass}`} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className={`${isTemp ? 'text-xs' : 'text-sm'} font-medium truncate ${
            isCompleted ? 'line-through' : ''
          } ${isTemp ? 'text-sky-400/80' : ''}`}>
            {isTemp ? goal.id.replace('temp-', '') : goal.title}
          </div>
          {!isTemp && 'description' in goal && (
            <div className="text-xs text-sky-400/60 line-clamp-2 mt-0.5">
              {goal.description}
            </div>
          )}
        </div>
        {!isTemp && onToggleGoal && (
          <button
            onClick={() => onToggleGoal(goal.id)}
            className={`text-sky-400/60 hover:text-sky-400 p-1 ${isCompleted ? 'text-green-400' : ''}`}
            aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            <Rocket className={`w-4 h-4 ${animationClass}`} />
          </button>
        )}
      </div>
    </div>
  );
}

function DayCard({ day, dayPlan, onToggleGoal, animatingGoal }: { 
  day: Date; 
  dayPlan: { topGoals: string[] } | undefined;
  onToggleGoal: (id: string) => void;
  animatingGoal: AnimatingGoal | null;
}) {
  const { goals } = useStore();
  const getGoalById = (id: string) => goals.find(goal => goal.id === id);
  const isToday = isSameDay(day, new Date());

  return (
    <div className={`glass-card p-3 min-w-[300px] max-w-[300px] ${
      isToday ? 'ring-2 ring-sky-400' : ''
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-sky-400" />
        <div>
          <div className="text-sm font-medium">{format(day, 'EEEE')}</div>
          <div className="text-xs text-sky-400/60">{format(day, 'MMMM d')}</div>
        </div>
        {isToday && (
          <div className="ml-auto">
            <Tooltip text="This is your current day. Click goals to mark them complete!" />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {dayPlan?.topGoals?.map(goalId => {
          if (goalId.startsWith('temp-')) {
            return (
              <GoalItem 
                key={goalId} 
                goal={{ id: goalId, title: goalId.replace('temp-', '') }}
                isTemp={true}
              />
            );
          }

          const goal = getGoalById(goalId);
          if (!goal) return null;
          
          return (
            <GoalItem 
              key={goal.id} 
              goal={goal} 
              onToggleGoal={onToggleGoal}
              isAnimating={animatingGoal?.id === goal.id}
              animationAction={animatingGoal?.action}
            />
          );
        })}
        {(!dayPlan?.topGoals || dayPlan.topGoals.length === 0) && (
          <div className="text-sm text-sky-400/60 text-center py-2">
            No goals set for this day yet
          </div>
        )}
      </div>
    </div>
  );
}

export default function WeekView({ goals, onToggleGoal }: Props) {
  const { weekPlans } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [animatingGoal, setAnimatingGoal] = React.useState<AnimatingGoal | null>(null);
  
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
          disabled={cur