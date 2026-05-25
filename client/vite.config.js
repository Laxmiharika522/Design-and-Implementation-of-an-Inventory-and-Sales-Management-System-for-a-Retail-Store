import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1000, // Increased to 1000kB to accommodate large vendor/UI bundles. Monitor bundle sizes regularly.
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios', '@tanstack/react-query'],
          ui: ['lucide-react', 'framer-motion'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  }
})
