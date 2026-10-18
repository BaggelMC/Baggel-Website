// @ts-check
import { defineConfig } from "astro/config";

import { imagetools } from "vite-imagetools";

import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

import starlight from "@astrojs/starlight";
import starlightLinksValidator from 'starlight-links-validator'

import { fileURLToPath } from "node:url";

// https://astro.build/config
export default defineConfig({
  output: "static",
  vite: {
    plugins: [imagetools(), tailwindcss()],
    resolve: {
      alias: {
        "@scripts": fileURLToPath(new URL("./src/scripts", import.meta.url)),
        "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      },
    },
  },

  site: "https://baggel.de",
  compressHTML: true,
  integrations: [
    sitemap(),
    react(),
    starlight({
      title: "Baggel",
      favicon: "favicon.ico",
      logo: {
        src: "./src/assets/logo.png"
      },
      customCss: [
        "./src/styles/docs-theme.css"
      ],
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
        de: {
          label: "Deutsch",
          lang: "de",
        },
      },
      defaultLocale: "root",
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/BaggelMC' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/p8wBMZXAfb' },
      ],

      plugins: [
        starlightLinksValidator(),
      ]
    })
  ],
});
