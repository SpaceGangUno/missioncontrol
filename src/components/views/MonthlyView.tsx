import React, { useState } from 'react';
import { Goal } from '../../types';
import { Sparkles } from 'lucide-react';
import GoalDetailsModal from '../GoalDetailsModal';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
}

export default function MonthlyView({ goals, onToggleGoal }: Props) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Group goals by priority for different orbital paths
  const priorityGoals = {
    high: goals.filter(g => g.priority === 'high'),
    medium: goals.filter(g => g.priority === 'medium'),
    low: goals.filter(g => g.priority === 'low'),
  };

  return (
    <div className="relative min-h-[600px] overflow-hidden rounded-xl glass-card p-8">
      {/* Space background with stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse-slow"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Central planet (represents the month) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl animate-pulse-slow">
          <div className="absolute inset-0 rounded-full bg-black opacity-20"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white/80" />
        </div>
      </div>

      {/* Orbital paths */}
      {Object.entries(priorityGoals).map(([priority, priorityGoals], index) => (
        <div
          key={priority}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `${(index + 2) * 280}px`,
            height: `${(index + 2) * 280}px`,
          }}
        >
          {/* Orbital path line */}
          <div
            className="absolute inset-0 rounded-full border border-sky-500/20"
            style={{ transform: 'rotate(45deg)' }}
          />

          {/* Goals in orbit */}
          {priorityGoals.map((goal, i) => {
            const angle = (i * 360) / priorityGoals.length;
            const delay = i * 0.5;
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${angle}deg) translateX(${(index + 2) * 140}px) rotate(-${angle}deg)`,
                }}
              >
                <div
                  className={`relative w-8 h-8 rounded-full transition-all duration-300 
                    hover:scale-150 hover:z-50 ${goal.completed ? 'opacity-70' : ''}`}
                  style={{ 
                    background: getPriorityGradient(priority),
                    boxShadow: `0 0 20px ${getPriorityShadowColor(priority)}`,
                    animationDelay: `${delay}s`
                  }}
                >
                  {/* Glow effect */}
                  <div 
                    className="absolute inset-0 rounded-full animate-pulse-slow"
                    style={{ 
                      background: getPriorityGradient(priority),
                      filter: 'blur(8px)',
                      opacity: 0.5
                    }}
                  />
                  
                  {/* Title tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-sm text-white bg-black/50 px-2 py-1 rounded">
                    {goal.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ))}

      {/* Goal Details Modal */}
      <GoalDetailsModal
        goal={selectedGoal}
        onClose={() => setSelectedGoal(null)}
        onToggleGoal={onToggleGoal}
      />
    </div>
  );
}

function getPriorityGradient(priority: string): string {
  switch (priority) {
    case 'high': return 'linear-gradient(45deg, #ef4444, #f87171)';
    case 'medium': return 'linear-gradient(45deg, #f59e0b, #fbbf24)';
    case 'low': return 'linear-gradient(45deg, #10b981, #34d399)';
    default: return 'linear-gradient(45deg, #0ea5e9, #38bdf8)';
  }
}

function getPriorityShadowColor(priority: string): string {
  switch (priority) {
    case 'high': return 'rgba(239, 68, 68, 0.5)';
    case 'medium': return 'rgba(245, 158, 11, 0.5)';
    case 'low': return 'rgba(16, 185, 129, 0.5)';
    default: return 'rgba(14, 165, 233, 0.5)';
  }
}
