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
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/socket.io': {
        target: process.env.VITE_SERVER_URL || 'https://bazzarbandhu.vercel.app',
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
    cors: {
      origin: [
        'http://localhost:3002',
        'https://bazzarbandhu.vercel.app',
        'https://*.vercel.app'
      ],
      credentials: true
    }
  },
  build: {
    // Ensure environment variables are available at build time
    define: {
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
      'process.env.VITE_SERVER_URL': JSON.stringify(process.env.VITE_SERVER_URL),
    }
  }
})
