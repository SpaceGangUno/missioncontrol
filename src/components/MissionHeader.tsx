import React from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

export default function MissionHeader() {
  return (
    <div className="bg-[#0B0F1A] text-white p-4 rounded-lg mb-6">
      {/* Mission ID and Live Status */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-mono">Ts-3002-RC</h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">live</span>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="flex items-center gap-4 mb-2">
        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Play className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="relative h-8">
        <div className="absolute inset-0 flex">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="flex-1 border-l border-gray-700 relative">
              <span className="absolute -top-4 text-xs text-gray-500">{i}</span>
              <div className="h-2 border-l border-gray-700 absolute left-1/4"></div>
              <div className="h-2 border-l border-gray-700 absolute left-1/2"></div>
              <div className="h-2 border-l border-gray-700 absolute left-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
