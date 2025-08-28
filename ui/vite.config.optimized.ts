import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Configurare Vite optimizată pentru performanță
export default defineConfig({
  plugins: [react()],
  
  // Optimizări de build
  build: {
    target: 'esnext', // Target modern pentru performanță optimă
    minify: 'terser', // Minificare avansată
    terserOptions: {
      compress: {
        drop_console: true, // Elimină console.log în producție
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    
    // Code splitting optimizat
    rollupOptions: {
      output: {
        manualChunks: {
          // Separă vendor-urile în chunk-uri separate
          vendor: ['react', 'react-dom'],
          ui: ['@/components/ui'],
          charts: ['recharts', 'd3'],
          utils: ['lodash', 'date-fns'],
        },
      },
    },
    
    // Optimizări pentru bundle size
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Dezactivează source maps în producție
  },
  
  // Optimizări de development
  server: {
    hmr: {
      overlay: false, // Dezactivează overlay-ul HMR pentru performanță
    },
  },
  
  // Optimizări de resolve
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  
  // Optimizări de CSS
  css: {
    postcss: {
      plugins: [
        // Autoprefixer pentru compatibilitate
        require('autoprefixer'),
        // CSS minification
        require('cssnano')({
          preset: 'default',
        }),
      ],
    },
  },
  
  // Optimizări de esbuild
  esbuild: {
    drop: ['console', 'debugger'], // Elimină console și debugger
    pure: ['console.log', 'console.info'], // Funcții pure
  },
  
  // Optimizări de dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
    ],
    exclude: [
      // Exclude package-urile mari din pre-bundling
      'firebase',
      'supabase',
    ],
  },
  
  // Performance monitoring
  define: {
    __PERFORMANCE_MONITORING__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});
