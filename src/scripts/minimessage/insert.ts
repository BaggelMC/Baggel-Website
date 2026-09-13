import { getCaretOffset, getPlainText, setCaretOffset } from "./editable-highlight";

export interface SelectionOffsets {
  start: number;
  end: number;
}

export function captureSelectionOffsets(root: HTMLElement): SelectionOffsets {
  const sel = window.getSelection();
  const hasSelectionInRoot =
    sel && sel.rangeCount > 0 && root.contains(sel.getRangeAt(0).startContainer);

  if (!hasSelectionInRoot) {
    const length = getPlainText(root).length;
    return { start: length, end: length };
  }

  const range = sel!.getRangeAt(0);
  return {
    start: getCaretOffset(root),
    end: getCaretOffsetForRangeEnd(root, range),
  };
}

export function insertAtOffsets(
  root: HTMLElement,
  offsets: SelectionOffsets,
  start: string,
  end?: string | null,
): void {
  const text = getPlainText(root);
  const before = text.slice(0, offsets.start);
  const selected = text.slice(offsets.start, offsets.end);
  const after = text.slice(offsets.end);

  root.textContent = before + start + selected + (end ?? "") + after;

  const cursor = offsets.start + start.length + selected.length + (end?.length ?? 0);
  root.focus();
  setCaretOffset(root, cursor);

  root.dispatchEvent(new Event("input", { bubbles: true }));
}

export function insertAtSelection(
  root: HTMLElement,
  start: string,
  end?: string | null,
): void {
  insertAtOffsets(root, captureSelectionOffsets(root), start, end);
}

function getCaretOffsetForRangeEnd(root: HTMLElement, range: Range): number {
  const pre = range.cloneRange();
  pre.selectNodeContents(root);
  pre.setEnd(range.endContainer, range.endOffset);
  return pre.toString().length;
}