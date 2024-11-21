import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, HelpCircle } from 'lucide-react';
import { useStore } from '../lib/store';

// Tooltip component for help text
function Tooltip({ text }: { text: string }) {
  return (
    <div className="group relative">
      <HelpCircle className="w-4 h-4 text-sky-400/60 hover:text-sky-400" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-navy-800/95 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {text}
      </div>
    </div>
  );
}

export default function MissionHeader() {
  const { dayPlan } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDay, setCurrentDay] = useState(new Date().getDate());

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevDay = () => {
    setCurrentDay(prev => Math.max(1, prev - 1));
  };

  const handleNextDay = () => {
    setCurrentDay(prev => Math.min(31, prev + 1));
  };

  return (
    <div className="glass-card p-6 mb-6">
      {/* Mission ID and Live Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-mono text-sky-100">Mission Control</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-sky-400/60">live</span>
          </div>
        </div>
        <Tooltip text="Track your mission progress through time. Use controls to navigate between days." />
      </div>

      {/* Timeline Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button 
              onClick={handlePrevDay}
              disabled={currentDay === 1}
              className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handlePlayPause}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label={isPlaying ? "Pause timeline" : "Play timeline"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            <button 
              onClick={handleNextDay}
              disabled={currentDay === 31}
              className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-sky-400/60">
            Day {currentDay}
          </div>
        </div>
        <div className="text-sm text-sky-400/60">
          {dayPlan?.status === 'started' ? 'Mission in Progress' : 'Mission Ready'}
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="relative h-8">
        <div className="absolute inset-0 flex">
          {[...Array(31)].map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 border-l border-sky-500/20 relative ${
                i + 1 === currentDay ? 'border-l-2 border-sky-400' : ''
              }`}
            >
              <span className={`absolute -top-4 text-xs ${
                i + 1 === currentDay ? 'text-sky-400' : 'text-sky-400/40'
              }`}>
                {i + 1}
              </span>
              <div className="h-2 border-l border-sky-500/20 absolute left-1/4"></div>
              <div className="h-2 border-l border-sky-500/20 absolute left-1/2"></div>
              <div className="h-2 border-l border-sky-500/20 absolute left-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
