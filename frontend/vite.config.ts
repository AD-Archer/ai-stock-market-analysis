import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// We export a factory so we have access to mode for proper env loading
export default ({ mode }: { mode: string }) => {
  // Load env from project root (one level up) so we can keep a single .env file
  const rootEnvDir = path.resolve(__dirname, '..')
  const env = loadEnv(mode, rootEnvDir, '') // do not filter by prefix here

  // Prefer VITE_ prefixed variables (recommended), fallback to unprefixed for backwards compatibility
  const backendPort = env.VITE_BACKEND_PORT || env.BACKEND_PORT || '8881'
  const frontendPort = parseInt(env.VITE_FRONTEND_PORT || env.FRONTEND_PORT || '8173')

  const explicitApiBase = env.VITE_API_BASE_URL || env.API_BASE_URL

  const backendUrl = explicitApiBase || (
    (env.VITE_DOCKER_ENV === 'true' || env.DOCKER_ENV === 'true')
      ? `http://backend:${backendPort}`
      : `http://localhost:${backendPort}`
  )

  console.log('[vite] Loaded env from', rootEnvDir)
  console.log('[vite] BACKEND_PORT:', backendPort)
  console.log('[vite] FRONTEND_PORT:', frontendPort)
  console.log('[vite] Using backend URL:', backendUrl)

  return defineConfig({
    envDir: rootEnvDir,
    plugins: [react()],
    preview: {
      host: '0.0.0.0',
      port: frontendPort
    },
    server: {
      host: '0.0.0.0',
      port: frontendPort,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (p) => p
        }
      },
      cors: {
        origin: [
          'https://stocks.adarcher.app',
          'https://stocks.archer.software',
          `http://localhost:${frontendPort}`
        ]
      },
      allowedHosts: ['stocks.archer.software', 'stocks.adarcher.app', 'localhost']
    },
    define: {
      // Provide a stable constant for the backend URL and also expose selected env vars
      __APP_BACKEND_URL__: JSON.stringify(backendUrl),
      'import.meta.env.VITE_BACKEND_PORT': JSON.stringify(backendPort),
      'import.meta.env.VITE_FRONTEND_PORT': JSON.stringify(frontendPort.toString()),
      // Preserve explicitly provided VITE_API_BASE_URL (can be absolute https:// or relative /api)
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(explicitApiBase ? explicitApiBase.replace(/\/$/, '') : backendUrl + '/api')
    }
  })
}
