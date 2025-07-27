import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    // Proxy configuration for development only
    // In production, API calls will use environment variables
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://bazzarbandhu.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/socket.io': {
        target: process.env.VITE_SERVER_URL || 'https://bazzarbandhu.vercel.app',
        ws: true,
      },
    },
  },
})
