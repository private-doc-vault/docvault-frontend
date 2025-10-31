import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all addresses (required for Docker)
    port: 5173,
    watch: {
      usePolling: true, // Required for file watching in Docker on some systems
    },
    proxy: {
      '/api': {
        target: 'http://backend:9000', // Backend service in Docker network
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
