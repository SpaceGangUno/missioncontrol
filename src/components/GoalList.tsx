import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Clock, Tag, PlayCircle } from 'lucide-react';
import { Goal } from '../types';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
  onUpdateProgress: (id: string, status: Goal['status'], progress: number) => void;
}

export default function GoalList({ goals, onToggleGoal, onUpdateProgress }: Props) {
  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'text-rose-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
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
    onUpdateProgress(goal.id, nextStatus, progress);
    if (nextStatus === 'completed') {
      onToggleGoal(goal.id);
    }
  };

  return (
    <div className="space-y-4">
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
              {getStatusIcon(goal.status)}
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
