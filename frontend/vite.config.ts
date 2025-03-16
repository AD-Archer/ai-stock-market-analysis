import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get port values from environment variables or use defaults
const backendPort = process.env.BACKEND_PORT || '8881'
const frontendPort = parseInt(process.env.FRONTEND_PORT || '8173')

// Check if we're running in Docker or locally
const backendUrl = process.env.VITE_DOCKER_ENV === 'true'
  ? 'http://backend:8000'  // use service name in Docker
  : `http://localhost:${backendPort}` // use environment variable for local dev

console.log('Using backend URL:', backendUrl)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: frontendPort,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        rewrite: (path) => path
      }
    },
    cors: {
      // Allow requests from these domains
      origin: ['https://stocks.adarcher.app', 'https://stocks.archer.software', `http://localhost:${frontendPort}`]
    },
    allowedHosts: ['stocks.archer.software', 'stocks.adarcher.app', 'localhost']
  },
  define: {
    'process.env': process.env
  }
})
