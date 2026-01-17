import type { TagDefinition } from "../tags";
import iro from "@jaames/iro";

let picker: any;

const presetColors: Record<string, string> = {
  black: "#000000",
  dark_blue: "#0000AA",
  dark_green: "#00AA00",
  dark_aqua: "#00AAAA",
  dark_red: "#AA0000",
  dark_purple: "#AA00AA",
  gold: "#FFAA00",
  gray: "#AAAAAA",
  dark_gray: "#555555",
  blue: "#5555FF",
  green: "#55FF55",
  aqua: "#55FFFF",
  red: "#FF5555",
  light_purple: "#FF55FF",
  yellow: "#FFFF55",
  white: "#FFFFFF"
};

const presetRows: string[][] = [
  ["dark_gray", "blue", "green", "aqua", "red", "light_purple", "yellow", "white"],
  ["black", "dark_blue", "dark_green", "dark_aqua", "dark_red", "dark_purple", "gold", "gray"]
];

export const shadowColorTag: TagDefinition = {
  id: "shadow",
  label: "Shadow",

    appearance: (() => {
        const el = document.createElement("span");
        el.className =
            "w-6 h-6 flex items-center justify-center text-text " +
            "drop-shadow-[0_0_4px_var(--color-primary)]";
        el.textContent = "S";
        return el;
    })(),


  modal: () => {
    let selectedHex: string | null = null;
    let selectedPreset: string | null = null;
    let alpha = 0.25; // default MiniMessage shadow alpha
    let disableShadow = false;

    let alphaInput!: HTMLInputElement;
    let alphaLabel!: HTMLSpanElement;

    return {
      title: "Pick Shadow Color",

      render(container) {
        const presetContainer = document.createElement("div");
        presetContainer.className = "flex flex-col gap-2 mb-4";
        container.appendChild(presetContainer);

        presetRows.forEach(row => {
          const rowEl = document.createElement("div");
          rowEl.className = "flex gap-2 justify-center";

          row.forEach(name => {
            const hex = presetColors[name];
            const btn = document.createElement("button");
            btn.style.backgroundColor = hex;
            btn.className =
              "w-6 h-6 rounded-full border border-black/20 transition-transform hover:scale-110";

            btn.onclick = () => {
              selectedPreset = name;
              selectedHex = hex;
              disableShadow = false;
              picker.color.hexString = hex;
            };

            rowEl.appendChild(btn);
          });

          presetContainer.appendChild(rowEl);
        });

        const wheel = document.createElement("div");
        wheel.className = "mx-auto my-4";
        wheel.style.width = "200px";
        wheel.style.height = "200px";
        container.appendChild(wheel);

        // @ts-ignore
        picker = new iro.ColorPicker(wheel, {
          width: 200,
          color: "#FFFFFF"
        });

        // @ts-ignore
        picker.on("color:change", (color) => {
          selectedHex = color.hexString;
          selectedPreset = null;
          disableShadow = false;
        });

        const alphaContainer = document.createElement("div");
        alphaContainer.className =
          "mt-16 flex flex-col items-center gap-2";

        const alphaHeader = document.createElement("div");
        alphaHeader.className = "flex items-center gap-2 text-sm text-text-50";
        alphaHeader.textContent = "Shadow Opacity";

        alphaInput = document.createElement("input");
        alphaInput.type = "range";
        alphaInput.min = "0";
        alphaInput.max = "100";
        alphaInput.value = Math.round(alpha * 100).toString();
        alphaInput.className =
          "w-48 accent-[var(--color-accent)] cursor-pointer";

        alphaLabel = document.createElement("span");
        alphaLabel.className = "text-xs text-text-50";
        alphaLabel.textContent = `${Math.round(alpha * 100)}%`;

        alphaInput.oninput = () => {
          alpha = parseInt(alphaInput.value) / 100;
          alphaLabel.textContent = `${Math.round(alpha * 100)}%`;
        };

        alphaContainer.appendChild(alphaHeader);
        alphaContainer.appendChild(alphaInput);
        alphaContainer.appendChild(alphaLabel);
        container.appendChild(alphaContainer);

        const disableWrapper = document.createElement("div");
        disableWrapper.className = "flex justify-center mt-6";

        const disableBtn = document.createElement("button");
        disableBtn.textContent = "Disable Shadow";
        disableBtn.className =
          "px-4 py-1.5 rounded bg-error/10 hover:bg-error/20 text-error transition";

        disableBtn.onclick = () => {
          disableShadow = true;
          selectedHex = null;
          selectedPreset = null;
        };

        disableWrapper.appendChild(disableBtn);
        container.appendChild(disableWrapper);
      },

      validate() {
        return disableShadow || !!(selectedHex || selectedPreset);
      },

      submit() {
        if (disableShadow) {
            return { start: "<!shadow>", end: "" };
        }

        let preset = selectedPreset;
        let hex = selectedHex!;

        if (!preset) {
          for (const [name, value] of Object.entries(presetColors)) {
            if (value.toUpperCase() === hex.toUpperCase()) {
                preset = name;
                break;
            }
          }
        }

        if (alpha === 0.25 && preset) {
          return { start: `<shadow:${preset}>`, end: `</shadow>` };
        }

        if (alpha === 0.25 && !preset) {
          return { start: `<shadow:${hex}>`, end: `</shadow>` };
        }

        const alphaFloat = Math.round(alpha * 100) / 100;

        return {
            start: `<shadow:${preset ?? hex}:${alphaFloat}>`,
            end: `</shadow>`
        };
      }
    };
  }
};
