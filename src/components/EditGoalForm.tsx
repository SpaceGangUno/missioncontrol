import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { Goal } from '../types';
import StarProgress from './StarProgress';
import DatePicker from './DatePicker';

interface Props {
  goal: Goal;
  onClose: () => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
}

export default function EditGoalForm({ goal, onClose, onUpdateGoal }: Props) {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description);
  const [priority, setPriority] = useState<Goal['priority']>(goal.priority);
  const [category, setCategory] = useState(goal.category);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    goal.deadline ? new Date(goal.deadline) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priority) return;
    
    await onUpdateGoal(goal.id, {
      title,
      description,
      priority,
      category,
      deadline: selectedDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative h-[100dvh] overflow-auto overscroll-contain pb-safe">
        <div className="glass-card rounded-t-xl mx-auto max-w-2xl">
          <div className="sticky top-0 z-30 flex justify-between items-center p-4 sm:p-6 bg-navy-900/95 backdrop-blur-md border-b border-sky-500/10">
            <h3 className="text-xl sm:text-2xl font-bold gradient-text">Edit Goal</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors touch-manipulation"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6 mb-24">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="glass-input h-12 sm:h-auto"
                  placeholder="Enter your goal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="glass-input"
                  placeholder="Describe your goal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">
                    Priority Level
                  </label>
                  <div className="flex flex-col gap-2">
                    {(['high', 'medium', 'low'] as const).map((p) => (
                      <label
                        key={p}
                        className={`cursor-pointer relative glass-card p-3 sm:p-2 rounded-lg transition-all touch-manipulation ${
                          priority === p 
                            ? 'bg-indigo-500/30 border-indigo-500/50' 
                            : 'hover:bg-indigo-500/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={p}
                          checked={priority === p}
                          onChange={(e) => setPriority(e.target.value as Goal['priority'])}
                          className="absolute opacity-0"
                        />
                        <div className="text-center">
                          <span className={`text-sm sm:text-xs capitalize font-medium ${
                            p === 'high' ? 'text-rose-400' :
                            p === 'medium' ? 'text-amber-400' :
                            'text-emerald-400'
                          }`}>
                            {p}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">
                    Category Type
                  </label>
                  <div className="flex flex-col gap-2">
                    {['personal', 'work'].map((cat) => (
                      <label
                        key={cat}
                        className={`cursor-pointer relative glass-card p-3 sm:p-2 rounded-lg transition-all touch-manipulation ${
                          category === cat 
                            ? 'bg-indigo-500/30 border-indigo-500/50' 
                            : 'hover:bg-indigo-500/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={category === cat}
                          onChange={(e) => setCategory(e.target.value)}
                          className="absolute opacity-0"
                        />
                        <div className="text-center">
                          <span className="text-sm sm:text-xs capitalize font-medium text-indigo-300">
                            {cat}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Target Date
                </label>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="glass-input h-12 sm:h-auto flex items-center justify-between touch-manipulation"
                >
                  <span>
                    {selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}
                  </span>
                  <Calendar className="w-5 h-5 text-sky-400" />
                </button>
                {showDatePicker && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div 
                      className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm"
                      onClick={() => setShowDatePicker(false)}
                    />
                    <div className="relative z-[65] w-full max-w-sm bg-navy-900 rounded-lg shadow-xl border border-sky-500/10">
                      <DatePicker
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setShowDatePicker(false);
                        }}
                        onClose={() => setShowDatePicker(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-900/95 backdrop-blur-md border-t border-sky-500/10 flex gap-3 justify-end z-[70]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-white/60 hover:text-white/80 transition-colors active:scale-95 touch-manipulation min-w-[100px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-white rounded-lg transition-all hover:scale-105 backdrop-blur-sm active:scale-95 touch-manipulation min-w-[100px]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
