import { Tag } from "./Tag";

export abstract class ArgumentTag extends Tag {
  private static modal: HTMLDivElement | null = null;
  private static modalContent: HTMLDivElement | null = null;
  private static closeBtn: HTMLButtonElement | null = null;

  abstract renderForm(contentEl: HTMLElement, submit: (args:any)=>void): void;
  abstract buildTags(args: Record<string, string>): { open: string; close: string };

  private createModal() {
    if (ArgumentTag.modal) return;

    // Modal backdrop
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 hidden bg-black/50 flex items-center justify-center z-50";

    // Modal
    const box = document.createElement("div");
    box.className =
      "relative bg-background p-6 rounded-xl space-y-4 w-[300px] text-text shadow-xl";

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "✕";
    closeBtn.className =
      "absolute top-3 right-3 text-text/70 hover:text-text cursor-pointer text-mg";

    box.appendChild(closeBtn);

    modal.appendChild(box);

    ArgumentTag.modal = modal;
    ArgumentTag.modalContent = box;
    ArgumentTag.closeBtn = closeBtn;

    document.body.appendChild(modal);
  }

  async getArgs(): Promise<Record<string, string>> {
    this.createModal();
    const modal = ArgumentTag.modal!;
    const content = ArgumentTag.modalContent!;
    const closeButton = ArgumentTag.closeBtn!;

    content.innerHTML = "";
    content.appendChild(closeButton);

    return new Promise((resolve) => {
      const cancel = () => {
        modal.classList.add("hidden");
        resolve({});
      };

      closeButton.onclick = cancel;

      this.renderForm(content, (args: any) => {
        modal.classList.add("hidden");
        resolve(args);
      });

      modal.classList.remove("hidden");
    });
  }

  async onClick(textarea: HTMLTextAreaElement) {
    const args = await this.getArgs();

    if (!args || Object.keys(args).length === 0) return;

    const { open, close } = this.buildTags(args);
    this.insertAroundSelection(textarea, open, close);
  }
}

export function createSubmitButton(
  label: string,
  onClick: () => void
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.className =
    "px-3 py-2 mt-3 bg-accent text-background font-sans rounded w-full " +
    "cursor-pointer transition hover:bg-accent/80";

  btn.onclick = onClick;
  return btn;
}
