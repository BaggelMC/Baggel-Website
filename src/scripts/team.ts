export interface TeamMember {
  name: string;
  role?: string;
  bio?: string;
  image: string;
}

const isDev = import.meta.env.DEV;

export async function getTeamMembers(): Promise<TeamMember[]> {
  const modules = import.meta.glob<Record<string, any>>(
    "../assets/team/*/data.json",
    { eager: true }
  );

  let imageModules: Record<
    string,
    { default?: string; url?: string } | string
  > = {};

  if (!isDev) {
    imageModules = import.meta.glob<
      Record<string, { url: string }>
    >("../assets/team/*/*.{png,jpg,jpeg,gif}", {
      query: { format: "webp", lossless: true },
      eager: true,
    });
  } else {
    imageModules = import.meta.glob<
      Record<string, string | { default: string }>
    >("../assets/team/*/*.{png,jpg,jpeg,gif}", {
      eager: true,
      query: "?url",
      import: "default",
    });
  }

  const members: TeamMember[] = [];

  for (const path in modules) {
    const data = (modules[path] as { default: Omit<TeamMember, "image"> }).default;

    const folderMatch = path.match(/\/team\/([^/]+)\//);
    const folderName = folderMatch ? folderMatch[1] : "";

    const imageKey = Object.keys(imageModules).find((imgPath) => {
      return imgPath.includes(`/team/${folderName}/`) && imgPath.toLowerCase().includes("avatar");
    });

    const imageModule = imageKey ? imageModules[imageKey] : undefined;

    const imageUrl =
      typeof imageModule === "string"
        ? imageModule
        : imageModule?.url || (imageModule as any)?.default || "";

    members.push({
      ...data,
      image: imageUrl,
    });
  }

  return members;
}
