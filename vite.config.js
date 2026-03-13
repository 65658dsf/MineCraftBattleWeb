import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240
    })
  ],
  build: {
    outDir: 'dist',
    target: ['chrome90', 'firefox88', 'safari14', 'edge90']
  }
})
