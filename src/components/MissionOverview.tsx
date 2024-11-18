import React from 'react';
import { Timer, Target, CheckCircle, Calendar } from 'lucide-react';
import { Goal } from '../types';
import Gauge from './Gauge';

interface Props {
  date: Date;
  missions: Goal[];
  view: 'month' | 'week' | 'day';
}

export default function MissionOverview({ date, missions = [], view }: Props) {
  const getFilteredMissions = () => {
    if (!missions) return [];
    
    const today = new Date();
    switch (view) {
      case 'month':
        return missions.filter(m => 
          new Date(m.deadline || m.createdAt).getMonth() === today.getMonth() &&
          new Date(m.deadline || m.createdAt).getFullYear() === today.getFullYear()
        );
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return missions.filter(m => {
          const mDate = new Date(m.deadline || m.createdAt);
          return mDate >= weekStart && mDate <= weekEnd;
        });
      case 'day':
        return missions.filter(m => 
          new Date(m.deadline || m.createdAt).toDateString() === today.toDateString()
        );
      default:
        return missions;
    }
  };

  const filteredMissions = getFilteredMissions();
  const progress = filteredMissions.length > 0 
    ? Math.round((filteredMissions.filter(m => m.completed).length / filteredMissions.length) * 100)
    : 0;

  const highPriorityCount = filteredMissions.filter(m => m.priority === 'high').length;
  const completedCount = filteredMissions.filter(m => m.completed).length;

  const getTimeframeLabel = () => {
    switch (view) {
      case 'month':
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `Week of ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
      case 'day':
        return date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' });
      default:
        return '';
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-sky-100 mb-6 flex items-center gap-3">
        <Calendar className="w-6 h-6 text-sky-400" />
        {getTimeframeLabel()}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="flex flex-col items-center justify-center">
          <Gauge 
            value={progress} 
            max={100} 
            label={`${view.charAt(0).toUpperCase() + view.slice(1)}ly Progress`} 
            unit="%" 
            color="#38bdf8"
          />
        </div>

        <div className="glass-card bg-rose-500/5 p-4 sm:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-rose-400" />
            <h3 className="font-semibold text-rose-300">High Priority</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-rose-400">
            {highPriorityCount}
          </p>
        </div>

        <div className="glass-card bg-emerald-500/5 p-4 sm:p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-emerald-300">Completed</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400">
            {completedCount}
          </p>
        </div>
      </div>
    </div>
  );
}