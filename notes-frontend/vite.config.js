import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],

  assetsInclude: ['**/*.wasm'], // <-- CRITICAL FIX

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
    exclude: [
      "lucid-cardano",
      "@emurgo/cardano-serialization-lib-browser"
    ], // <-- Prevent Vite from breaking WASM
  },
});