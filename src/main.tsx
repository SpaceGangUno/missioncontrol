import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './components/auth/AuthProvider';
import App from './App';
import './index.css';
import { Loader } from 'lucide-react';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader className="w-8 h-8 animate-spin text-sky-400" />
        <p className="text-sky-400">Loading your missions...</p>
      </div>
    </div>
  );
}

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="glass-card p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold text-rose-400 mb-4">Something went wrong</h1>
            <p className="text-sky-400/80 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the app
async function initializeApp() {
  try {
    // Initialize root element
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Failed to find the root element');
    }

    // Create root
    const root = createRoot(rootElement);

    // Render app with error boundary and suspense
    root.render(
      <ErrorBoundary>
        <React.StrictMode>
          <Suspense fallback={<LoadingFallback />}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </Suspense>
        </React.StrictMode>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Show error UI
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const root = createRoot(rootElement);
      root.render(
        <div className="flex items-center justify-center min-h-screen">
          <div className="glass-card p-6 max-w-md mx-auto">
            <h1 className="text-xl font-bold text-rose-400 mb-4">Initialization Error</h1>
            <p className="text-sky-400/80 mb-4">
              {error instanceof Error ? error.message : 'Failed to initialize application'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
  }
}

// Start the app
initializeApp().catch(error => {
  console.error('Critical initialization error:', error);
});
