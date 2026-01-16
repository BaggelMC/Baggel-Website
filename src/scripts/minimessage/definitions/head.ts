import type { TagDefinition } from "../tags";

export const uuidRegex: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const playerNameRegex: RegExp = /^[A-Za-z0-9_]{3,16}$/;

export const headTag: TagDefinition = {
  id: "head",
  label: "Player Head",
  appearance: (() => {
    const el = document.createElement("span");
    el.textContent = "👤";
    el.className = ""
    return el;
  })(),

  modal: () => {
    let input!: HTMLInputElement;
    let errorEl!: HTMLDivElement;

    return {
      title: "Insert Player Head",

      render(container) {
        input = document.createElement("input");
        input.placeholder = "Player name";
        input.className = "bg-background w-full p-2 rounded-lg";
        container.appendChild(input);

        errorEl = document.createElement("div");
        errorEl.className = "text-error mt-2 text-sm";
        container.appendChild(errorEl);
      },

      validate() {
        const value = input.value.trim();

        if (uuidRegex.test(value) || playerNameRegex.test(value) && value.length || ((value.includes("/") && value.includes(":")) && value.length > 3 )) {
          errorEl.textContent = "";
          return true;
        } else {
          errorEl.textContent = "Invalid input. Must be a UUID, player name or texture reference."
          return false;
        }
      },

      submit() {
        return {
          start: `<head:${input.value.trim()}>`,
          end: null,
        };
      },
    };
  },
};
