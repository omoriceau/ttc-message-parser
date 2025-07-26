import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'example/',
        'test/',
        '*.config.js',
        'test-install.js'
      ]
    }
  }
});