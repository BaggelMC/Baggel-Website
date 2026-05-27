# Docs authoring guide

This document explains how the documentation system works and how to write and organize doc pages.

## File structure

All docs live under `src/content/docs/`, organized by language and version:

```
src/content/docs/
├── en/
│   ├── v1/
│   │   └── getting-started.md
│   └── v2/
│       └── getting-started.md
└── de/
    └── v2/
        └── getting-started.md
```

The URL for a page is always `/docs/[lang]/[version]/[slug]`, where the slug is the file path relative to the version folder — so `en/v2/getting-started.md` becomes `/docs/en/v2/getting-started`.

## Adding a new version

Add the version string to the `VERSIONS` array in `src/config/docs.ts`, then create the corresponding folder. You only need to add files for pages that have actually changed — everything else is inherited automatically from the previous version.

## Sidebar hierarchy

The sidebar tree is derived entirely from folder structure. A flat file produces a root-level item. A file inside a subfolder is nested under a section named after that folder:

```
v2/
├── getting-started.md          → root item
├── reference/
│   ├── index.md                → "Reference" as a clickable page + section header
│   ├── commands.md             → nested under Reference
│   └── permissions.md         → nested under Reference
```

A folder without an `index.md` still creates a section header, it just won't be a link. With an `index.md`, the section header links to that page and uses its title as the label.

## Removing a page in a newer version

Don't delete the file. Instead, create a tombstone — a file at the same path in the new version containing only `removed: true`:

```yaml
---
title: Legacy Commands
removed: true
navOrder: 10
---
```

This tells the system the removal is intentional. Without a tombstone, a missing file would just inherit from the previous version.

## Translations

Add a file at the same path under the appropriate language folder. If a translation doesn't exist for a given page, the English version is shown with a banner informing the reader.

German readers on `/docs/de/v2/getting-started` will see `de/v2/getting-started.md` if it exists, otherwise `en/v2/getting-started.md` with a "not yet translated" notice.

## Frontmatter reference

Every markdown file should have a frontmatter block at the top. Only `title` is required.

```yaml
---
title: Getting Started
description: How to connect and get set up.
navLabel: Getting Started
navOrder: 1
deprecated: false
deprecationMessage: This feature was replaced in v3.
removed: false
---
```

| Field | Required | Description |
|---|---|---|
| `title` | Yes | The page title, shown as the `<h1>` and in the browser tab. |
| `description` | No | Short summary used for SEO meta tags. |
| `navLabel` | No | Label shown in the sidebar. Falls back to `title` if omitted. Useful when the full title is too long for the nav. |
| `navOrder` | No | Number controlling the sort order within a section. Lower numbers appear first. Defaults to `99`. |
| `deprecated` | No | Shows a deprecation warning banner on the page. Defaults to `false`. |
| `deprecationMessage` | No | Custom text for the deprecation banner. Falls back to a generic message if omitted. |
| `removed` | No | Tombstone flag — marks this page as removed in this version. The file must exist but the page will not appear in the nav or be accessible. Defaults to `false`. |