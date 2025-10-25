// @ts-check
import { defineConfig } from 'astro/config';

import { imagetools } from 'vite-imagetools';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: "static",
  vite: {
    plugins: [imagetools(), tailwindcss()]
  },

  site: "https://baggel.de",
  compressHTML: true,
  integrations: [sitemap(), react()]
});