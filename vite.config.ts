import { defineConfig } from 'vite';

// Served at nunnaconsulting.com/NAIC/hallofbuilders/hall/ until the brand gets its own domain.
// Change HOB_BASE (or this default) to '/' when it moves to hallofbuilders.com.
export default defineConfig({
  base: process.env.HOB_BASE || '/NAIC/hallofbuilders/hall/',
  build: { outDir: 'dist', assetsInlineLimit: 0, target: 'es2020' },
});
