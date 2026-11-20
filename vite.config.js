import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          ui: ['@radix-ui/react-popover', '@radix-ui/react-radio-group', '@radix-ui/react-select', 'react-day-picker', 'date-fns'],
          editor: ['@tiptap/react', '@tiptap/starter-kit', 'dompurify'],
        },
      },
    },
  },
  server: {
    port: 5175,
  },
});
