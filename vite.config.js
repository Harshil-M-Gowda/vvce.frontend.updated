import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    // In dev: proxy API calls to local backend so CORS isn't needed
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    // Vite's dev server already serves index.html for unknown routes (SPA mode)
    // historyApiFallback is a webpack option — not needed here
  },

  build: {
    outDir: 'dist',
    // Warn if any chunk exceeds 1MB
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split vendor code into a separate chunk for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          utils:  ['axios', 'date-fns'],
        },
      },
    },
  },

  preview: {
    port: 3000,
  },
})
