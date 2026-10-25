import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const webBadges = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/web_badges" }),
  schema: z.object({
    name: z.string().min(1),

    url: z.string().url().refine((u) => /^https?:\/\//.test(u), {
      message: "url must start with http:// or https://",
    }),

    badge: z.string().regex(/^[\w.-]+\.(gif|png|jpe?g|webp|svg)$/i, {
      message: "badge must be a file name in public/web_badges/, e.g. alice.gif",
    }),

    alt: z.string().optional(),
  }),
});

export const collections = {
  webBadges,
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() })
};