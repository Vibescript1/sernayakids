import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetUrl = env.VITE_PUBLIC_WORDPRESS_URL || 'https://api.sernayakids.com';
  const isProd = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    // M-1 fix: In Vite 8 (OXC transformer), use `define` to replace console.* with no-ops.
    // This removes the call sites and their string arguments from the production bundle.
    // console.error is intentionally kept for runtime error visibility.
    server: {
      allowedHosts: ['.trycloudflare.com'],
      proxy: {
        '/graphql': {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: "",
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              console.warn(`[Proxy Error /graphql]: ${err.message}`);
              if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Gateway Error', message: 'WordPress target is offline or DNS failed.' }));
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              const sc = proxyRes.headers['set-cookie'];
              if (sc) {
                proxyRes.headers['set-cookie'] = (Array.isArray(sc) ? sc : [sc]).map(cookie => {
                  const parts = cookie.split(';');
                  const nameValue = parts[0];
                  const expiresPart = parts.find(p => p.trim().toLowerCase().startsWith('expires='));
                  return `${nameValue}; Path=/; SameSite=Lax; HttpOnly${expiresPart ? `; ${expiresPart.trim()}` : ''}`;
                });
              }
            });
          }
        },
        '/wp-json': {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: "",
          configure: (proxy, _options) => {
            proxy.on('error', (err, req, res) => {
              console.warn(`[Proxy Error /wp-json]: ${err.message}`);
              if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Gateway Error', message: 'WordPress target is offline or DNS failed.' }));
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              const sc = proxyRes.headers['set-cookie'];
              if (sc) {
                proxyRes.headers['set-cookie'] = (Array.isArray(sc) ? sc : [sc]).map(cookie => {
                  const parts = cookie.split(';');
                  const nameValue = parts[0];
                  const expiresPart = parts.find(p => p.trim().toLowerCase().startsWith('expires='));
                  return `${nameValue}; Path=/; SameSite=Lax; HttpOnly${expiresPart ? `; ${expiresPart.trim()}` : ''}`;
                });
              }
            });
          }
        }
      }
    },
    define: {
      'process.env': {},
      'global': 'window',
      // M-1 fix: replace verbose console methods with no-ops in production builds
      ...(isProd ? {
        'console.log': '(()=>{})',
        'console.warn': '(()=>{})',
        'console.info': '(()=>{})',
        'console.debug': '(()=>{})',
      } : {}),
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/@apollo') || id.includes('node_modules/graphql')) {
              return 'vendor-apollo';
            }
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-motion';
            }
          }
        }
      }
    }
  }
})
