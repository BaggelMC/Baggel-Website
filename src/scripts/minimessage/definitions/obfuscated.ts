import type { TagDefinition } from "../tags";

export const obfuscatedTag: TagDefinition = {
  id: "obfuscated",
  label: "Obfuscated",
  appearance: (() => {
    const el = document.createElement("strong");
    el.textContent = "Obf";
    el.className = "";
    return el;
  })(),
  staticResult: {
    start: "<obf>",
    end: "</obf>",
  },
};
