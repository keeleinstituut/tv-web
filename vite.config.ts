import { defineConfig } from 'vite'
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
    allowedHosts: true
  },
  preview: {
    port: 3000,
    open: false,
  },
})

