import React from 'react';
import { Goal } from '../../types';
import { format, startOfWeek, addDays } from 'date-fns';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay,
  useSensor, 
  useSensors, 
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import { Calendar, Rocket, Menu, X } from 'lucide-react';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
}

function DraggableGoal({ goal, isDayGoal = false }: { goal: Goal, isDayGoal?: boolean }) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: goal.id,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`glass-card ${isDayGoal ? 'p-2' : 'p-3'} touch-manipulation ${
        goal.completed ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <Rocket className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-medium truncate ${
            goal.completed ? 'line-through' : ''
          }`}>
            {goal.title}
          </div>
          <div className="text-xs text-sky-400/60 line-clamp-2 mt-0.5">
            {goal.description}
          </div>
          {!isDayGoal && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                goal.priority === 'high' ? 'bg-rose-500/20 text-rose-300' :
                goal.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                'bg-emerald-500/20 text-emerald-300'
              }`}>
                {goal.priority}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                {goal.category}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DroppableDay({ day, index, goals, getGoalById }: { 
  day: Date; 
  index: number;
  goals: string[];
  getGoalById: (id: string) => Goal | undefined;
}) {
  const {isOver, setNodeRef} = useDroppable({
    id: `day-${index}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`glass-card p-3 ${
        isOver ? 'ring-2 ring-sky-400' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-sky-400" />
        <div>
          <div className="text-sm font-medium">{format(day, 'EEEE')}</div>
          <div className="text-xs text-sky-400/60">{format(day, 'MMMM d')}</div>
        </div>
      </div>
      
      <div className="space-y-2">
        {goals?.map(goalId => {
          const goal = getGoalById(goalId);
          if (!goal) return null;
          
          return (
            <DraggableGoal key={goal.id} goal={goal} isDayGoal={true} />
          );
        })}
      </div>
    </div>
  );
}

export default function WeekView({ goals, onToggleGoal }: Props) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [weeklyGoals, setWeeklyGoals] = React.useState<{ [key: string]: string[] }>({});
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    })
  );

  const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const unassignedGoals = goals.filter(
    goal => !Object.values(weeklyGoals).flat().includes(goal.id)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) return;

    const goalId = active.id as string;
    const dayId = over.id as string;

    if (dayId.startsWith('day-')) {
      setWeeklyGoals(prev => {
        const newGoals = { ...prev };
        Object.keys(newGoals).forEach(key => {
          newGoals[key] = newGoals[key]?.filter(id => id !== goalId) || [];
        });
        
        if (!newGoals[dayId]) {
          newGoals[dayId] = [];
        }
        newGoals[dayId] = [...newGoals[dayId], goalId];
        return newGoals;
      });
    }

    setActiveId(null);
  }

  const getGoalById = (id: string) => goals.find(goal => goal.id === id);

  return (
    <div className="mobile-container pb-safe">
      <DndContext 
        sensors={sensors} 
        onDragEnd={handleDragEnd} 
        onDragStart={e => setActiveId(e.active.id as string)}
      >
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="glass-card p-3 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-sky-400" />
              <span className="font-medium text-base">Mission Control</span>
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-sky-400/10 rounded-md"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-sky-400" />
              ) : (
                <Menu className="w-5 h-5 text-sky-400" />
              )}
            </button>
          </div>

          {/* Collapsible Navigation Menu */}
          {isMenuOpen && (
            <div className="glass-card p-2 flex flex-col gap-1 sticky top-[60px] z-40">
              <button 
                className="text-sky-400 text-sm w-full text-left px-3 py-2 rounded-md hover:bg-sky-400/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Month
              </button>
              <button 
                className="text-sky-400 text-sm w-full text-left px-3 py-2 rounded-md bg-sky-400/20"
                onClick={() => setIsMenuOpen(false)}
              >
                Week
              </button>
              <button 
                className="text-sky-400 text-sm w-full text-left px-3 py-2 rounded-md hover:bg-sky-400/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Day
              </button>
            </div>
          )}

          {/* Week View - Vertical Layout */}
          <div className="space-y-3 px-3 -mx-3">
            {weekDays.map((day, index) => (
              <DroppableDay
                key={format(day, 'yyyy-MM-dd')}
                day={day}
                index={index}
                goals={weeklyGoals[`day-${index}`] || []}
                getGoalById={getGoalById}
              />
            ))}
          </div>

          {/* Unassigned Goals Section */}
          <div className="glass-card p-3">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-sky-400" />
              Monthly Goals
            </h3>
            <div className="space-y-2">
              {unassignedGoals.map(goal => (
                <DraggableGoal key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="glass-card p-3 shadow-2xl max-w-[90vw]">
              {(() => {
                const goal = getGoalById(activeId);
                if (!goal) return null;
                
                return (
                  <div className="flex items-start gap-2">
                    <Rocket className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{goal.title}</div>
                      <div className="text-xs text-sky-400/60 line-clamp-2 mt-0.5">
                        {goal.description}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
