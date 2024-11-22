import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "frame-src 'self' https://*.firebaseapp.com https://*.firebase.com",
        "worker-src 'self' blob:"
      ].join('; ')
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
});
