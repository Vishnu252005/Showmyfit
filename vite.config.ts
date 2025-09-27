import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 2300,
    host: true, // This allows access from other devices on your network
    historyApiFallback: true, // This fixes the routing issue when refreshing on client-side routes
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
