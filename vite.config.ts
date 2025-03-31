import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow visit outside
    port: 5173, // local paort
    strictPort: true,
    hmr: {
      host: 'homesvr', // domain name
    },
    allowedHosts: ['homesvr'], // <-- local domain name
  },
});
