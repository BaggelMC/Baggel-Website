import { openColorPicker } from "../util/openColorPicker";
import { presetColors } from "../util/createColorPickerModal";
import type { TagDefinition } from "../tags";

export const gradientTag: TagDefinition = {
  id: "gradient",
  label: "Gradient",
  appearance: (() => {
    const el = document.createElement("span");
    el.className = "inline-block w-6 h-6 rounded-lg border";
    el.style.background = "linear-gradient(to right, var(--color-background), var(--color-text))";
    el.style.display = "block";
    return el;
  })(),

  modal: () => {
    let colors: string[] = ["#000000", "#FFFFFF"];
    let listEl!: HTMLDivElement;
    let previewEl!: HTMLDivElement;

    const upIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" class="w-4 h-4"><path d="M8 4l-4 4h8L8 4z"/></svg>`;
    const downIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" class="w-4 h-4"><path d="M8 12l4-4H4l4 4z"/></svg>`;
    const removeIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" class="w-4 h-4"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>`;

    function renderList() {
      listEl.innerHTML = "";

      colors.forEach((hex, index) => {
        const row = document.createElement("div");
        row.className = "flex items-center gap-2 bg-background p-2 rounded-xl";

        const previewBtn = document.createElement("button");
        previewBtn.className = "w-6 h-6 rounded border";
        previewBtn.style.backgroundColor = hex;
        previewBtn.onclick = async () => {
          colors[index] = await openColorPicker(colors[index]);
          renderList();
        };

        const label = document.createElement("span");
        label.textContent = hexToPresetName(hex) ?? hex.toUpperCase();
        label.className = "font-mono text-sm";

        const upBtn = document.createElement("button");
        upBtn.innerHTML = upIcon;
        if (index === 0) {
          upBtn.style.color = "var(--color-text-100)";
          upBtn.style.cursor = "not-allowed";
        } else {
          upBtn.style.color = "var(--color-text)";
          upBtn.style.cursor = "pointer";
          upBtn.onclick = () => {
            [colors[index - 1], colors[index]] = [colors[index], colors[index - 1]];
            renderList();
          };
        }

        const downBtn = document.createElement("button");
        downBtn.innerHTML = downIcon;
        if (index === colors.length - 1) {
          downBtn.style.color = "var(--color-text-100)";
          downBtn.style.cursor = "not-allowed";
        } else {
          downBtn.style.color = "var(--color-text)";
          downBtn.style.cursor = "pointer";
          downBtn.onclick = () => {
            [colors[index + 1], colors[index]] = [colors[index], colors[index + 1]];
            renderList();
          };
        }

        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = removeIcon;
        removeBtn.style.color = "var(--color-error)";
        removeBtn.style.cursor = colors.length <= 2 ? "not-allowed" : "pointer";
        if (colors.length > 2) {
          removeBtn.onclick = () => {
            colors.splice(index, 1);
            renderList();
          };
        }

        row.append(previewBtn, label, upBtn, downBtn, removeBtn);
        listEl.appendChild(row);
      });

      previewEl.style.background = `linear-gradient(to right, ${colors.join(",")})`;
    }

    function hexToPresetName(hex: string): string | null {
      const upperHex = hex.toUpperCase();
      for (const [name, value] of Object.entries(presetColors)) {
        if (value.toUpperCase() === upperHex) return name;
      }
      return null;
    }

    return {
      title: "Edit Gradient",

      render(container) {
        previewEl = document.createElement("div");
        previewEl.className = "w-full h-8 rounded-xl mb-4 border";
        previewEl.style.background = `linear-gradient(to right, ${colors.join(",")})`;
        container.appendChild(previewEl);

        listEl = document.createElement("div");
        listEl.className = "flex flex-col gap-2 mb-4";
        container.appendChild(listEl);

        const addBtn = document.createElement("button");
        addBtn.textContent = "+ Add color";
        addBtn.className = "mt-2 underline cursor-pointer";
        addBtn.onclick = async () => {
          colors.push(await openColorPicker("#FFFFFF"));
          renderList();
        };
        container.appendChild(addBtn);

        renderList();
      },

      validate() {
        return colors.length >= 2;
      },

      submit() {
        const args = colors
          .map(hex => hexToPresetName(hex) ?? hex.toUpperCase())
          .join(":");
        return {
          start: `<gradient:${args}>`,
          end: `</gradient>`
        };
      }
    };
  }
};
