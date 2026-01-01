import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',

    // Global test utilities
    globals: true,

    // Setup files
    setupFiles: ['./tests/setup.ts'],

    // Include patterns
    include: ['tests/**/*.{test,spec}.{js,ts}'],

    // Exclude patterns
    exclude: ['node_modules', 'dist'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },

    // Timeout for async tests
    testTimeout: 10000,

    // Watch mode exclude
    watchExclude: ['node_modules', 'dist'],
  },

  // Path aliases (same as main config)
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@games': resolve(__dirname, 'src/games'),
      '@characters': resolve(__dirname, 'src/characters'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
});
