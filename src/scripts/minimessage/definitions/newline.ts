import type { TagDefinition } from "../tags";

export const newlineTag: TagDefinition = {
  id: "newline",
  label: "New line",
  appearance: (() => {
    const el = document.createElement("strong");
    el.textContent = "\\n";
    el.className = "";
    return el;
  })(),
  staticResult: {
    start: "<br>"
  },
};
