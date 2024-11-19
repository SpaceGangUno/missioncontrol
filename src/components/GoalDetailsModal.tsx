import React from 'react';
import { Goal } from '../types';
import { X, Star, Rocket } from 'lucide-react';

interface Props {
  goal: Goal | null;
  onClose: () => void;
  onToggleGoal: (id: string) => void;
}

export default function GoalDetailsModal({ goal, onClose, onToggleGoal }: Props) {
  if (!goal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="glass-card p-6 max-w-md w-full mx-4 relative animate-content-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <button
            onClick={() => {
              onToggleGoal(goal.id);
              onClose();
            }}
            className="mt-1 transition-transform hover:scale-110"
          >
            {goal.completed ? (
              <Star className="w-6 h-6 text-emerald-400 fill-emerald-400" />
            ) : (
              <Rocket className="w-6 h-6 text-sky-400" />
            )}
          </button>

          <div className="flex-1">
            <h2 className={`text-lg font-semibold ${
              goal.completed ? 'line-through text-emerald-400' : 'text-white'
            }`}>
              {goal.title}
            </h2>
            
            <div className="mt-2 space-y-2">
              <p className="text-white/80">{goal.description}</p>
              
              <div className="flex flex-wrap gap-2 text-sm">
                <span className={`px-2 py-1 rounded ${getPriorityBadgeColor(goal.priority)}`}>
                  {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                </span>
                <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-300">
                  {goal.category}
                </span>
              </div>

              {goal.deadline && (
                <p className="text-sm text-white/60">
                  Due: {new Date(goal.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPriorityBadgeColor(priority: string): string {
  switch (priority) {
    case 'high': return 'bg-rose-500/20 text-rose-300';
    case 'medium': return 'bg-amber-500/20 text-amber-300';
    case 'low': return 'bg-emerald-500/20 text-emerald-300';
    default: return 'bg-sky-500/20 text-sky-300';
  }
}
