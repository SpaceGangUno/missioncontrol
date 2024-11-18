import React from 'react';
import { Goal } from '../types';
import GoalList from './GoalList';

interface Props {
  missions: Goal[];
  onToggleMission: (id: string) => void;
}

export default function MissionList({ missions, onToggleMission }: Props) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold gradient-text mb-6">Active Missions</h2>
      <GoalList goals={missions} onToggleGoal={onToggleMission} />
    </div>
  );
}