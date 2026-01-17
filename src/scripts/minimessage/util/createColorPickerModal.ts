import iro from "@jaames/iro";

export const presetColors: Record<string, string> = {
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

export function createColorPickerModal(
  initialColor: string,
  onPick: (hex: string) => void
) {
  let picker: any;
  let selectedColorHex: string = initialColor;
  let selectedPreset: string | null = null;

  let hexInput!: HTMLInputElement;
  let rInput!: HTMLInputElement;
  let gInput!: HTMLInputElement;
  let bInput!: HTMLInputElement;
  let presetContainer!: HTMLDivElement;

  return {
    title: "Pick a Color",

    render(container: HTMLElement) {
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
            selectedColorHex = hex;
            picker.color.hexString = hex;

            rowEl.querySelectorAll("button").forEach(b => (b.style.outline = "none"));
            btn.style.outline = "2px solid #FFF";

            updateInputs(hex);
          });

          rowEl.appendChild(btn);
        });

        presetContainer.appendChild(rowEl);
      });

      const wheelDiv = document.createElement("div");
      wheelDiv.style.width = "200px";
      wheelDiv.style.height = "200px";
      wheelDiv.style.margin = "0 auto 4rem auto";
      container.appendChild(wheelDiv);

      // @ts-ignore
      picker = new iro.ColorPicker(wheelDiv, {
        width: 200,
        color: initialColor,
        borderWidth: 1,
        borderColor: "#000"
      });

      picker.on("color:change", (color: any) => {
        selectedColorHex = color.hexString;
        selectedPreset = null;

        presetContainer.querySelectorAll("button").forEach(b => (b.style.outline = "none"));

        updateInputs(color.hexString);
      });

      hexInput = document.createElement("input");
      hexInput.type = "text";
      hexInput.className = "bg-background rounded p-1 w-32 text-center mb-2 block mx-auto";
      hexInput.value = initialColor;
      hexInput.onchange = () => {
        try {
          picker.color.hexString = hexInput.value;
          selectedColorHex = hexInput.value;
          selectedPreset = null;
          presetContainer.querySelectorAll("button").forEach(b => (b.style.outline = "none"));
        } catch {}
      };
      container.appendChild(hexInput);

      const rgbContainer = document.createElement("div");
      rgbContainer.className = "flex gap-2 justify-center mb-4";

      rInput = document.createElement("input");
      gInput = document.createElement("input");
      bInput = document.createElement("input");

      [rInput, gInput, bInput].forEach(input => {
        input.type = "number";
        input.min = "0";
        input.max = "255";
        input.className = "bg-background rounded p-1 w-16 text-center";
        input.onchange = () => {
          picker.color.rgb = {
            r: parseInt(rInput.value) || 0,
            g: parseInt(gInput.value) || 0,
            b: parseInt(bInput.value) || 0
          };
          selectedColorHex = picker.color.hexString;
          selectedPreset = null;
          presetContainer.querySelectorAll("button").forEach(b => (b.style.outline = "none"));
        };
      });

      rgbContainer.append(rInput, gInput, bInput);
      container.appendChild(rgbContainer);

      updateInputs(initialColor);
    },

    onSubmit() {
      if (selectedPreset) {
        onPick(presetColors[selectedPreset]);
      } else {
        onPick(selectedColorHex);
      }
      return true;
    }
  };

  function updateInputs(hex: string) {
    hexInput.value = hex;
    const rgb = picker.color.rgb;
    rInput.value = rgb.r.toString();
    gInput.value = rgb.g.toString();
    bInput.value = rgb.b.toString();
  }
}
