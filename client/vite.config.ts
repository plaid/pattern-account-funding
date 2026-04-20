import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import'],
      },
    },
  },
  envDir: '..',
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (url) => url.replace(/^\/api/, ''),
      },
      '/sessions': { target: 'http://localhost:5001', changeOrigin: true },
      '/users': { target: 'http://localhost:5001', changeOrigin: true },
      '/items': { target: 'http://localhost:5001', changeOrigin: true },
      '/accounts': { target: 'http://localhost:5001', changeOrigin: true },
      '/appFunds': { target: 'http://localhost:5001', changeOrigin: true },
      '/institutions': { target: 'http://localhost:5001', changeOrigin: true },
      '/link-token': { target: 'http://localhost:5001', changeOrigin: true },
      '/link-event': { target: 'http://localhost:5001', changeOrigin: true },
    },
  },
  build: {
    outDir: 'build',
  },
});
