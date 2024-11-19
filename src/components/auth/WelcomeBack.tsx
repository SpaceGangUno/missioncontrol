import React, { useEffect } from 'react';
import { Rocket, Star } from 'lucide-react';

interface Props {
  name: string;
  onComplete: () => void;
}

export default function WelcomeBack({ name, onComplete }: Props) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-navy-900">
      {/* Content */}
      <div className="relative text-center z-10">
        <div className="relative inline-block mb-6">
          <div className="relative">
            <Rocket className="w-16 h-16 text-sky-400" />
            <Star className="absolute -right-2 -bottom-2 w-6 h-6 text-indigo-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent mb-3">
          Welcome Back
        </h1>
        <p className="text-2xl text-sky-400/80">
          Captain {name}
        </p>
      </div>
    </div>
  );
}
