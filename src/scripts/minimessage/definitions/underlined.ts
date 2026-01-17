import type { TagDefinition } from "../tags";

export const underlinedTag: TagDefinition = {
  id: "underlined",
  label: "Underlined",
  appearance: (() => {
    const el = document.createElement("strong");
    el.textContent = "U";
    el.className = "underline";
    return el;
  })(),
  staticResult: {
    start: "<u>",
    end: "</u>",
  },
};
