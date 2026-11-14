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

const news = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/news" }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      tag: z.string().optional(),
      date: z.coerce.date(),
      image: image(),
      imageAlt: z.string().default(""),
      points: z.array(z.string()).max(4).default([]),
      link: z
        .object({
          href: z.string(),
          label: z.string().default("Mehr erfahren"),
        })
        .optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = {
  webBadges,
  news,
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() })
};
