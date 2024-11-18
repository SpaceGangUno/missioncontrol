import React from 'react';
import { Goal } from '../../types';
import { Rocket, Star, Sparkles } from 'lucide-react';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
}

export default function MonthlyView({ goals, onToggleGoal }: Props) {
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
                onClick={() => onToggleGoal(goal.id)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 ${
                  goal.completed ? 'opacity-50' : ''
                }`}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${angle}deg) translateX(${(index + 2) * 140}px) rotate(-${angle}deg)`,
                }}
              >
                <div
                  className={`glass-card p-4 w-48 backdrop-blur-md transition-all animate-float ${
                    goal.completed ? 'bg-emerald-500/20' : getPriorityColor(priority)
                  }`}
                  style={{ animationDelay: `${delay}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {goal.completed ? (
                        <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                      ) : (
                        <Rocket className="w-5 h-5 text-sky-400" />
                      )}
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold ${
                        goal.completed ? 'line-through text-emerald-400' : 'text-white'
                      }`}>
                        {goal.title}
                      </h3>
                      <p className="text-xs text-white/60 mt-1 line-clamp-2">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return 'bg-rose-500/20 hover:bg-rose-500/30';
    case 'medium': return 'bg-amber-500/20 hover:bg-amber-500/30';
    case 'low': return 'bg-emerald-500/20 hover:bg-emerald-500/30';
    default: return 'bg-sky-500/20 hover:bg-sky-500/30';
  }
}