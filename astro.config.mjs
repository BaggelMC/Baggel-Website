// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), imagetools()]
  },
  site: "https://baggel.de",
  compressHTML: true
});
