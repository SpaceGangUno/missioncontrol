import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface Props {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  onClose: () => void;
}

export default function DatePicker({ selected, onSelect, onClose }: Props) {
  const disabledDays = { before: new Date() };
  const currentMonth = new Date();

  return (
    <div className="glass-card p-4 sm:p-6 rounded-xl shadow-xl bg-navy-900/95 w-full sm:w-auto mx-auto relative">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
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
          disabled: { color: '#4b5563' }
        }}
        className="text-sky-100"
        styles={{
          caption: { color: '#e2e8f0' },
          head: { color: '#94a3b8' },
          day: { color: '#e2e8f0' }
        }}
        formatters={{
          formatCaption: (date) => (
            <span className="text-xl font-semibold">
              {format(date, 'MMMM yyyy')}
            </span>
          )
        }}
      />
    </div>
  );
}