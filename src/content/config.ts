import { defineCollection, z } from "astro:content";

const docs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),

    // Label shown in the sidebar. Falls back to `title` if omitted.
    navLabel: z.string().optional(),

    // Controls ordering within the sidebar. Lower numbers appear first.
    navOrder: z.number().default(99),

    // Tombstone: set to true to mark this page as removed in this version.
    removed: z.boolean().default(false),

    // Optional: show a deprecation banner on the page.
    deprecated: z.boolean().default(false),
    deprecationMessage: z.string().optional(),
  }),
});

export const collections = { docs };