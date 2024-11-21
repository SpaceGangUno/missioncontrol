import React, { useState, useEffect } from 'react';
import { Circle, AlertCircle, Clock, Tag, PlayCircle, Rocket, Target } from 'lucide-react';
import { Goal } from '../types';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
  onUpdateProgress: (id: string, status: Goal['status'], progress: number) => void;
}

interface AnimatingGoal {
  id: string;
  action: 'takeoff' | 'landing';
}

export default function GoalList({ goals, onToggleGoal, onUpdateProgress }: Props) {
  const [animatingGoal, setAnimatingGoal] = useState<AnimatingGoal | null>(null);

  // Handle animation
  useEffect(() => {
    if (animatingGoal) {
      const timer = setTimeout(() => {
        setAnimatingGoal(null);
      }, 1000); // Duration of animation
      return () => clearTimeout(timer);
    }
  }, [animatingGoal]);

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'text-rose-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (goal: Goal) => {
    const isAnimating = animatingGoal?.id === goal.id;
    const animationClass = isAnimating 
      ? animatingGoal.action === 'takeoff' 
        ? 'blast-off' 
        : 'landing'
      : '';

    switch (goal.status) {
      case 'completed':
        return <Rocket className={`w-6 h-6 text-emerald-400 ${animationClass}`} />;
      case 'in_progress':
        return <PlayCircle className="w-6 h-6 text-amber-400" />;
      default:
        return <Circle className="w-6 h-6 text-white/40" />;
    }
  };

  const handleStatusClick = (goal: Goal) => {
    const nextStatus = goal.status === 'not_started' 
      ? 'in_progress' 
      : goal.status === 'in_progress' 
        ? 'completed' 
        : 'not_started';
    
    const progress = nextStatus === 'completed' ? 100 : nextStatus === 'in_progress' ? 50 : 0;
    
    if (nextStatus === 'completed') {
      setAnimatingGoal({
        id: goal.id,
        action: 'takeoff'
      });
      onToggleGoal(goal.id);
    } else if (goal.status === 'completed') {
      setAnimatingGoal({
        id: goal.id,
        action: 'landing'
      });
    }
    
    onUpdateProgress(goal.id, nextStatus, progress);
  };

  // Empty state
  if (goals.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Target className="w-12 h-12 text-sky-400/40" />
          <div>
            <h3 className="text-lg font-semibold text-sky-100 mb-2">No Goals Yet</h3>
            <p className="text-sky-400/60">Start by adding some goals to track your progress</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <style>
        {`
          @keyframes blastOff {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(-100px) rotate(45deg);
              opacity: 0;
            }
          }
          @keyframes landing {
            0% {
              transform: translateY(-100px) rotate(45deg);
              opacity: 0;
            }
            100% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
          }
          .blast-off {
            animation: blastOff 1s ease-out forwards;
          }
          .landing {
            animation: landing 1s ease-in forwards;
          }
        `}
      </style>

      {goals.slice(0, 5).map((goal) => (
        <div
          key={goal.id}
          className={`glass-card rounded-xl p-6 transition-all ${
            goal.completed ? 'opacity-50' : ''
          }`}
        >
          {/* Progress Bar */}
          <div className="w-full h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
            <div 
              className="h-full transition-all duration-500 ease-out"
              style={{ 
                width: `${goal.progress}%`,
                background: `linear-gradient(90deg, 
                  ${goal.status === 'completed' ? '#10b981' : 
                    goal.status === 'in_progress' ? '#f59e0b' : 
                    '#3b82f6'} 0%, 
                  ${goal.status === 'completed' ? '#34d399' : 
                    goal.status === 'in_progress' ? '#fbbf24' : 
                    '#60a5fa'} 100%)`
              }}
            />
          </div>

          <div className="flex items-start gap-4">
            <button
              onClick={() => handleStatusClick(goal)}
              className="mt-1 focus:outline-none transition-transform hover:scale-110"
            >
              {getStatusIcon(goal)}
            </button>
            
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${
                goal.completed ? 'line-through text-white/40' : 'text-white'
              }`}>
                {goal.title}
              </h3>
              
              {goal.description && (
                <p className="text-white/60 mt-1">{goal.description}</p>
              )}
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-4 h-4 ${getPriorityColor(goal.priority)}`} />
                  <span className={`${getPriorityColor(goal.priority)} capitalize text-sm`}>
                    {goal.priority} Priority
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-400" />
                  <span className="text-indigo-300 text-sm">{goal.category}</span>
                </div>
                
                {goal.deadline && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 text-sm">
                      {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
