// Consumes HighlightSpan[] from mini.highlight() (see
// highlight-integration-guide.md) and turns it into colored HTML for the
// backdrop div sitting behind the (now-transparent) input textarea.
//
// Color scheme, per span.kind:
//   - "text"        -> left alone (backdrop's own default text color is used)
//   - "punctuation" -> lightness 30%
//   - "tag-name"    -> lightness 100%
//   - "tag-arg"     -> saturation 50%
// All three tag kinds share one hue per tag, so an opening tag and its
// closing tag (same pairId) render in matching colors. That hue comes from,
// in priority order:
//   1. the tag's resolved static color (e.g. <red>, <color:#FF8652>), read
//      straight off the tag-name span's `color` field and converted to a hue
//   2. a hash of the shared `pairId`, for tags without a resolvable color
//   3. a hash of the tag name text itself, for self-closing/unclosed tags
//      that have no pairId to hash

export interface HighlightSpan {
  start: number;
  end: number;
  kind: "text" | "punctuation" | "tag-name" | "tag-arg";
  depth: number;
  pairId?: number;
  color?: unknown;
}

const GOLDEN_ANGLE = 137.508;
const BASE_SATURATION = 70;
const BASE_LIGHTNESS = 60;

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(hash, 31) + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function hueFromPairId(pairId: number): number {
  return (pairId * GOLDEN_ANGLE) % 360;
}

function hueFromString(str: string): number {
  return stringHash(str) % 360;
}

/**
 * The guide doesn't pin down the concrete shape of `TextColor` from the
 * `adventure` global, so this reads defensively across the shapes a JS port
 * of Kyori's Adventure API is likely to use: a hex string, a packed 24-bit
 * RGB number, or an object exposing either accessor methods/properties
 * (asHexString/value/hex) or discrete red()/green()/blue().
 *
 * If none of these match, this returns null and the caller falls back to
 * the pairId/name hash instead of a real color - worth double-checking
 * against the actual TextColor shape once this is wired up.
 */
function textColorToHex(color: unknown): string | null {
  if (color == null) return null;

  if (typeof color === "string") {
    const hex = color.startsWith("#") ? color.slice(1) : color;
    return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex}` : null;
  }

  if (typeof color === "number" && Number.isFinite(color)) {
    return `#${(color & 0xffffff).toString(16).padStart(6, "0")}`;
  }

  if (typeof color === "object") {
    const c = color as Record<string, unknown>;
    const call = (v: unknown): unknown =>
      typeof v === "function" ? (v as () => unknown).call(color) : v;

    if (typeof c.asHexString === "function") {
      return (c.asHexString as () => string).call(color);
    }
    if (typeof c.toHexString === "function") {
      return (c.toHexString as () => string).call(color);
    }

    const value = call(c.value);
    if (typeof value === "number") {
      return `#${(value & 0xffffff).toString(16).padStart(6, "0")}`;
    }

    if (typeof c.hex === "string") return textColorToHex(c.hex);

    const r = call(c.red);
    const g = call(c.green);
    const b = call(c.blue);
    if (typeof r === "number" && typeof g === "number" && typeof b === "number") {
      const clamp = (n: number) => Math.max(0, Math.min(255, n | 0));
      return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("")}`;
    }
  }

  return null;
}

function hexToHue(hex: string): number | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return null;

  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 0xff) / 255;
  const g = ((int >> 8) & 0xff) / 255;
  const b = (int & 0xff) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return null; // achromatic (black/white/gray) - no usable hue

  const d = max - min;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

// HSL lightness is not "brightness" - it's a mix toward white (100%) or
// black (0%) at the extremes, so hue only stays visually distinguishable
// somewhere in the middle of the range. Literal 100%/0% would render every
// hue as the same pure white/black, defeating the point of coloring tags
// by hue at all. TAG_NAME_LIGHTNESS/PUNCTUATION_LIGHTNESS below approximate
// "brightest" and "dimmest" while keeping the hue actually visible.
const TAG_NAME_LIGHTNESS = 68;
const PUNCTUATION_LIGHTNESS = 32;

function styleForKind(kind: HighlightSpan["kind"], hue: number): string {
  switch (kind) {
    case "punctuation":
      return `hsl(${hue}, ${BASE_SATURATION}%, ${PUNCTUATION_LIGHTNESS}%)`;
    case "tag-name":
      return `hsl(${hue}, ${BASE_SATURATION}%, ${TAG_NAME_LIGHTNESS}%)`;
    case "tag-arg":
      return `hsl(${hue}, 50%, ${BASE_LIGHTNESS}%)`;
    default:
      return `hsl(${hue}, ${BASE_SATURATION}%, ${BASE_LIGHTNESS}%)`;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Renders HighlightSpan[] (from mini.highlight()) into colored HTML, meant
 * to be dropped into the backdrop div behind the (transparent-text) input.
 *
 * Relies on the guarantees from highlight-integration-guide.md: spans are
 * sorted by start and non-overlapping, so a single left-to-right walk
 * covers the whole input exactly once.
 */
export function renderHighlight(input: string, spans: HighlightSpan[]): string {
  // Pass 1: one hue per pairId, preferring the opening tag-name's resolved
  // color when it has one. Spans are sorted, and an opening tag's spans
  // always precede its closing tag's spans, so the first tag-name span seen
  // for a given pairId is the opening one.
  const pairHue = new Map<number, number>();
  for (const span of spans) {
    if (span.kind !== "tag-name" || span.pairId === undefined) continue;
    if (pairHue.has(span.pairId)) continue;
    const hex = textColorToHex(span.color);
    const hue = (hex && hexToHue(hex)) ?? hueFromPairId(span.pairId);
    pairHue.set(span.pairId, hue);
  }

  let html = "";
  let cursor = 0;

  for (const span of spans) {
    if (span.start > cursor) {
      html += escapeHtml(input.slice(cursor, span.start));
    }

    const raw = input.slice(span.start, span.end);

    if (span.kind === "text") {
      html += escapeHtml(raw);
    } else {
      let hue: number;
      if (span.pairId !== undefined) {
        hue = pairHue.get(span.pairId)!;
      } else {
        const hex = span.kind === "tag-name" ? textColorToHex(span.color) : null;
        hue = (hex && hexToHue(hex)) ?? hueFromString(raw);
      }
      html += `<span style="color:${styleForKind(span.kind, hue)}">${escapeHtml(raw)}</span>`;
    }

    cursor = Math.max(cursor, span.end);
  }

  if (cursor < input.length) {
    html += escapeHtml(input.slice(cursor));
  }

  // A trailing newline collapses to nothing in a <div>, but the textarea it
  // has to line up with still reserves a line for it - pad so wrapping and
  // height stay in sync.
  if (input.endsWith("\n")) {
    html += "&#8203;";
  }

  return html;
}