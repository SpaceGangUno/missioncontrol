import React, { useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  onClose: () => void;
}

export default function DatePicker({ selected, onSelect, onClose }: Props) {
  const disabledDays = { before: new Date() };
  const currentMonth = new Date();

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="glass-card p-4 sm:p-6 rounded-xl shadow-xl bg-navy-900/95 w-full sm:w-auto mx-auto relative"
      role="dialog"
      aria-label="Date picker"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
        aria-label="Close date picker"
      >
        <X className="w-5 h-5" />
      </button>
      
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={disabledDays}
        defaultMonth={currentMonth}
        modifiersClassNames={{
          selected: 'rdp-day_selected',
          today: 'rdp-day_today'
        }}
        modifiersStyles={{
          disabled: { color: '#4b5563' },
          selected: { 
            backgroundColor: 'rgb(99 102 241 / 0.3)',
            color: '#e2e8f0',
            border: '2px solid rgb(99 102 241 / 0.5)'
          },
          today: {
            color: '#38bdf8',
            fontWeight: 'bold'
          }
        }}
        className="text-sky-100"
        styles={{
          caption: { color: '#e2e8f0' },
          head: { color: '#94a3b8' },
          day: { color: '#e2e8f0' },
          nav_button_previous: {
            color: '#38bdf8',
            opacity: 0.6,
            ':hover': { opacity: 1 }
          },
          nav_button_next: {
            color: '#38bdf8',
            opacity: 0.6,
            ':hover': { opacity: 1 }
          }
        }}
        formatters={{
          formatCaption: (date) => (
            <span className="text-xl font-semibold">
              {format(date, 'MMMM yyyy')}
            </span>
          )
        }}
        components={{
          IconLeft: () => <ChevronLeft className="w-4 h-4" />,
          IconRight: () => <ChevronRight className="w-4 h-4" />
        }}
        showOutsideDays={false}
        fixedWeeks
        footer={
          <div className="mt-4 text-sm text-sky-400/60 text-center">
            {selected ? (
              <p>Selected: {format(selected, 'MMMM d, yyyy')}</p>
            ) : (
              <p>Please pick a date</p>
            )}
          </div>
        }
        fromDate={new Date()}
        toDate={new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth())}
        captionLayout="dropdown"
        classNames={{
          root: 'rdp',
          caption: 'rdp-caption',
          caption_label: 'rdp-caption_label',
          nav: 'rdp-nav space-x-1',
          nav_button: 'rdp-nav_button glass-card p-2 hover:bg-white/5 rounded-lg transition-colors',
          nav_button_previous: 'rdp-nav_button_previous',
          nav_button_next: 'rdp-nav_button_next',
          table: 'rdp-table',
          head: 'rdp-head',
          head_row: 'rdp-head_row',
          head_cell: 'rdp-head_cell',
          tbody: 'rdp-tbody',
          row: 'rdp-row',
          cell: 'rdp-cell p-0',
          day: 'rdp-day p-3 hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/40',
          day_selected: 'rdp-day_selected',
          day_today: 'rdp-day_today',
          day_outside: 'rdp-day_outside',
          day_disabled: 'rdp-day_disabled opacity-50 cursor-not-allowed',
          day_hidden: 'rdp-day_hidden'
        }}
      />
    </div>
  );
}
