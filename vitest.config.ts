import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@/domain',         replacement: resolve(__dirname, 'src/domain') },
      { find: '@/application',    replacement: resolve(__dirname, 'src/application') },
      { find: '@/infrastructure', replacement: resolve(__dirname, 'src/infrastructure') },
      { find: '@/presentation',   replacement: resolve(__dirname, 'src/presentation') },
      { find: '@/lib',            replacement: resolve(__dirname, 'src/lib') },
      { find: '@/theme',          replacement: resolve(__dirname, 'src/theme') },
    ],
  },
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/theme/**', 'src/db/**'],
    },
  },
});
