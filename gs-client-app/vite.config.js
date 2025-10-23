import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: path.resolve(__dirname, 'src/quasar-variables.sass')
    })
  ],
  build: {
    outDir: '../dist/client',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    host: 'dev-naver.i4624.info',
    port: 5173,
    strictPort: true,
    cors: true,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'dev-naver.i4624.info-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'dev-naver.i4624.info.pem'))
    }
  },
})
