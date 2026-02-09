import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  root: 'src',
  base: '/',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        'lyrics-editor': resolve(__dirname, 'src/lyrics-editor/index.html'),
        'timings-editor': resolve(__dirname, 'src/timings-editor/index.html'),
      },
    },
  },
});
