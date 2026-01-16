import type { TagDefinition } from "../tags";

export const boldTag: TagDefinition = {
  id: "bold",
  label: "Bold",
  appearance: (() => {
    const el = document.createElement("strong");
    el.textContent = "B";
    el.className = ""
    return el;
  })(),
  staticResult: {
    start: "<b>",
    end: "</b",
  },
};
