import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        buy: resolve(__dirname, 'buy.html'),
        sell: resolve(__dirname, 'sell.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        property: resolve(__dirname, 'property.html'),
      },
    },
  },
});
