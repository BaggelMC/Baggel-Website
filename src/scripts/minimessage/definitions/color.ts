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

const toolbarIcon = `<svg fill="currentColor" width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">

<g data-name="Layer 2">

<g data-name="color-palette">

<rect width="24" height="24" opacity="0"/>

<path d="M19.54 5.08A10.61 10.61 0 0 0 11.91 2a10 10 0 0 0-.05 20 2.58 2.58 0 0 0 2.53-1.89 2.52 2.52 0 0 0-.57-2.28.5.5 0 0 1 .37-.83h1.65A6.15 6.15 0 0 0 22 11.33a8.48 8.48 0 0 0-2.46-6.25zM15.88 15h-1.65a2.49 2.49 0 0 0-1.87 4.15.49.49 0 0 1 .12.49c-.05.21-.28.34-.59.36a8 8 0 0 1-7.82-9.11A8.1 8.1 0 0 1 11.92 4H12a8.47 8.47 0 0 1 6.1 2.48 6.5 6.5 0 0 1 1.9 4.77A4.17 4.17 0 0 1 15.88 15z"/>

<circle cx="12" cy="6.5" r="1.5"/>

<path d="M15.25 7.2a1.5 1.5 0 1 0 2.05.55 1.5 1.5 0 0 0-2.05-.55z"/>

<path d="M8.75 7.2a1.5 1.5 0 1 0 .55 2.05 1.5 1.5 0 0 0-.55-2.05z"/>

<path d="M6.16 11.26a1.5 1.5 0 1 0 2.08.4 1.49 1.49 0 0 0-2.08-.4z"/>

</g>

</g>

</svg>`;

export const colorTag: TagDefinition = {
  id: "color",
  label: "Color",
  appearance: (() => {
    const wrapper = document.createElement("span");
    wrapper.className = "w-6 h-6 flex items-center justify-center";

    const parser = new DOMParser();
    const doc = parser.parseFromString(toolbarIcon, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    if (!svgEl) throw new Error("SVG parsing failed");

    wrapper.appendChild(svgEl);
    return wrapper;
  })(),

  modal: () => {
    let containerEl!: HTMLDivElement;
    let presetContainer!: HTMLDivElement;

    let selectedColorHex: string | null = "#FFFFFF";
    let selectedPreset: string | null = "white";

    let hexInput!: HTMLInputElement;
    let rInput!: HTMLInputElement;
    let gInput!: HTMLInputElement;
    let bInput!: HTMLInputElement;

    return {
      title: "Pick a Color",

      render(container) {
        containerEl = container as HTMLDivElement;

        presetContainer = document.createElement("div");
        presetContainer.className = "flex flex-col gap-2 mb-4";
        container.appendChild(presetContainer);

        presetRows.forEach(row => {
          const rowEl = document.createElement("div");
          rowEl.className = "flex gap-2 justify-center";

          row.forEach(name => {
            const hex = presetColors[name];
            const btn = document.createElement("button");
            btn.style.backgroundColor = hex;
            btn.title = name;
            btn.className =
              "w-6 h-6 rounded-full border border-black/20 transition-transform hover:scale-110";

            btn.addEventListener("click", () => {
              selectedPreset = name;
              selectedColorHex = null;
              picker.color.hexString = hex;

              rowEl.querySelectorAll("button").forEach(b => b.style.outline = "none");
              btn.style.outline = "2px solid #FFF";

              updateInputs(hex);
            });
            rowEl.appendChild(btn);
          });

          presetContainer.appendChild(rowEl);
        });

        const wheelDiv = document.createElement("div");
        wheelDiv.id = "color-wheel";
        wheelDiv.style.width = "200px";
        wheelDiv.style.height = "200px";
        wheelDiv.style.margin = "0 auto 4rem auto";
        container.appendChild(wheelDiv);

        //@ts-ignore
        picker = new iro.ColorPicker(wheelDiv, {
          width: 200,
          color: selectedColorHex ?? "#FFFFFF",
          borderWidth: 3,
          borderColor: "var(--color-primary)"
        });

        //@ts-ignore
        picker.on("color:change", (color) => {
          selectedColorHex = color.hexString;
          selectedPreset = null;

          presetContainer.querySelectorAll("button").forEach(b => b.style.outline = "none");

          updateInputs(color.hexString);
        });

        hexInput = document.createElement("input");
        hexInput.type = "text";
        hexInput.placeholder = "#FFFFFF";
        hexInput.className = "bg-background rounded p-1 w-32 text-center mb-2 block mx-auto";
        hexInput.addEventListener("change", () => {
          const val = hexInput.value.trim();
          try {
            picker.color.hexString = val;
            selectedColorHex = val;
            selectedPreset = null;
            presetContainer.querySelectorAll("button").forEach(b => b.style.outline = "none");
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
            selectedColorHex = picker.color.hexString;
            selectedPreset = null;
            presetContainer.querySelectorAll("button").forEach(b => b.style.outline = "none");
            updateInputs(picker.color.hexString);
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

        updateInputs(selectedColorHex ?? "#FFFFFF");
      },

      validate() {
        return true;
      },

      submit(): { start: string; end: string } {
        const hex = (selectedColorHex ?? "#FFFFFF").toUpperCase();

        if (selectedPreset) {
          return { start: `<${selectedPreset}>`, end: `</${selectedPreset}>` };
        }

        for (const [name, colorHex] of Object.entries(presetColors)) {
          if (colorHex.toUpperCase() === hex) {
            return { start: `<${name}>`, end: `</${name}>` };
          }
        }

        return { start: `<color:${hex}>`, end: `</color>` };
      }

    };
  }
};
