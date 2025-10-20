export interface TeamMember {
  name: string;
  role?: string;
  bio?: string;
  image: string;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  // Import all data.json files
  const modules = import.meta.glob("../assets/team/*/data.json", { eager: true });

  // Import all images in all team folders
  const imageModules = import.meta.glob("../assets/team/*/*.{png,jpg,jpeg,gif}", { eager: true, as: "url" });

  const members: TeamMember[] = [];

  for (const path in modules) {
    // @ts-ignore
    const data = modules[path].default;

    // Extract folder name from JSON path
    const folderMatch = path.match(/\/team\/([^/]+)\//);
    const folderName = folderMatch ? folderMatch[1] : "";

    // Find image in the same folder containing "avatar"
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
