import type { TagDefinition } from "../tags";
import { createNumberInput, createToggle } from "../util/components";

export const rainbowTag: TagDefinition = {
  id: "rainbow",
  label: "Rainbow",
  appearance: (() => {
    const el = document.createElement("span");
    el.className = "inline-block w-6 h-6 rounded-lg border";
    el.style.background =
      "linear-gradient(to right, #f87171, #fb923c, #facc15, #4ade80, #60a5fa, #a78bfa)";
    el.style.display = "block";
    return el;
  })(),
  modal: () => {
    const phase = createNumberInput({ label: "Phase (0–10)", min: 0, max: 10 });
    const invert = createToggle({ label: "Invert" });

    return {
      title: "Edit Rainbow",

      render(container) {
        phase.render(container);

        const spacer = document.createElement("div");
        spacer.className = "mt-3";
        container.appendChild(spacer);

        invert.render(spacer);
      },

      validate() {
        return phase.isValid();
      },

      submit() {
        const p = phase.getValue();
        const inv = invert.getValue();
        const phaseIsDefault = p === 0 || p === 10;

        let start: string;
        if (!inv && phaseIsDefault) start = "<rainbow>";
        else if (inv && phaseIsDefault) start = "<rainbow:!>";
        else if (!inv) start = `<rainbow:${p}>`;
        else start = `<rainbow:!${p}>`;

        return { start, end: "</rainbow>" };
      },
    };
  },
};