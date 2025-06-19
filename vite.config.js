import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.JPG', '**/*.jpg', '**/*.png', '**/*.svg', '**/*.mp4'],
  plugins: [
    react(), 
    svgr(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 75 },
      webp: { quality: 80 },
      svg: { plugins: [{ name: 'removeViewBox', active: false }] },
    })
  ],
  server: {
    hmr: {
      overlay: false,  
    }
  },
  build: {
    rollupOptions: {
      input: 'index.html', 
    },
  },
  define: {
    // eslint-disable-next-line no-undef
    'process.env': process.env
  }, 
  publicDir: 'public',
})