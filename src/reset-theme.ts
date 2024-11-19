import { useStore } from './lib/store';

// Reset to default cosmic blue theme
useStore.getState().updateUserTheme('cosmic-blue');
