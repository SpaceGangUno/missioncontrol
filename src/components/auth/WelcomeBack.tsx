import React, { useEffect } from 'react';
import { Rocket, Star } from 'lucide-react';

interface Props {
  name: string;
  onComplete: () => void;
}

export default function WelcomeBack({ name, onComplete }: Props) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-navy-900">
      {/* Left Door */}
      <div className="absolute inset-y-0 left-0 right-1/2 bg-navy-800 border-r border-sky-500/20 animate-door-left">
        <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-r from-sky-500/0 to-sky-500/20" />
      </div>
      
      {/* Right Door */}
      <div className="absolute inset-y-0 left-1/2 right-0 bg-navy-800 border-l border-sky-500/20 animate-door-right">
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-l from-sky-500/0 to-sky-500/20" />
      </div>

      {/* Door Frame with Glow Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-sky-500/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-t from-sky-500/20 to-transparent" />
        <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-sky-500/20 animate-glow-pulse" />
      </div>

      {/* Content */}
      <div className="relative text-center z-10 opacity-0 animate-content-fade-in">
        <div className="relative inline-block mb-6">
          <div className="relative">
            <Rocket className="w-16 h-16 text-sky-400" />
            <div className="absolute inset-0 bg-sky-400 blur-xl opacity-20 animate-pulse" />
            <Star className="absolute -right-2 -bottom-2 w-6 h-6 text-indigo-400 animate-pulse" />
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