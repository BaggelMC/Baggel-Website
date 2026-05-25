import type { TagDefinition } from "../tags";

export const resetTag: TagDefinition = {
  id: "reset",
  label: "Reset",
  appearance: (() => {
    const el = document.createElement("strong");
    el.textContent = "R";
    el.className = "";
    return el;
  })(),
  staticResult: {
    start: "<reset>"
  },
};
