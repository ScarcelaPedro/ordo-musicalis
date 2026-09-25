import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Reuses the Vite config (Vue plugin + `@` alias) so tests resolve imports exactly like the app.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ['src/**/*.test.ts', 'api/**/*.test.ts'],
      environment: 'node',
    },
  }),
)
