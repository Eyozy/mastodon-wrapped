import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          // Charts - lazy loaded
          'charts-vendor': ['recharts', 'react-calendar-heatmap'],
          // UI utilities
          'ui-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') {
            return 'assets/critical-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Enable more aggressive minification
    target: 'es2020',
    modulePreload: {
      polyfill: false, // Reduce polyfill overhead
      resolveDependencies: (filename, deps) => {
        // Don't preload charts-vendor on initial page load
        return deps.filter(dep => !dep.includes('charts-vendor'));
      },
    },
  },
})
