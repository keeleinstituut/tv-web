import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svgr({
      include: '**/*.svg?react',
    }),
  ],
  envPrefix: 'REACT_APP_',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        loadPaths: [path.resolve(__dirname, 'src')],
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Match CRA format: static/media/filename.hash.ext
        assetFileNames: 'static/media/[name].[hash][extname]',
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  preview: {
    port: 3000,
    open: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'build', '.git'],
    coverage: {
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/setupTests.ts',
        'src/vite-env.d.ts',
      ],
    },
  },
})

