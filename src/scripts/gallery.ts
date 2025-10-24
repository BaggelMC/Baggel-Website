export interface GallerySection {
  name: string;
  images: Record<string, ImageMetadata>;
}

const isDev = import.meta.env.DEV;

export async function loadGallery(): Promise<GallerySection[]> {
  let imageModules;

  if (!isDev) {
    imageModules = import.meta.glob<{ default: ImageMetadata }>("../assets/gallery/**/*.{png,jpg,jpeg,webp,gif,avif}", {
      query: { format: 'webp', w: '1200',},
      eager: true
    });
  } else {
    imageModules = import.meta.glob<{ default: ImageMetadata }>( "/src/assets/gallery/**/*.{png,jpg,jpeg,webp,gif,avif}", { eager: true } );
  }
  

  const sections: Record<string, GallerySection> = {};

  for (const [path, mod] of Object.entries(imageModules)) {
    const parts = path.split("/");
    const sectionName = parts[parts.length - 2];
    if (!sections[sectionName]) {
      sections[sectionName] = { name: sectionName, images: {} };
    }
    sections[sectionName].images[path] = mod.default;
  }

  return Object.values(sections);
}
