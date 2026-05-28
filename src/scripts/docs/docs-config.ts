export const VERSIONS = ["v1.1.0"] as const;
export type Version = (typeof VERSIONS)[number];

export const LATEST_VERSION: Version = "v1.1.0";
export const DEFAULT_LANG = "en";

export const LANGUAGES: Record<string, string> = {
  en: "English",
  de: "Deutsch",
};

/**
 * Given a version string, returns all versions that are <= it
 * Used for the inheritance walk
 */
export function versionsUpTo(version: Version): Version[] {
  const idx = VERSIONS.indexOf(version);
  return VERSIONS.slice(0, idx + 1) as unknown as Version[];
}

/**
 * Check if a version string is a valid known version
 */
export function isValidVersion(v: string): v is Version {
  return VERSIONS.includes(v as Version);
}

/**
 * Check if a lang string is a valid known language
 */
export function isValidLang(l: string): boolean {
  return l in LANGUAGES;
}