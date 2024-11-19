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
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 ${
                  goal.completed ? 'opacity-50' : ''
                }`}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${angle}deg) translateX(${(index + 2) * 140}px) rotate(-${angle}deg)`,
                }}
              >
                <div
                  className={`w-6 h-6 rounded-full transition-all animate-float shadow-lg ${
                    goal.completed ? 'bg-emerald-400' : getPriorityColor(priority)
                  }`}
                  style={{ 
                    animationDelay: `${delay}s`,
                    boxShadow: `0 0 15px ${getPriorityShadowColor(priority)}`
                  }}
                >
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                      {goal.title}
                    </span>
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

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return 'bg-rose-500';
    case 'medium': return 'bg-amber-500';
    case 'low': return 'bg-emerald-500';
    default: return 'bg-sky-500';
  }
}

function getPriorityShadowColor(priority: string): string {
  switch (priority) {
    case 'high': return 'rgba(244, 63, 94, 0.5)'; // rose-500
    case 'medium': return 'rgba(245, 158, 11, 0.5)'; // amber-500
    case 'low': return 'rgba(16, 185, 129, 0.5)'; // emerald-500
    default: return 'rgba(14, 165, 233, 0.5)'; // sky-500
  }
}
