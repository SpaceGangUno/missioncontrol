import React, { useState, useRef, useEffect } from 'react';
import { Goal } from '../../types';
import { Sparkles, HelpCircle, ZoomIn, ZoomOut, Move } from 'lucide-react';
import EditGoalForm from '../EditGoalForm';
import AddGoalForm from '../AddGoalForm';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  onAddGoal: (goal: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface Touch {
  x: number;
  y: number;
  timestamp: number;
}

// Generate a unique color based on index
function generateUniqueColor(index: number): string {
  const goldenRatio = 0.618033988749895;
  const hue = (index * goldenRatio) % 1;
  const s = 0.7;
  const l = 0.6;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((hue * 6) % 2 - 1));
  const m = l - c/2;

  let r, g, b;
  if (hue < 1/6) {
    [r, g, b] = [c, x, 0];
  } else if (hue < 2/6) {
    [r, g, b] = [x, c, 0];
  } else if (hue < 3/6) {
    [r, g, b] = [0, c, x];
  } else if (hue < 4/6) {
    [r, g, b] = [0, x, c];
  } else if (hue < 5/6) {
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

export default function MonthlyView({ goals, onToggleGoal, onUpdateGoal, onAddGoal }: Props) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [startPosition, setStartPosition] = useState<Position>({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState<Position>({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState<Velocity>({ x: 0, y: 0 });
  const [lastTouch, setLastTouch] = useState<Touch | null>(null);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const momentumRef = useRef<number>();

  // Group goals by priority for different orbital paths
  const priorityGoals = {
    high: goals.filter(g => g.priority === 'high'),
    medium: goals.filter(g => g.priority === 'medium'),
    low: goals.filter(g => g.priority === 'low'),
  };

  // Calculate initial scale to fit all goals
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      const orbitLevels = Object.keys(priorityGoals).length;
      const maxOrbitSize = (orbitLevels + 1) * 280;
      
      const scaleX = containerWidth / maxOrbitSize;
      const scaleY = containerHeight / maxOrbitSize;
      const fitScale = Math.min(scaleX, scaleY) * 0.8;
      
      setScale(fitScale);
      setPosition({
        x: (containerWidth - maxOrbitSize * fitScale) / 2,
        y: (containerHeight - maxOrbitSize * fitScale) / 2
      });
    }
  }, [goals]);

  // Momentum scrolling
  useEffect(() => {
    const applyMomentum = () => {
      if (!isDragging && (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1)) {
        setPosition(prev => ({
          x: prev.x + velocity.x,
          y: prev.y + velocity.y
        }));
        
        setVelocity(prev => ({
          x: prev.x * 0.95,
          y: prev.y * 0.95
        }));
        
        momentumRef.current = requestAnimationFrame(applyMomentum);
      }
    };

    if (!isDragging && (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.y) > 0.1)) {
      momentumRef.current = requestAnimationFrame(applyMomentum);
    }

    return () => {
      if (momentumRef.current) {
        cancelAnimationFrame(momentumRef.current);
      }
    };
  }, [isDragging, velocity]);

  let globalGoalIndex = 0;

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    return Math.hypot(touch1.x - touch2.x, touch1.y - touch2.y);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (momentumRef.current) {
      cancelAnimationFrame(momentumRef.current);
    }
    setVelocity({ x: 0, y: 0 });

    if (e.touches.length === 2) {
      const touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY, timestamp: Date.now() };
      const touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY, timestamp: Date.now() };
      setInitialDistance(getDistance(touch1, touch2));
      setInitialScale(scale);
      setIsZooming(true);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = { 
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        timestamp: Date.now()
      };
      setLastTouch(touch);
      setStartPosition({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
      setLastPosition(position);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2 && initialDistance !== null) {
      const touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY, timestamp: Date.now() };
      const touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY, timestamp: Date.now() };
      const currentDistance = getDistance(touch1, touch2);
      
      if (initialScale !== null) {
        const newScale = (currentDistance / initialDistance) * initialScale;
        const clampedScale = Math.min(Math.max(newScale, 0.5), 2);
        
        setScale(prev => prev + (clampedScale - prev) * 0.1);
      }
    } else if (e.touches.length === 1 && isDragging && lastTouch) {
      const touch = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        timestamp: Date.now()
      };
      
      const deltaTime = touch.timestamp - lastTouch.timestamp;
      if (deltaTime > 0) {
        setVelocity({
          x: (touch.x - lastTouch.x) / deltaTime * 16,
          y: (touch.y - lastTouch.y) / deltaTime * 16
        });
      }
      
      const newX = e.touches[0].clientX - startPosition.x;
      const newY = e.touches[0].clientY - startPosition.y;
      
      setPosition({ x: newX, y: newY });
      setLastTouch(touch);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsZooming(false);
    setLastPosition(position);
    setInitialDistance(null);
    setInitialScale(scale);
    setLastTouch(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (momentumRef.current) {
      cancelAnimationFrame(momentumRef.current);
    }
    setVelocity({ x: 0, y: 0 });
    setIsDragging(true);
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    setLastPosition(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - startPosition.x;
    const newY = e.clientY - startPosition.y;
    
    setPosition({ x: newX, y: newY });
    
    setVelocity({
      x: (newX - position.x) * 0.1,
      y: (newY - position.y) * 0.1
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastPosition(position);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const zoomFactor = 0.001;
    const targetScale = scale * (1 + delta * zoomFactor);
    const clampedScale = Math.min(Math.max(targetScale, 0.5), 2);
    
    setScale(prev => prev + (clampedScale - prev) * 0.1);
  };

  useEffect(() => {
    const handleMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false);
        setLastPosition(position);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (momentumRef.current) {
        cancelAnimationFrame(momentumRef.current);
      }
    };
  }, [isDragging, position]);

  return (
    <div className="space-y-4">
      {/* Help Section */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-sky-100">Monthly Goal Universe</h2>
          <Tooltip text="Visualize your goals as planets orbiting in space. High priority goals are closer to the center." />
        </div>
        <div className="flex items-center gap-4 text-sm text-sky-400/80">
          <div className="flex items-center gap-1">
            <Move className="w-4 h-4" />
            <span>Drag to move</span>
          </div>
          <div className="flex items-center gap-1">
            <ZoomIn className="w-4 h-4" />
            <span>Scroll to zoom</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span className="text-sm text-sky-100">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-500" />
            <span className="text-sm text-sky-100">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-sky-100">Low Priority</span>
          </div>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="relative h-[600px] overflow-hidden rounded-xl glass-card">
        <div
          ref={containerRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            transformOrigin: 'center',
            transition: isDragging || isZooming ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          aria-label="Interactive goal visualization"
        >
          {/* Space background with stars */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Central planet (represents the month) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button 
              onClick={() => setShowAddGoal(true)}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl animate-pulse-slow hover:scale-110 transition-transform cursor-pointer relative"
              aria-label="Add new goal"
            >
              <div className="absolute inset-0 rounded-full bg-black opacity-20 pointer-events-none"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white/80 pointer-events-none" />
              <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium opacity-0 hover:opacity-100 transition-opacity">
                Create New Goal
              </span>
            </button>
          </div>

          {/* Orbital paths */}
          {Object.entries(priorityGoals).map(([priority, priorityGoals], index) => {
            const orbitColor = priority === 'high' ? 'indigo' : priority === 'medium' ? 'sky' : 'emerald';
            return (
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
                  className={`absolute inset-0 rounded-full border border-${orbitColor}-500/20`}
                  style={{ transform: 'rotate(45deg)' }}
                  aria-hidden="true"
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
       