import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // served from https://missjeanbrodie.github.io/unnamed-art-project/ in production
  base: command === 'build' ? '/unnamed-art-project/' : '/',
  plugins: [react()],
  server: { port: 5173, open: true },
}))
