import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base public path
  base: './',

  // Source directory
  root: '.',

  // Public assets directory
  publicDir: 'public',

  // Path aliases
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@games': resolve(__dirname, 'src/games'),
      '@characters': resolve(__dirname, 'src/characters'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        launcher: resolve(__dirname, 'launcher.html'),
      },
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-gsap': ['gsap'],
          'vendor-audio': ['howler'],
          'vendor-db': ['sql.js', 'dexie'],
          'vendor-effects': ['canvas-confetti'],
        },
      },
    },
    // Target modern browsers
    target: 'es2022',
    // Minification
    minify: 'esbuild',
  },

  // Dev server configuration
  server: {
    port: 8080,
    open: '/launcher.html',
    cors: true,
    // Headers for SharedArrayBuffer (needed for some WASM features)
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },

  // Preview server (for testing production builds)
  preview: {
    port: 8080,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['gsap', 'howler', 'canvas-confetti'],
    exclude: ['sql.js'], // sql.js uses WASM, handle separately
  },
});
