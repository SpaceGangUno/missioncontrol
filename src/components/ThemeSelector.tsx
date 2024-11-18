import React from 'react';
import { themes } from '../lib/themes';
import { useStore } from '../lib/store';
import { Palette } from 'lucide-react';

export default function ThemeSelector() {
  const { updateUserTheme, currentTheme } = useStore();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Palette className="w-5 h-5 text-sky-400" />
        Theme Colors
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => updateUserTheme(theme.id)}
            className={`group relative p-2 rounded-lg transition-all ${
              currentTheme.id === theme.id 
                ? 'ring-2 ring-sky-500'
                : 'hover:ring-1 hover:ring-sky-500/50'
            }`}
            title={theme.name}
          >
            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                {[theme.primary, theme.secondary, theme.accent].map((color, i) => (
                  <div
                    key={i}
                    className="w-2 h-4 first:rounded-l-md last:rounded-r-md transition-all group-hover:scale-y-110"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="text-xs text-left">
                <div className="font-medium text-white/90">{theme.name}</div>
                <div className="text-[10px] text-white/50 line-clamp-1">{theme.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}