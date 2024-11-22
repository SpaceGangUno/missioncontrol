import React from 'react';
import { Props } from '../../types';

export default function MonthlyView({ goals, onToggleGoal, onUpdateGoal, onAddGoal }: Props) {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Overview</h2>
        <div className="space-y-4">
          {goals.map(goal => (
            <div 
              key={goal.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{goal.title}</h3>
                {goal.description && (
                  <p className="text-sm text-sky-400/60 mt-1">{goal.description}</p>
                )}
              </div>
              <button
                onClick={() => onToggleGoal(goal.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  goal.completed 
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-sky-500/20 text-sky-400'
                }`}
              >
                {goal.completed ? 'Completed' : 'In Progress'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
