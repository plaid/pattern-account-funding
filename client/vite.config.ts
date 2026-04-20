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
  server: {
    port: 3002,
    host: true,
    proxy: {
      '/api': {
        target: 'http://server:5000',
        changeOrigin: true,
        rewrite: (url) => url.replace(/^\/api/, ''),
      },
      '/sessions': { target: 'http://server:5000', changeOrigin: true },
      '/users': { target: 'http://server:5000', changeOrigin: true },
      '/items': { target: 'http://server:5000', changeOrigin: true },
      '/accounts': { target: 'http://server:5000', changeOrigin: true },
      '/appFunds': { target: 'http://server:5000', changeOrigin: true },
      '/institutions': { target: 'http://server:5000', changeOrigin: true },
      '/link-token': { target: 'http://server:5000', changeOrigin: true },
      '/link-event': { target: 'http://server:5000', changeOrigin: true },
    },
  },
  build: {
    outDir: 'build',
  },
});
