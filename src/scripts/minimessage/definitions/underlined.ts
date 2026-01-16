import type { TagDefinition } from "../tags";

export const underlinedTag: TagDefinition = {
  id: "underlined",
  label: "Underlined",
  appearance: (() => {
    const el = document.createElement("strong");
    el.textContent = "U";
    el.className = "bg-background p-2 rounded-xl underline"
    return el;
  })(),
  staticResult: {
    start: "<u>",
    end: "</u>",
  },
};
