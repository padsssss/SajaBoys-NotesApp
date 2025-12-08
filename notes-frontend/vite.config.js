import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],

  // Polyfill Node-style globals some deps expect (e.g., pbkdf2)
  define: {
    global: 'globalThis',
    'process.env': {},
  },

  assetsInclude: ['**/*.wasm'], // <-- CRITICAL FIX

  resolve: {
    alias: {
      stream: 'stream-browserify',
      util: 'util',
      events: 'events',
      buffer: 'buffer',
    },
  },

  server: {
    mimeTypes: {
      'application/wasm': ['wasm'], // <-- Required for Cardano WASM
    },

    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
    include: ['buffer', 'process', 'stream-browserify', 'util', 'events'],
    exclude: [
      "lucid-cardano",
      "@emurgo/cardano-serialization-lib-browser"
    ], // <-- Prevent Vite from breaking WASM
  },
});