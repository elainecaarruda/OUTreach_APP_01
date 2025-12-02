import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5000,
        host: '0.0.0.0',
        allowedHosts: true,
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            secure: false,
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
              'vendor-motion': ['framer-motion'],
              'vendor-query': ['@tanstack/react-query'],
              'vendor-icons': ['lucide-react'],
            }
          }
        },
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production'
          }
        },
        chunkSizeWarningLimit: 1000,
        target: 'es2020',
        sourcemap: mode === 'production' ? false : 'inline'
      },
      optimize: {
        esbuild: {
          drop: mode === 'production' ? ['console', 'debugger'] : []
        }
      }
    };
});
