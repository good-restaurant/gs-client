import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

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
