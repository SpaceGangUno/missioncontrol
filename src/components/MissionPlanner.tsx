import React from 'react';
import { Goal } from '../types';
import AddGoalForm from './AddGoalForm';

interface Props {
  onAddMission: (mission: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => void;
}

export default function MissionPlanner({ onAddMission }: Props) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold gradient-text mb-6">Mission Planner</h2>
      <AddGoalForm onAddGoal={onAddMission} />
    </div>
  );
}