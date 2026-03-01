import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function avatarProxyPlugin() {
  return {
    name: 'avatar-proxy',
    configureServer(server) {
      server.middlewares.use('/api/avatar-proxy', async (req, res) => {
        const urlParam = new URL(req.url, 'http://localhost').searchParams.get('url');
        if (!urlParam) {
          res.statusCode = 400;
          res.end('Missing url');
          return;
        }
        try {
          const upstream = await fetch(urlParam, {
            headers: { 'User-Agent': 'MastodonWrapped/1.0' },
          });
          if (!upstream.ok) {
            res.statusCode = upstream.status;
            res.end(`Upstream error: ${upstream.status}`);
            return;
          }
          const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
          const buffer = await upstream.arrayBuffer();
          res.setHeader('Content-Type', contentType);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.end(Buffer.from(buffer));
        } catch (err) {
          res.statusCode = 500;
          res.end(String(err));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), avatarProxyPlugin()],
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
