export abstract class Tag {
  id: string;
  label: string;
  icon?: string;

  constructor(id: string, label: string, icon?: string) {
    this.id = id;
    this.label = label;
    this.icon = icon;
  }

  abstract onClick(textarea: HTMLTextAreaElement): void;

  protected insertAroundSelection(
    textarea: HTMLTextAreaElement,
    openTag: string,
    closeTag: string
  ) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    const before = value.substring(0, start);
    const selection = value.substring(start, end);
    const after = value.substring(end);

    const newValue =
      before + openTag + selection + closeTag + after;

    textarea.value = newValue;

    const cursor = selection
      ? start + openTag.length + selection.length + closeTag.length
      : start + openTag.length;

    textarea.setSelectionRange(cursor, cursor);
    textarea.dispatchEvent(new Event("input"));
  }
}
