import { fileURLToPath, URL } from 'node:url'

import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), mkcert()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  assetsInclude: ['**/*.gltf'],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'levels/viewer': resolve(__dirname, 'levels/viewer/index.html')
      },
    },
    outDir: resolve(__dirname, "../public"),
    emptyOutDir: true
  },
  server: {
    https: true
  }
})