import React, { useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { Goal } from '../types';
import StarProgress from './StarProgress';
import DatePicker from './DatePicker';
import confetti from 'canvas-confetti';

interface Props {
  onAddGoal: (goal: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => void;
}

export default function AddGoalForm({ onAddGoal }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Goal['priority']>();
  const [category, setCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const calculateProgress = () => {
    let steps = 0;
    if (title) steps++;
    if (description) steps++;
    if (category) steps++;
    if (selectedDate) steps++;
    if (priority) steps++;
    return steps;
  };

  const totalSteps = 5;
  const currentProgress = calculateProgress();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priority) return;
    
    onAddGoal({
      title,
      description,
      priority,
      category,
      deadline: selectedDate,
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#818cf8', '#c084fc'],
    });

    setIsOpen(false);
    setTitle('');
    setDescription('');
    setPriority(undefined);
    setCategory('');
    setSelectedDate(undefined);
  };

  return (
    <div className="relative z-20">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] backdrop-blur-sm neon-glow active:scale-95 sm:active:scale-[0.98]"
        >
          <Plus className="w-6 h-6" />
          Create New Goal
        </button>
      ) : (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative h-[100dvh] overflow-auto overscroll-contain pb-24">
            <div className="glass-card rounded-t-xl p-4 sm:p-8 mx-auto max-w-2xl">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-navy-900/95 backdrop-blur-md p-4 -mx-4 sm:mx-0 sm:p-0 sm:bg-transparent sm:backdrop-blur-none">
                <h3 className="text-2xl font-bold gradient-text">Create New Goal</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <StarProgress currentStep={currentProgress} totalSteps={totalSteps} />

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
                    className="glass-input"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Priority Level
                    </label>
                    <div className="flex flex-col gap-2">
                      {(['high', 'medium', 'low'] as const).map((p) => (
                        <label
                          key={p}
                          className={`cursor-pointer relative glass-card p-2 rounded-lg transition-all ${
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
                            <span className={`text-xs capitalize font-medium ${
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
                          className={`cursor-pointer relative glass-card p-2 rounded-lg transition-all ${
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
                            <span className="text-xs capitalize font-medium text-indigo-300">
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
                    className="glass-input flex items-center justify-between"
                  >
                    <span>
                      {selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}
                    </span>
                    <Calendar className="w-5 h-5 text-sky-400" />
                  </button>
                  {showDatePicker && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 z-[60]">
                      <div 
                        className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-[55]"
                        onClick={() => setShowDatePicker(false)}
                      />
                      <div className="relative z-[65] bg-navy-900 rounded-lg shadow-xl border border-sky-500/10">
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

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-900/95 backdrop-blur-md border-t border-sky-500/10 flex gap-3 justify-end z-[70]">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-3 text-white/60 hover:text-white/80 transition-colors active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-white rounded-lg transition-all hover:scale-105 backdrop-blur-sm active:scale-95"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
