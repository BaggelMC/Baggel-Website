// @ts-check
import { defineConfig } from 'astro/config';

import { imagetools } from 'vite-imagetools';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [imagetools(), tailwindcss()]
  },

  site: "https://baggel.de",
  compressHTML: true,
  integrations: [sitemap()]
});