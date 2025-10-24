export interface TeamMember {
  name: string;
  role?: string;
  bio?: string;
  image: string;
}

const isDev = import.meta.env.DEV;

export async function getTeamMembers(): Promise<TeamMember[]> {
  const modules = import.meta.glob("../assets/team/*/data.json", { eager: true });

  let imageModules;

  if (!isDev) {
    imageModules = import.meta.glob(
      "../assets/team/*/*.{png,jpg,jpeg,gif}", {
      query: { format: 'webp', w: '800',},
      eager: true
    });

  } else {
      imageModules = import.meta.glob(
      "../assets/team/*/*.{png,jpg,jpeg,gif}",
      { eager: true, query: "?url", import: "default" }
    );
  }
  

  const members: TeamMember[] = [];

  for (const path in modules) {
    // @ts-ignore
    const data = modules[path].default;

    const folderMatch = path.match(/\/team\/([^/]+)\//);
    const folderName = folderMatch ? folderMatch[1] : "";

    const imageKey = Object.keys(imageModules).find((imgPath) => {
      return imgPath.includes(`/team/${folderName}/`) && imgPath.toLowerCase().includes("avatar");
    });

    const imageUrl = imageKey ? imageModules[imageKey] : "";

    members.push({
      ...data,
      image: imageUrl,
    });
  }

  return members;
}
