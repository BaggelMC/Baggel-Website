const GAMEMODES = "/src/assets/images/gamemodes";

const lowAndMed = import.meta.glob<string[]>(
  "/src/assets/images/gamemodes/*.png",
  {
    eager: true,
    import: "default",
    query: { w: "100;800", format: "webp" },
  },
);

const high = import.meta.glob<string>("/src/assets/images/gamemodes/*.png", {
  eager: true,
  import: "default",
  query: { w: "1400", format: "png" },
});

const icons = import.meta.glob<string>(
  "/src/assets/images/gamemodes/icons/*.png",
  {
    eager: true,
    import: "default",
    query: { w: "128", format: "webp" },
  },
);

/** Returns [low, medium, high] quality URLs, in the order progressiveImages.ts expects. */
export function getGameImages(name: string): [string, string, string] {
  const key = `${GAMEMODES}/${name}.png`;
  const [low, med] = lowAndMed[key] ?? [];
  const full = high[key];
  if (!low || !med || !full) {
    throw new Error(
      `Missing game image "${name}.png" in src/assets/images/gamemodes/`,
    );
  }
  return [low, med, full];
}

export function getGameIcon(name: string): string {
  const icon = icons[`${GAMEMODES}/icons/${name}.png`];
  if (!icon) {
    throw new Error(
      `Missing game icon "${name}.png" in src/assets/images/gamemodes/icons/`,
    );
  }
  return icon;
}
