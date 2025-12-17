import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'recharts',
      'react-calendar-heatmap'
    ],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['framer-motion', 'clsx', 'tailwind-merge', 'class-variance-authority'],
          'chart-vendor': ['recharts', 'react-calendar-heatmap']
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') {
            return 'assets/critical-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
})
