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
    let selectedHex: string | null = "#FFFFFF";
    let selectedPreset: string | null = "white";
    let alpha = 0.25;
    let disableShadow = false;

    let hexInput!: HTMLInputElement;
    let rInput!: HTMLInputElement;
    let gInput!: HTMLInputElement;
    let bInput!: HTMLInputElement;

    let alphaInput!: HTMLInputElement;
    let alphaLabel!: HTMLSpanElement;

    return {
      title: "Pick Shadow Color",

      render(container) {
        const presetContainer = document.createElement("div");
        presetContainer.className = "flex flex-col gap-2 mb-4";
        container.appendChild(presetContainer);

        // Preset buttons
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
              updateInputs(hex);
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
          color: selectedHex ?? "#FFFFFF",
          borderWidth: 3,
          borderColor: "var(--color-primary)"
        });

        // @ts-ignore
        picker.on("color:change", (color) => {
          selectedHex = color.hexString;
          selectedPreset = null;
          disableShadow = false;
          updateInputs(color.hexString);
        });

        hexInput = document.createElement("input");
        hexInput.type = "text";
        hexInput.placeholder = "#FFFFFF";
        hexInput.className = "bg-background rounded p-1 w-32 text-center mb-2 mt-13 block mx-auto";
        hexInput.addEventListener("change", () => {
          try {
            const val = hexInput.value.trim();
            picker.color.hexString = val;
            selectedHex = val;
            selectedPreset = null;
            disableShadow = false;
            updateInputs(val);
          } catch {}
        });
        container.appendChild(hexInput);

        const rgbContainer = document.createElement("div");
        rgbContainer.className = "flex gap-2 justify-center mb-4";

        rInput = document.createElement("input");
        rInput.type = "number";
        rInput.min = "0";
        rInput.max = "255";
        rInput.placeholder = "R";
        rInput.className = "bg-background rounded p-1 w-16 text-center";

        gInput = document.createElement("input");
        gInput.type = "number";
        gInput.min = "0";
        gInput.max = "255";
        gInput.placeholder = "G";
        gInput.className = "bg-background rounded p-1 w-16 text-center";

        bInput = document.createElement("input");
        bInput.type = "number";
        bInput.min = "0";
        bInput.max = "255";
        bInput.placeholder = "B";
        bInput.className = "bg-background rounded p-1 w-16 text-center";

        [rInput, gInput, bInput].forEach(input => {
          input.addEventListener("change", () => {
            const r = parseInt(rInput.value) || 0;
            const g = parseInt(gInput.value) || 0;
            const b = parseInt(bInput.value) || 0;
            picker.color.rgb = { r, g, b };
            selectedHex = picker.color.hexString;
            selectedPreset = null;
            disableShadow = false;
            updateInputs(selectedHex ?? "#FFFFFF");
          });
        });

        rgbContainer.appendChild(rInput);
        rgbContainer.appendChild(gInput);
        rgbContainer.appendChild(bInput);
        container.appendChild(rgbContainer);

        function updateInputs(hex: string) {
          hexInput.value = hex;
          const rgb = picker.color.rgb;
          rInput.value = rgb.r.toString();
          gInput.value = rgb.g.toString();
          bInput.value = rgb.b.toString();
        }

        updateInputs(selectedHex ?? "#FFFFFF");

        const alphaContainer = document.createElement("div");
        alphaContainer.className = "mt-4 flex flex-col items-center gap-2";

        const alphaHeader = document.createElement("div");
        alphaHeader.className = "flex items-center gap-2 text-sm text-text-50";
        alphaHeader.textContent = "Shadow Opacity";

        alphaInput = document.createElement("input");
        alphaInput.type = "range";
        alphaInput.min = "0";
        alphaInput.max = "100";
        alphaInput.value = Math.round(alpha * 100).toString();
        alphaInput.className = "w-48 accent-[var(--color-accent)] cursor-pointer";

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
        return true;
      },

      submit() {
        if (disableShadow) return { start: "<!shadow>", end: "" };

        let preset = selectedPreset;
        let hex = selectedHex!;

        if (!preset && !hex) {
          preset = "white";
          hex = "#FFFFFF";
        }

        if (!preset) {
          for (const [name, value] of Object.entries(presetColors)) {
            if (value.toUpperCase() === hex.toUpperCase()) {
              preset = name;
              break;
            }
          }
        }

        if (alpha === 0.25 && preset) return { start: `<shadow:${preset}>`, end: `</shadow>` };
        if (alpha === 0.25 && !preset) return { start: `<shadow:${hex}>`, end: `</shadow>` };

        const alphaFloat = Math.round(alpha * 100) / 100;
        return { start: `<shadow:${preset ?? hex}:${alphaFloat}>`, end: `</shadow>` };
      }
    };
  }
};
