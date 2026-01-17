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

const toolbarIcon = `<svg  viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1{fill:none;stroke:currentColor;stroke-miterlimit:10;stroke-width:1.92px;}</style></defs><g id="roll_brush" data-name="roll brush"><circle class="cls-1" cx="5.73" cy="13.45" r="0.48"/><circle class="cls-1" cx="7.65" cy="18.24" r="0.48"/><circle class="cls-1" cx="6.69" cy="8.65" r="0.48"/><circle class="cls-1" cx="10.52" cy="5.78" r="0.48"/><circle class="cls-1" cx="15.32" cy="6.74" r="0.48"/><circle class="cls-1" cx="18.2" cy="10.57" r="0.48"/><path class="cls-1" d="M22.51,11.86a4.87,4.87,0,0,1-4.86,4.95H16.18a4.28,4.28,0,0,0-3.57,1.91l-1.15,1.72a4.74,4.74,0,0,1-4,2.12h0a4.61,4.61,0,0,1-3.87-2A13.07,13.07,0,0,1,1.41,13.3V12a10.55,10.55,0,0,1,21.1-.15Z"/></g></svg>`;

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
    // TODO: Replace with generic color picker modal
    let containerEl!: HTMLDivElement;
    let presetContainer!: HTMLDivElement;
    let selectedColorHex: string | null = null;
    let selectedPreset: string | null = null;

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
          rowEl.className = "flex gap-2";

          row.forEach(name => {
            const hex = presetColors[name];
            const btn = document.createElement("button");
            btn.style.backgroundColor = hex;
            btn.title = name;
            btn.className = "w-6 h-6 rounded-full border border-black/20 transition-transform hover:scale-110";
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

        //@ts-ignore: Yeah, types don't exist for this I think
        let picker: any = new iro.ColorPicker(wheelDiv, {
          width: 200,
          color: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#000"
        });

        //@ts-ignore: Same as picker variable
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

        [rInput, gInput, bInput].forEach((input, idx) => {
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

        updateInputs("#FFFFFF");
      },

      validate() {
        return !!(selectedColorHex || selectedPreset);
      },

      submit(): { start: string; end: string } {
        let presetMatch: string | null = null;

        if (selectedColorHex) {
            const hex = selectedColorHex.toUpperCase();
            for (const [name, colorHex] of Object.entries(presetColors)) {
                if (colorHex.toUpperCase() === hex) {
                    presetMatch = name;
                    break;
                }
            }
        }

        const tagName = selectedPreset || presetMatch;
        if (tagName) {
            return { start: `<${tagName}>`, end: `</${tagName}>` };
        }

        return { start: `<color:${selectedColorHex!}>`, end: `</color>` };
    }


    };
  }
};