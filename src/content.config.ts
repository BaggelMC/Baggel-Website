// Defines what a community member looks like.
//
// Each member is ONE small JSON file in src/content/web_badges/, e.g. alice.json.
// The filename (without ".json") becomes the member's `id`. Treat it as
// permanent: people reference ids in their `exclude` / `overrides` config,
// so renaming a file would silently break their sites.
//
// If a file doesn't match the schema, `astro build` fails with a clear message
// instead of publishing a broken list.
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const webBadges = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/web_badges" }),
  schema: z.object({
    // Shown as the tooltip, and as default alt text.
    name: z.string().min(1),

    // Must be a web address. (A plain `.url()` check would also accept
    // `javascript:` links, which we never want.)
    url: z.string().url().refine((u) => /^https?:\/\//.test(u), {
      message: "url must start with http:// or https://",
    }),

    // Just the file name of an image placed in public/web_badges/, e.g. "alice.gif".
    badge: z.string().regex(/^[\w.-]+\.(gif|png|jpe?g|webp|svg)$/i, {
      message: "badge must be a file name in public/web_badges/, e.g. alice.gif",
    }),

    // Optional. Defaults to "<name>'s website".
    alt: z.string().optional(),
  }),
});

export const collections = { webBadges };