import React, { useEffect } from 'react';
import { themes } from '../lib/themes';
import { useStore } from '../lib/store';
import { Palette } from 'lucide-react';

export default function ThemeSelector() {
  const { updateUserTheme, currentTheme } = useStore();

  // Set default theme only if no theme is currently set
  useEffect(() => {
    if (!currentTheme || !currentTheme.id) {
      updateUserTheme('cosmic-blue');
    }
  }, []);

  return (
    <div>
      <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
        <Palette className="w-4 h-4 text-sky-400" />
        Theme Selection
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => updateUserTheme(theme.id)}
            className={`group relative p-2 rounded-lg transition-all ${
              currentTheme.id === theme.id 
                ? 'ring-1 ring-sky-500'
                : 'hover:ring-1 hover:ring-sky-500/50'
            }`}
            title={theme.name}
            style={{
              background: theme.backgroundGradient || theme.background,
              fontFamily: theme.fontFamily.split(',')[0].replace(/['"]/g, ''),
            }}
          >
            <div className="flex flex-col gap-1">
              {/* Color Palette Preview */}
              <div className="flex gap-0.5">
                {[theme.primary, theme.secondary, theme.accent].map((color, i) => (
                  <div
                    key={i}
                    className="w-2 h-4 first:rounded-l-md last:rounded-r-md transition-all group-hover:scale-y-110"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Theme Info */}
              <div 
                className="p-1.5 rounded-md text-left"
                style={{ 
                  backgroundColor: theme.cardBackground,
                  color: theme.textColor
                }}
              >
                <div className="font-medium text-xs mb-0.5">{theme.name}</div>
                <div 
                  className="text-[10px] line-clamp-1"
                  style={{ color: theme.secondaryTextColor }}
                >
                  {theme.description}
                </div>
              </div>

              {/* Selected Indicator */}
              {currentTheme.id === theme.id && (
                <div 
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-sky-500 border-2 border-white"
                  style={{ backgroundColor: theme.primary }}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
