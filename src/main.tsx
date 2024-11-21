import React, { Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './components/auth/AuthProvider';
import App from './App';
import './index.css';
import { Loader, AlertCircle, RefreshCw } from 'lucide-react';

// Loading fallback component
function LoadingFallback() {
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowRetry(true);
    }, 30000); // Show retry button after 30 seconds

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader className="w-8 h-8 animate-spin text-sky-400" />
        <p className="text-sky-400">Loading your missions...</p>
        <p className="text-sm text-sky-400/60">Preparing for launch...</p>
        {showRetry && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-rose-400">Connection seems slow.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
          </div>
        )}
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
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-semibold">Houston, we have a problem</h2>
            </div>
            <p className="text-sky-400/80 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <p className="text-sm text-sky-400/60 mb-4">
              This could be due to:
              <ul className="list-disc list-inside mt-2">
                <li>Slow internet connection</li>
                <li>Firewall or security settings</li>
                <li>Temporary service disruption</li>
              </ul>
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
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
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-semibold">Initialization Error</h2>
            </div>
            <p className="text-sky-400/80 mb-4">
              {error instanceof Error ? error.message : 'Failed to initialize application'}
            </p>
            <p className="text-sm text-sky-400/60 mb-4">
              Please try refreshing the page. If the problem persists, check your internet connection.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
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
