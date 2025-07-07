import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'project/public', // ← Netlify に _redirects 認識させる！
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
