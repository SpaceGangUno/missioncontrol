import React from 'react';
import { Calendar, Target, CheckCircle, Circle } from 'lucide-react';
import { Goal } from '../types';

interface Props {
  month: Date;
  goals: Goal[];
}

export default function MonthlyOverview({ month, goals }: Props) {
  const progress = goals.length > 0 
    ? Math.round((goals.filter(g => g.completed).length / goals.length) * 100)
    : 0;

  return (
    <div className="glass-card rounded-2xl p-8 mb-8 neon-glow">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/20 backdrop-blur-sm">
            <Calendar className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold gradient-text">
            {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="flex items-center gap-3 bg-indigo-500/10 px-6 py-3 rounded-xl backdrop-blur-sm">
          <Target className="w-6 h-6 text-indigo-400" />
          <span className="font-semibold text-lg text-indigo-300">{progress}% Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card bg-emerald-500/5 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <h3 className="font-semibold text-emerald-300">Completed</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-400">
            {goals.filter(g => g.completed).length}
          </p>
        </div>

        <div className="glass-card bg-amber-500/5 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <Circle className="w-6 h-6 text-amber-400" />
            <h3 className="font-semibold text-amber-300">In Progress</h3>
          </div>
          <p className="text-3xl font-bold text-amber-400">
            {goals.filter(g => !g.completed).length}
          </p>
        </div>

        <div className="glass-card bg-purple-500/5 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-6 h-6 text-purple-400" />
            <h3 className="font-semibold text-purple-300">Total Goals</h3>
          </div>
          <p className="text-3xl font-bold text-purple-400">{goals.length}</p>
        </div>
      </div>
    </div>
  );
}