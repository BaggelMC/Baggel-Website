import type { HighlightSpan } from "./highlight";

const HIGHLIGHT_NAME_PREFIX = "mm";

let styleTagEl: HTMLStyleElement | null = null;
let registeredHighlightNames: string[] = [];

function ensureStyleTag(): HTMLStyleElement {
  if (!styleTagEl) {
    styleTagEl = document.createElement("style");
    styleTagEl.dataset.purpose = "editable-highlight-colors";
    document.head.appendChild(styleTagEl);
  }
  return styleTagEl;
}

function clearRegisteredHighlights() {
  const highlights = (CSS as any).highlights;
  if (!highlights) return;
  for (const name of registeredHighlightNames) {
    highlights.delete(name);
  }
  registeredHighlightNames = [];
}

export function getPlainText(root: HTMLElement): string {
  let text = "";
  for (const node of root.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += (node as Text).data;
    } else if (node.nodeName === "BR") {
      text += "\n";
    } else {
      text += (node.textContent ?? "") + "\n";
    }
  }
  return text;
}
export function getCaretOffset(root: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer)) return 0;

  const pre = range.cloneRange();
  pre.selectNodeContents(root);
  pre.setEnd(range.startContainer, range.startOffset);
  return pre.toString().length;
}

export function setCaretOffset(root: HTMLElement, offset: number): void {
  const { node, nodeOffset } = locate(root, offset);
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.setStart(node, nodeOffset);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

function locate(
  root: HTMLElement,
  linearOffset: number,
): { node: Node; nodeOffset: number } {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remaining = linearOffset;
  let last: Text | null = null;
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    last = node;
    if (remaining <= node.data.length) {
      return { node, nodeOffset: remaining };
    }
    remaining -= node.data.length;
  }
  return last
    ? { node: last, nodeOffset: last.data.length }
    : { node: root, nodeOffset: 0 };
}

function spanToRange(root: HTMLElement, span: HighlightSpan): Range | null {
  if (span.start === span.end) return null;
  const start = locate(root, span.start);
  const end = locate(root, span.end);
  const range = document.createRange();
  try {
    range.setStart(start.node, start.nodeOffset);
    range.setEnd(end.node, end.nodeOffset);
  } catch {
    return null;
  }
  return range;
}

export function applyHighlights(
  root: HTMLElement,
  spans: HighlightSpan[],
  getColor: (span: HighlightSpan) => string | null | undefined,
): void {
  clearRegisteredHighlights();
  const highlights = (CSS as any).highlights;
  if (!highlights) return; // unsupported browser - leave text uncolored

  const rangesByColor = new Map<string, Range[]>();
  for (const span of spans) {
    const color = getColor(span);
    if (!color) continue;
    const range = spanToRange(root, span);
    if (!range) continue;
    if (!rangesByColor.has(color)) rangesByColor.set(color, []);
    rangesByColor.get(color)!.push(range);
  }

  const HighlightCtor = (window as any).Highlight;
  const cssRules: string[] = [];
  let i = 0;
  for (const [color, ranges] of rangesByColor) {
    const name = `${HIGHLIGHT_NAME_PREFIX}-${i++}`;
    highlights.set(name, new HighlightCtor(...ranges));
    registeredHighlightNames.push(name);
    cssRules.push(`::highlight(${name}) { color: ${color}; }`);
  }
  ensureStyleTag().textContent = cssRules.join("\n");
}

function hasOnlyTextChildren(root: HTMLElement): boolean {
  for (const node of root.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) return false;
  }
  return true;
}

function isEffectivelyEmpty(root: HTMLElement): boolean {
  return getPlainText(root).trim() === "";
}

function insertTextAtCaret(root: HTMLElement, text: string): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer)) return;

  range.deleteContents();
  const node = document.createTextNode(text);
  range.insertNode(node);

  range.setStartAfter(node);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

export function initPlainTextContentEditable(
  root: HTMLElement,
  onInput: () => void,
): void {
  const handleChange = () => {
    if (isEffectivelyEmpty(root)) {
      root.replaceChildren();
    } else if (!hasOnlyTextChildren(root)) {
      const offset = getCaretOffset(root);
      root.textContent = getPlainText(root);
      setCaretOffset(root, offset);
    }
    onInput();
  };

  root.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") ?? "";
    insertTextAtCaret(root, text);
    handleChange();
  });

  root.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      insertTextAtCaret(root, "\n");
      handleChange();
    }
  });

  root.addEventListener("input", handleChange);
}