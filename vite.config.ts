import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // Needed for proper preview
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443 // Fix for HTTPS environments
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: true
  }
});