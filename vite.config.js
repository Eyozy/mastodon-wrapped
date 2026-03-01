import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PRIVATE_HOST_RE = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.0|::1$|fc00:|fe80:)/i;

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
        let parsed;
        try {
          parsed = new URL(urlParam);
        } catch {
          res.statusCode = 400;
          res.end('Invalid URL');
          return;
        }
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          res.statusCode = 400;
          res.end('Only http/https URLs are allowed');
          return;
        }
        if (PRIVATE_HOST_RE.test(parsed.hostname)) {
          res.statusCode = 403;
          res.end('Forbidden');
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
