import React from 'react';
import { Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  currentStep: number;
  totalSteps: number;
}

export default function StarProgress({ currentStep, totalSteps }: Props) {
  const stars = Array.from({ length: totalSteps }, (_, i) => i < currentStep);

  React.useEffect(() => {
    if (currentStep === totalSteps) {
      const duration = 3000;
      const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 0,
        colors: ['#38bdf8', '#818cf8', '#c084fc']
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(() => {
        const timeLeft = duration - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Launch confetti from both sides
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [currentStep, totalSteps]);

  return (
    <div className="flex justify-center gap-2 mb-6">
      {stars.map((filled, index) => (
        <div
          key={index}
          className={`transform transition-all duration-300 ${
            filled ? 'scale-110' : 'scale-100'
          }`}
        >
          <Star
            fill={filled ? 'url(#star-gradient)' : 'none'}
            className={`w-8 h-8 transition-all duration-300 ${
              filled
                ? 'text-sky-400 animate-data-flow'
                : 'text-gray-600'
            }`}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          />
        </div>
      ))}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}