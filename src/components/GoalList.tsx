import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Clock, Tag } from 'lucide-react';
import { Goal } from '../types';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
}

export default function GoalList({ goals, onToggleGoal }: Props) {
  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'text-rose-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div
          key={goal.id}
          className={`glass-card rounded-xl p-6 transition-all ${
            goal.completed ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-start gap-4">
            <button
              onClick={() => onToggleGoal(goal.id)}
              className="mt-1 focus:outline-none transition-transform hover:scale-110"
            >
              {goal.completed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <Circle className="w-6 h-6 text-white/40" />
              )}
            </button>
            
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${
                goal.completed ? 'line-through text-white/40' : 'text-white'
              }`}>
                {goal.title}
              </h3>
              
              <p className="text-white/60 mt-1">{goal.description}</p>
              
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