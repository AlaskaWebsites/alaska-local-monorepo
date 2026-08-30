import { defineConfig } from 'vitest/config'
import path from 'node:path'
import swc from 'unplugin-swc'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.interface.ts',
        '**/*.module.ts',
        'src/main.ts'
      ]
    }
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' }
    })
  ],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@infra': path.resolve(__dirname, './src/infrastructure'),
      '@config': path.resolve(__dirname, './src/config'),
      '@': path.resolve(__dirname, './src')
    }
  }
})
