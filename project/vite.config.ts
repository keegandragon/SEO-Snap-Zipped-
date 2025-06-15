import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    hmr: {
      overlay: false
    }
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['fsevents']
  }
})