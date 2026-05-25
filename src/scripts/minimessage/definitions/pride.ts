import type { TagDefinition } from "../tags";
import { createSearchableDropdown, createNumberInput } from "../util/components";

const FLAGS = [
  "pride", "progress", "trans", "bi", "pan", "nb", "lesbian", "ace",
  "agender", "demisexual", "genderqueer", "genderfluid", "intersex",
  "aro", "baker", "philly", "queer", "gay", "bigender", "demigender",
  "femboy", "intersex inclusive",
];

export const prideTag: TagDefinition = {
  id: "pride",
  label: "Pride",
  appearance: (() => {
    const el = document.createElement("span");
    el.className = "inline-block w-6 h-6 rounded-lg border";
    el.style.background =
      "linear-gradient(to right, #f87171, #fb923c, #facc15, #4ade80, #60a5fa, #a78bfa)";
    el.style.display = "block";
    return el;
  })(),
  modal: () => {
    const flag = createSearchableDropdown({
      label: "Flag (optional)",
      items: FLAGS,
      placeholder: "Search flags...",
    });
    const phase = createNumberInput({
      label: "Phase (-1 to 1, optional)",
      min: -1,
      max: 1,
      initial: 0,
    });

    return {
      title: "Edit Pride",

      render(container) {
        flag.render(container);

        const spacer = document.createElement("div");
        spacer.className = "mt-3";
        container.appendChild(spacer);

        phase.render(spacer);
      },

      validate() {
        const p = phase.getValue();
        return p >= -1 && p <= 1;
      },

      submit() {
        const f = flag.getValue();
        const p = phase.getValue();

        let start: string;
        if (f) {
          start = `<pride:${f}>`;
        } else if (p !== 0) {
          start = `<pride:${p}>`;
        } else {
          start = `<pride>`;
        }

        return { start, end: "</pride>" };
      },
    };
  },
};