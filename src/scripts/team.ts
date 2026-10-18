export interface TeamMember {
  name: string;
  role?: string;
  bio?: string;
  image: string;
}

const dataFiles = import.meta.glob<{ default: Omit<TeamMember, "image"> }>(
  "@assets/team/*/data.json",
  { eager: true },
);

const images = import.meta.glob<string>(
  "@assets/team/*/*.{png,jpg,jpeg,gif,webp,avif,PNG,JPG,JPEG}",
  {
    eager: true,
    import: "default",
    query: { format: "webp", lossless: true },
  },
);

const folderOf = (path: string) => path.split("/").at(-2) ?? "";

export async function getTeamMembers(): Promise<TeamMember[]> {
  return Object.entries(dataFiles).map(([path, mod]) => {
    const folder = folderOf(path);
    const own = Object.entries(images).filter(([p]) => folderOf(p) === folder);

    const [, image = ""] =
      own.find(([p]) => p.toLowerCase().includes("avatar")) ?? own[0] ?? [];

    if (!image) console.warn(`No image found for team member folder "${folder}"`);

    return { ...mod.default, image };
  });
}