import React from 'react';
import { Goal } from '../types';

interface Props {
  missions: Goal[];
  onToggleMission: (id: string) => void;
  onUpdateProgress: (id: string, status: Goal['status'], progress: number) => void;
}

export default function MissionList({ missions, onToggleMission, onUpdateProgress }: Props) {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Active Missions</h2>
        <div className="space-y-4">
          {missions.map(mission => (
            <div 
              key={mission.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
            >
              <div>
                <h3 className="font-medium">{mission.title}</h3>
                {mission.description && (
                  <p className="text-sm text-sky-400/60 mt-1">{mission.description}</p>
                )}
              </div>
              <button
                onClick={() => onToggleMission(mission.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mission.completed 
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-sky-500/20 text-sky-400'
                }`}
              >
                {mission.completed ? 'Completed' : 'In Progress'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
