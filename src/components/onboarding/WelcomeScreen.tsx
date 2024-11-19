import React, { useState } from 'react';
import { Rocket, Star, ArrowRight } from 'lucide-react';
import { useStore } from '../../lib/store';

export default function WelcomeScreen() {
  const [name, setName] = useState('');
  const { updateUserProfile } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await updateUserProfile({ displayName: name });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="text-center mb-8 relative">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative">
              <Rocket className="w-12 h-12 text-sky-400" />
              <Star className="absolute -right-1 -bottom-1 w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Welcome Aboard
          </h1>
          <p className="text-sky-400/60">
            Before we begin our mission, what should I call you, Captain?
          </p>
        </div>

        <div className="glass-card p-8 relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input text-center text-xl"
                placeholder="Enter your name"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] backdrop-blur-sm active:scale-95"
            >
              Begin Mission
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
