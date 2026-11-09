import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The browser only ever talks to this origin; /api is proxied to FastAPI.
// (Same-origin => cookies "just work", and it matches production behind Nginx.)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:8000' },
  },
})
