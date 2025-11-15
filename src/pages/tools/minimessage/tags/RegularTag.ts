import { Tag } from "./Tag";

export class RegularTag extends Tag {
  open: string;
  close: string;

  constructor(id: string, label: string, open: string, close: string, icon?: string) {
    super(id, label, icon);
    this.open = open;
    this.close = close;
  }

  onClick(textarea: HTMLTextAreaElement): void {
    this.insertAroundSelection(textarea, this.open, this.close);
  }
}
