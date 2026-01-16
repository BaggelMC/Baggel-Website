export function insertAtSelection(
  textarea: HTMLTextAreaElement,
  start: string,
  end?: string | null
) {
  const { selectionStart, selectionEnd, value } = textarea;

  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const after = value.slice(selectionEnd);

  textarea.value =
    before +
    start +
    selected +
    (end ?? "") +
    after;

  const cursor =
    selectionStart + start.length + selected.length + (end?.length ?? 0);

  textarea.setSelectionRange(cursor, cursor);
  textarea.focus();

  const event = new Event("input", { bubbles: true });
  textarea.dispatchEvent(event);
}
