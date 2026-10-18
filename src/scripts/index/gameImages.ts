const lowAndMed = import.meta.glob<string[]>("@assets/images/gamemodes/*.png", {
  eager: true,
  import: "default",
  query: { w: "100;800", format: "webp" },
});

const high = import.meta.glob<string>("@assets/images/gamemodes/*.png", {
  eager: true,
  import: "default",
  query: { w: "1400", format: "png" },
});

const icons = import.meta.glob<string>("@assets/images/gamemodes/icons/*.png", {
  eager: true,
  import: "default",
  query: { w: "128", format: "webp" },
});

/** Re-key a glob result by bare filename (without extension). */
function byName<T>(glob: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(glob).map(([path, value]) => [
      path.split("/").pop()!.replace(/\.png$/, ""),
      value,
    ]),
  );
}

const lowAndMedByName = byName(lowAndMed);
const highByName = byName(high);
const iconsByName = byName(icons);

export function getGameImages(name: string): [string, string, string] {
  const [low, med] = lowAndMedByName[name] ?? [];
  const full = highByName[name];
  if (!low || !med || !full) {
    throw new Error(
      `Missing game image "${name}.png" in src/assets/images/gamemodes/`,
    );
  }
  return [low, med, full];
}

export function getGameIcon(name: string): string {
  const icon = iconsByName[name];
  if (!icon) {
    throw new Error(
      `Missing game icon "${name}.png" in src/assets/images/gamemodes/icons/`,
    );
  }
  return icon;
}