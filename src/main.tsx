import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './components/auth/AuthProvider';
import App from './App';
import './index.css';

// Error boundary for the entire app
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-md w-full text-center">
            <h1 className="text-xl font-bold text-sky-400 mb-4">Something went wrong</h1>
            <p className="text-sky-400/60 mb-6">We're sorry, but something went wrong. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Create root and render app
const root = createRoot(rootElement);

// Wrap app with error boundary, strict mode, and auth provider
root.render(
  <ErrorBoundary>
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  </ErrorBoundary>
);
