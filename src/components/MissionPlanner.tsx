import React, { useState } from 'react';
import { Goal } from '../types';
import AddGoalForm from './AddGoalForm';
import { Plus } from 'lucide-react';

interface Props {
  onAddMission: (mission: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => Promise<void>;
}

export default function MissionPlanner({ onAddMission }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddGoal = async (goal: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => {
    try {
      await onAddMission(goal);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold gradient-text">Mission Planner</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Goal
        </button>
      </div>
      
      {/* Only render AddGoalForm when showAddForm is true */}
      {showAddForm && (
        <AddGoalForm 
          onAddGoal={handleAddGoal}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
