import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // The AI guide runs in the Worker: run `npx wrangler dev --port 8787` alongside `npm run dev`.
      proxy: { '/api': 'http://127.0.0.1:8787' },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      // .wrangler/ holds wrangler dev state (including the guide cache); watching it would reload the page in a loop.
      watch: process.env.DISABLE_HMR === 'true' ? null : { ignored: ['**/.wrangler/**', '**/dist/**'] },
    },
  };
});
