import type { TagDefinition } from "../tags";
import { createTextInput } from "../util/components";

export const hoverTag: TagDefinition = {
  id: "hover",
  label: "Hover",
  appearance: (() => {
    const el = document.createElement("hover");
    el.textContent = "H";
    el.className = "";
    return el;
  })(),

  modal: () => {
    const text = createTextInput({ placeholder: "Hover text" });

    return {
      title: "Insert Hover Text",
      render(container) { text.render(container); },
      validate() { return text.isValid(); },
      submit() {
        return {
          start: `<hover:show_text:'${text.getValue()}'>`,
          end: `</hover>`,
        };
      },
    };
  },
};
