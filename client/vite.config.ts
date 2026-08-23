import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  preview: {
    // static site served via `vite preview` on Railway; accept any host
    // (railway.app subdomain now, custom domains later)
    allowedHosts: true,
  },
})
