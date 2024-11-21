import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Calendar, AlertCircle, Loader } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    title: false,
    priority: false
  });

  // ... [Previous refs remain unchanged]

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ... [Previous useEffects remain unchanged]

  const validateForm = () => {
    if (!title.trim()) {
      setError('Please enter a goal title');
      setTouched(prev => ({ ...prev, title: true }));
      return false;
    }
    if (!priority) {
      setError('Please select a priority level');
      setTouched(prev => ({ ...prev, priority: true }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await onAddGoal({
        title: title.trim(),
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
        setTouched({ title: false, priority: false });
      } else if (onClose) {
        onClose();
      }
    } catch (error) {
      setError('Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... [Previous helper functions remain unchanged]

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

          {error && (
            <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex-1 p-4 sm:p-6">
            <StarProgress currentStep={currentProgress} totalSteps={totalSteps} />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Goal Title
                  <span className="text-rose-400 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTouched(prev => ({ ...prev, title: true }));
                  }}
                  required
                  className={`glass-input h-12 sm:h-auto ${
                    touched.title && !title.trim() ? 'border-rose-500/50' : ''
                  }`}
                  placeholder="Enter your goal"
                />
                {touched.title && !title.trim() && (
                  <p className="mt-1 text-sm text-rose-400">Title is required</p>
                )}
              </div>

              {/* ... [Rest of the form fields remain unchanged] */}

              <div ref={priorityRef} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">
                    Priority Level
                    <span className="text-rose-400 ml-1">*</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {(['high', 'medium', 'low'] as const).map((p) => (
                      <label
                        key={p}
                        className={`cursor-pointer relative glass-card p-3 sm:p-2 rounded-lg transition-all touch-manipulation ${
                          priority === p 
                            ? 'bg-indigo-500/30 border-indigo-500/50' 
                            : touched.priority && !priority
                            ? 'border-rose-500/50'
                            : 'hover:bg-indigo-500/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={p}
                          checked={priority === p}
                          onChange={(e) => {
                            setPriority(e.target.value as Goal['priority']);
                            setTouched(prev => ({ ...prev, priority: true }));
                          }}
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
                  {touched.priority && !priority && (
                    <p className="mt-1 text-sm text-rose-400">Priority is required</p>
                  )}
                </div>

                {/* ... [Rest of the form fields remain unchanged] */}
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
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-medium rounded-lg transition-all hover:scale-105 backdrop-blur-sm active:scale-95 touch-manipulation min-w-[100px] border border-indigo-500/30 hover:border-indigo-500/50 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
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
