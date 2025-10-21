import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  // Normal bots cannot access
  const disallowedPaths = [
        "/example",
    ];

  // Blocked user agents
  const blockedAgents = [
    "GPTBot",
    "Google-Extended",
  ];

  // Default rule
  const defaultRules = [
    "User-agent: *",
    "Allow: /",
    ...disallowedPaths.map((path) => `Disallow: ${path}`),
    "",
  ];

  // Blocked bot rules
  const blockedRules = blockedAgents
    .map(
      (agent) => [
        `User-agent: ${agent}`,
        "Disallow: /",
        "",
      ].join("\n")
    )
    .join("\n");


  const content = [
    blockedRules,
    ...defaultRules,
    `Sitemap: https://baggel.de/sitemap-index.xml`,
  ].join("\n");

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
