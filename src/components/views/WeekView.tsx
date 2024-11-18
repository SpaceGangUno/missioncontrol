import React from 'react';
import { Goal } from '../../types';
import { format, startOfWeek, addDays } from 'date-fns';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Calendar, Rocket } from 'lucide-react';

interface Props {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
}

export default function WeekView({ goals, onToggleGoal }: Props) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [weeklyGoals, setWeeklyGoals] = React.useState<{ [key: string]: string[] }>({});
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
        // Remove from previous day if exists
        const newGoals = { ...prev };
        Object.keys(newGoals).forEach(key => {
          newGoals[key] = newGoals[key].filter(id => id !== goalId);
        });
        
        // Add to new day
        newGoals[dayId] = [...(newGoals[dayId] || []), goalId];
        return newGoals;
      });
    }

    setActiveId(null);
  }

  const getGoalById = (id: string) => goals.find(goal => goal.id === id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={e => setActiveId(e.active.id as string)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {weekDays.map((day, index) => (
            <div
              key={format(day, 'yyyy-MM-dd')}
              id={`day-${index}`}
              className="glass-card p-4 min-h-[200px] flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-sm font-medium">{format(day, 'EEEE')}</div>
                  <div className="text-xs text-sky-400/60">{format(day, 'MMM d')}</div>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                {weeklyGoals[`day-${index}`]?.map(goalId => {
                  const goal = getGoalById(goalId);
                  if (!goal) return null;
                  
                  return (
                    <div
                      key={goal.id}
                      className={`glass-card p-2 text-sm ${
                        goal.completed ? 'opacity-50' : ''
                      } cursor-move`}
                    >
                      <div className="flex items-start gap-2">
                        <Rocket className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <div>
                          <div className={`font-medium ${
                            goal.completed ? 'line-through' : ''
                          }`}>
                            {goal.title}
                          </div>
                          <div className="text-xs text-sky-400/60 line-clamp-2">
                            {goal.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Unassigned Goals Sidebar */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-sky-400" />
            Monthly Goals
          </h3>
          <div className="space-y-2">
            {unassignedGoals.map(goal => (
              <div
                key={goal.id}
                className={`glass-card p-3 cursor-move ${
                  goal.completed ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <Rocket className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className={`font-medium ${
                      goal.completed ? 'line-through' : ''
                    }`}>
                      {goal.title}
                    </div>
                    <div className="text-sm text-sky-400/60 line-clamp-2">
                      {goal.description}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        goal.priority === 'high' ? 'bg-rose-500/20 text-rose-300' :
                        goal.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {goal.priority}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                        {goal.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="glass-card p-3 w-64 shadow-2xl">
              {(() => {
                const goal = getGoalById(activeId);
                if (!goal) return null;
                
                return (
                  <div className="flex items-start gap-2">
                    <Rocket className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-sm text-sky-400/60 line-clamp-2">
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