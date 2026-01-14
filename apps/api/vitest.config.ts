import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/server.ts', 'src/jobs/**'],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    // Run tests sequentially for database isolation
    sequence: {
      concurrent: false,
    },
    fileParallelism: false,
  },
})
