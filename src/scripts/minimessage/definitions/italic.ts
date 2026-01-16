import type { TagDefinition } from "../tags";

export const italicTag: TagDefinition = {
  id: "italic",
  label: "Italic",
  appearance: (() => {
    const el = document.createElement("strong");
    el.textContent = "I";
    el.className = ""
    return el;
  })(),
  staticResult: {
    start: "<i>",
    end: "</i>",
  },
};
