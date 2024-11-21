import { ThemeColors } from '../types';

export function hexToRgb(hex: string): string {
  try {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : 
      '56 189 248';
  } catch (error) {
    console.error('Error converting hex to RGB:', error);
    return '56 189 248'; // Default to a nice blue color
  }
}

let themeInitialized = false;

export function updateCSSVariables(theme: ThemeColors): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !document?.documentElement) {
    console.warn('Attempted to update CSS variables in non-browser environment');
    return;
  }

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

    if (!themeInitialized) {
      // Add base styles to ensure proper theme application
      const style = document.createElement('style');
      style.textContent = `
        :root {
          color-scheme: dark;
        }
        
        body {
          margin: 0;
          color: var(--theme-text-color);
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background: var(--theme-background);
          background-image: var(--theme-background-gradient);
          min-height: 100vh;
        }

        #root {
          min-height: 100vh;
        }

        .glass-card {
          background: var(--theme-card-background);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .glass-input {
          background: var(--theme-card-background);
          color: var(--theme-text-color);
        }

        .glass-input::placeholder {
          color: var(--theme-text-secondary);
        }
      `;
      document.head.appendChild(style);
      themeInitialized = true;
    }

    console.log('Theme updated successfully');
  } catch (error) {
    console.error('Error updating theme:', error);
  }
}
