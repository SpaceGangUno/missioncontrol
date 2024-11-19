import React, { useState } from 'react';
import { Goal } from '../../types';
import { Sparkles } from 'lucide-react';
import GoalDetailsModal from '../GoalDetailsModal';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
}

// Generate a unique color based on index
function generateUniqueColor(index: number): string {
  // Use golden ratio for better color distribution
  const goldenRatio = 0.618033988749895;
  const hue = (index * goldenRatio) % 1;
  
  // Convert HSL to RGB then to hex
  const h = hue;
  const s = 0.7; // High saturation for vibrant colors
  const l = 0.6; // Medium lightness for visibility

  // HSL to RGB conversion
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c/2;

  let r, g, b;
  if (h < 1/6) {
    [r, g, b] = [c, x, 0];
  } else if (h < 2/6) {
    [r, g, b] = [x, c, 0];
  } else if (h < 3/6) {
    [r, g, b] = [0, c, x];
  } else if (h < 4/6) {
    [r, g, b] = [0, x, c];
  } else if (h < 5/6) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function MonthlyView({ goals, onToggleGoal }: Props) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Group goals by priority for different orbital paths
  const priorityGoals = {
    high: goals.filter(g => g.priority === 'high'),
    medium: goals.filter(g => g.priority === 'medium'),
    low: goals.filter(g => g.priority === 'low'),
  };

  // Keep track of total goals for color generation
  let globalGoalIndex = 0;

  return (
    <div className="relative min-h-[600px] overflow-hidden rounded-xl glass-card p-8">
      {/* Space background with stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse-slow"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Central planet (represents the month) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl animate-pulse-slow">
          <div className="absolute inset-0 rounded-full bg-black opacity-20"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white/80" />
        </div>
      </div>

      {/* Orbital paths */}
      {Object.entries(priorityGoals).map(([priority, priorityGoals], index) => (
        <div
          key={priority}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `${(index + 2) * 280}px`,
            height: `${(index + 2) * 280}px`,
          }}
        >
          {/* Orbital path line */}
          <div
            className="absolute inset-0 rounded-full border border-sky-500/20"
            style={{ transform: 'rotate(45deg)' }}
          />

          {/* Goals in orbit */}
          {priorityGoals.map((goal, i) => {
            const angle = (i * 360) / priorityGoals.length;
            const delay = i * 0.5;
            const goalColor = generateUniqueColor(globalGoalIndex++);
            
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal)}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${angle}deg) translateX(${(index + 2) * 140}px) rotate(-${angle}deg)`,
                }}
              >
                <div
                  className={`relative w-8 h-8 rounded-full transition-all duration-300 
                    hover:scale-150 hover:z-50 ${goal.completed ? 'opacity-70' : ''}`}
                  style={{ 
                    background: `linear-gradient(45deg, ${goalColor}, ${adjustColor(goalColor, 20)})`,
                    boxShadow: `0 0 20px ${goalColor}80`,
                    animationDelay: `${delay}s`
                  }}
                >
                  {/* Glow effect */}
                  <div 
                    className="absolute inset-0 rounded-full animate-pulse-slow"
                    style={{ 
                      background: `linear-gradient(45deg, ${goalColor}, ${adjustColor(goalColor, 20)})`,
                      filter: 'blur(8px)',
                      opacity: 0.5
                    }}
                  />
                  
                  {/* Title tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-sm text-white bg-black/50 px-2 py-1 rounded">
                    {goal.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ))}

      {/* Goal Details Modal */}
      <GoalDetailsModal
        goal={selectedGoal}
        onClose={() => setSelectedGoal(null)}
        onToggleGoal={onToggleGoal}
      />
    </div>
  );
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.min(255, Math.max(0, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(hex.substring(4, 6), 16) + amount));
  
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
