import React from 'react';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  color?: string;
}

export default function Gauge({ value, max, label, unit, color = '#38bdf8' }: GaugeProps) {
  const percentage = (value / max) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="gauge-wrapper">
      <svg className="gauge-ring w-full h-full">
        <circle
          className="text-navy-800"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="64"
          cy="64"
        />
        <circle
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="64"
          cy="64"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      <div className="gauge-value flex flex-col items-center">
        <span className="text-xl">{value}</span>
        <span className="text-xs opacity-60">{unit}</span>
      </div>
      <div className="absolute -bottom-6 left-0 right-0 text-center text-sm text-sky-400/60">
        {label}
      </div>
    </div>
  );
}