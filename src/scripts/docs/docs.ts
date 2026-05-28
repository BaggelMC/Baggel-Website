import { getCollection, type CollectionEntry } from "astro:content";
import {
  VERSIONS,
  DEFAULT_LANG,
  versionsUpTo,
  type Version,
} from "./docs-config";

export type DocsEntry = CollectionEntry<"docs">;

export interface ResolvedEntry {
  entry: DocsEntry;
  inherited: boolean;
  langFallback: boolean;
}

export interface NavItem {
  label: string;
  slug: string;
  href: string;
  navOrder: number;
  deprecated: boolean;
}

export interface NavNode {
  label: string;
  item: NavItem | null;
  navOrder: number;
  children: NavNode[];
}

export function parseEntryId(id: string): {
  lang: string;
  version: string;
  slug: string;
} {
  const parts = id.replace(/\.mdx?$/, "").split("/");
  const [lang, version, ...rest] = parts;
  return { lang, version, slug: rest.join("/") };
}

function folderToLabel(segment: string): string {
  return segment.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function insertIntoTree(roots: NavNode[], item: NavItem): void {
  const parts = item.slug.split("/");

  if (parts.length === 1) {
    roots.push({
      label: item.label,
      item,
      navOrder: item.navOrder,
      children: [],
    });
    return;
  }

  let currentLevel = roots;
  for (let i = 0; i < parts.length - 1; i++) {
    const segment = parts[i];
    let node = currentLevel.find((n) => n.label === folderToLabel(segment));
    if (!node) {
      node = {
        label: folderToLabel(segment),
        item: null,
        navOrder: 99,
        children: [],
      };
      currentLevel.push(node);
    }
    currentLevel = node.children;
  }

  const lastPart = parts[parts.length - 1];

  if (lastPart === "index") {
    const parentNode = findNode(roots, parts.slice(0, -1));
    if (parentNode) {
      parentNode.item = item;
      parentNode.navOrder = item.navOrder;
      parentNode.label = item.label;
    }
  } else {
    currentLevel.push({
      label: item.label,
      item,
      navOrder: item.navOrder,
      children: [],
    });
  }
}

function findNode(nodes: NavNode[], pathParts: string[]): NavNode | null {
  if (pathParts.length === 0) return null;
  const [head, ...rest] = pathParts;
  const node = nodes.find((n) => n.label === folderToLabel(head));
  if (!node) return null;
  if (rest.length === 0) return node;
  return findNode(node.children, rest);
}

function sortNodes(nodes: NavNode[]): NavNode[] {
  return nodes
    .sort((a, b) => a.navOrder - b.navOrder)
    .map((n) => ({ ...n, children: sortNodes(n.children) }));
}

export async function resolveEntry(
  lang: string,
  version: Version,
  slug: string,
): Promise<ResolvedEntry | null> {
  const all = await getCollection("docs");
  const versionHistory = versionsUpTo(version);

  for (let i = versionHistory.length - 1; i >= 0; i--) {
    const v = versionHistory[i];
    const candidate = all.find((e) => {
      const p = parseEntryId(e.id);
      return p.lang === lang && p.version === v && p.slug === slug;
    });
    if (candidate) {
      if (candidate.data.removed) return null;
      return {
        entry: candidate,
        inherited: v !== version,
        langFallback: false,
      };
    }
  }

  if (lang !== DEFAULT_LANG) {
    for (let i = versionHistory.length - 1; i >= 0; i--) {
      const v = versionHistory[i];
      const candidate = all.find((e) => {
        const p = parseEntryId(e.id);
        return p.lang === DEFAULT_LANG && p.version === v && p.slug === slug;
      });
      if (candidate) {
        if (candidate.data.removed) return null;
        return {
          entry: candidate,
          inherited: v !== version,
          langFallback: true,
        };
      }
    }
  }

  return null;
}

export async function buildNav(
  lang: string,
  version: Version,
): Promise<NavNode[]> {
  const all = await getCollection("docs");
  const versionHistory = versionsUpTo(version);

  const resolved = new Map<string, DocsEntry>();

  for (const v of versionHistory) {
    const entries = all.filter((e) => {
      const p = parseEntryId(e.id);
      return (p.lang === lang || p.lang === DEFAULT_LANG) && p.version === v;
    });

    for (const entry of entries) {
      const { slug, lang: eLang } = parseEntryId(entry.id);
      const existing = resolved.get(slug);
      if (!existing) {
        resolved.set(slug, entry);
      } else {
        const existingLang = parseEntryId(existing.id).lang;
        if (eLang === lang || existingLang !== lang) {
          resolved.set(slug, entry);
        }
      }
    }
  }

  const roots: NavNode[] = [];

  for (const [slug, entry] of resolved) {
    if (entry.data.removed) continue;
    const cleanSlug = slug.replace(/\/index$/, "");
    const item: NavItem = {
      label: entry.data.navLabel ?? entry.data.title,
      slug: cleanSlug,
      href: `/docs/${lang}/${version}/${cleanSlug}`,
      navOrder: entry.data.navOrder,
      deprecated: entry.data.deprecated,
    };
    insertIntoTree(roots, item);
  }

  return sortNodes(roots);
}

export async function slugExistsInVersion(
  lang: string,
  version: Version,
  slug: string,
): Promise<boolean> {
  const result = await resolveEntry(lang, version, slug);
  if (result !== null) return true;
  const indexResult = await resolveEntry(lang, version, `${slug}/index`);
  return indexResult !== null;
}

export async function getAllDocsPaths() {
  const all = await getCollection("docs");
  const paths: {
    params: { lang: string; version: string; slug: string };
    props: { resolvedSlug: string };
  }[] = [];

  for (const version of VERSIONS) {
    const slugsInVersion = new Set<string>();
    const langSet = new Set<string>();

    for (const entry of all) {
      const p = parseEntryId(entry.id);
      langSet.add(p.lang);
      slugsInVersion.add(p.slug);
    }

    for (const lang of langSet) {
      for (const slug of slugsInVersion) {
        const resolved = await resolveEntry(lang, version as Version, slug);
        if (resolved) {
          const cleanSlug = slug.replace(/\/index$/, "");
          paths.push({
            params: { lang, version, slug: cleanSlug },
            props: { resolvedSlug: slug },
          });
        }
      }
    }
  }

  return paths;
}
