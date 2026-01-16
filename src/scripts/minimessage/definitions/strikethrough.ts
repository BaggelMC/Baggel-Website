import type { TagDefinition } from "../tags";

export const strikethroughTag: TagDefinition = {
  id: "strikethrough",
  label: "Strikethrough",
  appearance: (() => {
    const el = document.createElement("strong");
    el.textContent = "S";
    el.className = ""
    return el;
  })(),
  staticResult: {
    start: "<st>",
    end: "</st>",
  },
};
