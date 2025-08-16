import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This exposes the dev server to network by default
    port: 5177
  },
  publicDir: '../images', // Serve images from the shared images folder
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
