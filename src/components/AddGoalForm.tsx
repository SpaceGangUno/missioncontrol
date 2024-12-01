import React, { useState } from 'react';
import { Goal } from '../types';
import { X, Plus, AlertCircle } from 'lucide-react';

type TimeFrame = 'yearly' | 'monthly' | 'weekly' | 'daily';

interface Props {
  onClose: () => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'completed' | 'createdAt'> & { timeframe: TimeFrame }) => Promise<void>;
}

export default function AddGoalForm({ onClose, onAddGoal }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Goal['priority']>('medium');
  const [category, setCategory] = useState<Goal['category']>('personal');
  const [timeframe, setTimeframe] = useState<TimeFrame>('monthly');
  const [deadline, setDeadline] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      await onAddGoal({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        timeframe,
        deadline: deadline || undefined,
        status: 'not_started',
        progress: 0
      });
      onClose();
    } catch (error) {
      console.error('Error adding goal:', error);
      setError('Failed to add goal');
      setIsAdding(false);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[90] backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="glass-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-sky-100">Add New Goal</h3>
          <button
            onClick={handleClose}
            className="text-sky-400/60 hover:text-sky-400 p-1 rounded-lg hover:bg-white/5 transition-colors"
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
              placeholder="Enter goal title"
              autoFocus
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
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as TimeFrame)}
                className="glass-input"
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-sky-100 mb-1">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="glass-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sky-400 hover:bg-sky-400/10 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !title.trim()}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-sky-500"
            >
              <Plus className="w-4 h-4" />
              {isAdding ? 'Adding...' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
