// Generates /web_badges.json at build time. This is the file embed.js downloads.
//
// Output shape (version 1):
//   { "version": 1, "members": [ { id, name, url, badge, alt }, ... ] }
//
// Requires `site` to be set in astro.config.mjs, because the badge URLs in the
// output are absolute (e.g. https://baggel.de/web_badges/alice.gif).
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { existsSync } from "node:fs";
import path from "node:path";

export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error("Set `site` in astro.config.mjs, e.g. site: 'https://baggel.de'");
  }

  const entries = await getCollection("webBadges");

  const members = entries
    // Alphabetical by id, so the output (and its git diff) is stable.
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((entry) => {
      // Fail the build if the image is missing, rather than ship a broken badge.
      const file = path.resolve(process.cwd(), "public", "web_badges", entry.data.badge);
      if (!existsSync(file)) {
        throw new Error(`Member "${entry.id}": public/web_badges/${entry.data.badge} does not exist`);
      }

      return {
        id: entry.id,
        name: entry.data.name,
        url: entry.data.url,
        badge: new URL(`web_badges/${entry.data.badge}`, site).href,
        alt: entry.data.alt ?? `${entry.data.name}'s website`,
      };
    });

  return new Response(JSON.stringify({ version: 1, members }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};