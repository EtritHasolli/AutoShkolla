import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

export default defineConfig({
  plugins: [react()],
  define: {
    // CI sets APP_VERSION to the release version (e.g. 1.0.12); the Android
    // updater compares it with the latest release's update.json.
    __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || pkg.version),
  },
  build: {
    chunkSizeWarningLimit: 900,
  },
})
