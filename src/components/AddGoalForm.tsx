import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { Goal } from '../types';
import StarProgress from './StarProgress';
import DatePicker from './DatePicker';
import confetti from 'canvas-confetti';

interface Props {
  onAddGoal: (goal: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => void;
  onClose?: () => void;
  showBanner?: boolean;
}

export default function AddGoalForm({ onAddGoal, onClose, showBanner = true }: Props) {
  const [isOpen, setIsOpen] = useState(!showBanner); // Open immediately if no banner
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Goal['priority']>();
  const [category, setCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Refs for each section
  const descriptionRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect when fields are filled
  useEffect(() => {
    if (title.length > 0) {
      descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [title]);

  useEffect(() => {
    if (description.length > 0) {
      priorityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [description]);

  useEffect(() => {
    if (priority && category) {
      dateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [priority, category]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
      progress: 0,
      status: 'not_started'
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#818cf8', '#c084fc'],
    });

    if (showBanner) {
      setIsOpen(false);
      setTitle('');
      setDescription('');
      setPriority(undefined);
      setCategory('');
      setSelectedDate(undefined);
    } else if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (showBanner) {
      setIsOpen(false);
    } else if (onClose) {
      onClose();
    }
  };

  const renderForm = () => (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div 
        className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm" 
        onClick={handleClose}
      />
      <div className="relative flex-1 overflow-auto">
        <div className="glass-card rounded-t-xl mx-auto max-w-2xl min-h-screen flex flex-col">
          <div className="sticky top-0 z-30 flex justify-between items-center p-4 sm:p-6 bg-navy-900/95 backdrop-blur-md border-b border-sky-500/10">
            <h3 className="text-xl sm:text-2xl font-bold gradient-text">Create New Goal</h3>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors touch-manipulation"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 p-4 sm:p-6">
            <StarProgress currentStep={currentProgress} totalSteps={totalSteps} />

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div ref={descriptionRef}>
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

              <div ref={priorityRef} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

              <div ref={dateRef} className="relative">
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

              {/* Add padding to ensure content is visible above buttons */}
              <div className="h-24" />
            </form>
          </div>

          <div className="sticky bottom-0 p-4 bg-navy-900/90 backdrop-blur-xl border-t border-sky-500/30 shadow-lg shadow-navy-900/50 flex gap-3 justify-end z-[70]">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-white/90 hover:text-white font-medium border border-sky-500/20 hover:border-sky-500/40 rounded-lg transition-all active:scale-95 touch-manipulation min-w-[100px] hover:bg-sky-500/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-3 bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-medium rounded-lg transition-all hover:scale-105 backdrop-blur-sm active:scale-95 touch-manipulation min-w-[100px] border border-indigo-500/30 hover:border-indigo-500/50 shadow-lg shadow-indigo-500/20"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!showBanner) {
    return renderForm();
  }

  return (
    <div className="relative z-20">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] backdrop-blur-sm neon-glow active:scale-95 touch-manipulation"
        >
          <Plus className="w-6 h-6" />
          Create New Goal
        </button>
      ) : (
        renderForm()
      )}
    </div>
  );
}
