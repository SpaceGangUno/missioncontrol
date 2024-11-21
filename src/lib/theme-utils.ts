import { ThemeColors } from '../types';

export function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : 
    '56 189 248';
}

export function updateCSSVariables(theme: ThemeColors): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !document?.documentElement) return;

  try {
    const root = document.documentElement;
    
    // Update CSS variables
    root.style.setProperty('--theme-primary', hexToRgb(theme.primary));
    root.style.setProperty('--theme-secondary', hexToRgb(theme.secondary));
    root.style.setProperty('--theme-accent', hexToRgb(theme.accent));
    root.style.setProperty('--theme-background', theme.background);
    root.style.setProperty('--theme-background-gradient', theme.backgroundGradient || '');
    root.style.setProperty('--theme-card-background', theme.cardBackground);
    root.style.setProperty('--theme-text-color', theme.textColor);
    root.style.setProperty('--theme-text-secondary', theme.secondaryTextColor);
    root.style.setProperty('--theme-font-family', theme.fontFamily);
    
    // Load font if needed
    const fontName = theme.fontFamily.split(',')[0].replace(/['"]/g, '');
    const fontId = `theme-font-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
    
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
  } catch (error) {
    console.error('Error updating CSS variables:', error);
  }
}

// Initialize default theme if in browser environment
if (typeof window !== 'undefined') {
  import('./themes').then(({ themes }) => {
    updateCSSVariables(themes[0]);
  }).catch(error => {
    console.error('Error loading default theme:', error);
  });
}
