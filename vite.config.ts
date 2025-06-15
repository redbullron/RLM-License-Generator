import { defineConfig } from "vite";
import tsconfigPaths from 'vite-tsconfig-paths';
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [tsconfigPaths(), react()],

  // Vite options tailored for Electron development
  clearScreen: false,
  
  // Base path for the app
  base: './',
  
  // Server configuration
  server: {
    port: 1420,
    strictPort: true,
    host: false,
    watch: {
      // tell vite to ignore watching `electron`
      ignored: ["**/electron/**"],
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));