import React, { useState } from 'react';
import { Goal } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface Props {
  goal: Goal;
  onClose: () => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
}

export default function EditGoalForm({ goal, onClose, onUpdateGoal }: Props) {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || '');
  const [priority, setPriority] = useState(goal.priority || 'medium');
  const [category, setCategory] = useState(goal.category || 'personal');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await onUpdateGoal(goal.id, {
        title,
        description,
        priority,
        category
      });
      onClose();
    } catch (error) {
      console.error('Error updating goal:', error);
      setError('Failed to update goal');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[90]">
      <div className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-sky-100">Edit Goal</h3>
          <button
            onClick={onClose}
            className="text-sky-400/60 hover:text-sky-400 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 text-rose-300 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sky-100 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sky-100 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input min-h-[100px]"
              placeholder="Add more details about your goal..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sky-100 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Goal['priority'])}
                className="glass-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-sky-100 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Goal['category'])}
                className="glass-input"
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
                <option value="creative">Creative</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sky-400 hover:bg-sky-400/10 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
