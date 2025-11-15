import { ArgumentTag, createSubmitButton } from "./ArgumentTag";

export class InsertTag extends ArgumentTag {
  constructor() {
    super("insert", "Insert");
  }

  renderForm(container: HTMLElement, submit: (args:any)=>void) {
    const label = document.createElement("label");
    label.textContent = "Insert text:";
    label.className = "block text-sm font-medium";

    const input = document.createElement("input");
    input.className = "border rounded w-full p-2 bg-background text-text-50";
    input.placeholder = "Enter text...";

    const btn = createSubmitButton("Insert", () => {
      submit({ text: input.value });
    });

    container.appendChild(label);
    container.appendChild(input);
    container.appendChild(btn);
  }

  buildTags(args: { text: string }) {
    return {
      open: `<insert:"${args.text}">`,
      close: `</insert>`
    };
  }
}
