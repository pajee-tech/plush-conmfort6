// Bundles the Express server (server.ts) into dist-api/server.mjs for Vercel and Hostinger.
// npm packages stay external (installed in node_modules), only our own files are bundled.
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  build: {
    ssr: 'server.ts',
    outDir: 'dist-api',
    emptyOutDir: true,
    target: 'node20',
    minify: false,
    rollupOptions: { output: { format: 'es', entryFileNames: 'server.mjs' } },
  },
});
