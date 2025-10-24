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
    ...(function() {
      try {
        const keyPath = path.resolve(__dirname, 'dev-naver.i4624.info-key.pem')
        const certPath = path.resolve(__dirname, 'dev-naver.i4624.info.pem')
        
        // 인증서 파일이 존재할 때만 HTTPS 사용 (빌드 시에는 파일이 없으므로 자동으로 HTTP)
        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
          console.log('HTTPS 인증서를 찾았습니다. HTTPS로 실행됩니다.')
          return {
            https: {
              key: fs.readFileSync(keyPath),
              cert: fs.readFileSync(certPath)
            }
          }
        } else {
          console.log('HTTPS 인증서를 찾을 수 없습니다. HTTP로 실행됩니다.')
        }
      } catch (error) {
        console.warn('HTTPS 인증서를 로드할 수 없습니다. HTTP로 실행됩니다.', error.message)
      }
      return {}
    })()
  },
})
