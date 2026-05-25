import type { TagDefinition } from "../tags";
import { createSearchableDropdown, createInfoBlock } from "../util/components";

const toolbarIcon = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 5H13M7 3V5M10.5 5C10.5 9 7.5 13 3 14.5M5.5 11C6.5 12.5 8.5 14 11 15M12 19L16 9L20 19M13.5 16H18.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const translatableTag: TagDefinition = {
  id: "translatable",
  label: "Translatable",
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
    let keyDropdown: ReturnType<typeof createSearchableDropdown> | null = null;
    let dropdownContainer: HTMLDivElement | null = null;
    let loadingEl: HTMLDivElement | null = null;

    function getCurrentLang(): string {
      const langSelect = document.getElementById(
        "lang-select",
      ) as HTMLSelectElement | null;
      return langSelect?.value ?? "en_us";
    }

    function createLoadingEl(container: HTMLElement) {
      const el = document.createElement("div");
      el.className = "mt-3 text-sm text-text-50";
      el.textContent = "Loading translation keys…";
      container.appendChild(el);
      return el;
    }

    async function loadKeys(container: HTMLElement): Promise<void> {
      const lang = getCurrentLang();

      if (loadingEl) {
        loadingEl.remove();
        loadingEl = null;
      }
      if (dropdownContainer) {
        dropdownContainer.remove();
        dropdownContainer = null;
        keyDropdown = null;
      }

      loadingEl = createLoadingEl(container);

      try {
        const MinecraftTranslations = await waitForGlobal<{
          get(lang: string): Promise<Record<string, string>>;
        }>("__mcTranslations");
        const raw = await MinecraftTranslations.get(lang);
        const keys = Object.keys(raw);

        if (loadingEl) {
          loadingEl.remove();
          loadingEl = null;
        }

        dropdownContainer = document.createElement("div");
        dropdownContainer.className = "mt-3";
        container.appendChild(dropdownContainer);

        keyDropdown = createSearchableDropdown({
          label: `Translation Key (${keys.length.toLocaleString()})`,
          items: keys,
        });
        keyDropdown.render(dropdownContainer);
      } catch (err) {
        if (loadingEl) {
          loadingEl.textContent =
            "Failed to load translation keys. Check the console for details.";
          console.error("[translatableTag] Failed to load translations:", err);
        }
      }
    }

    function waitForGlobal<T>(key: string, timeout = 5000): Promise<T> {
      return new Promise((resolve, reject) => {
        const w = window as any;
        if (w[key]) return resolve(w[key]);
        const interval = setInterval(() => {
          if (w[key]) {
            clearInterval(interval);
            resolve(w[key]);
          }
        }, 50);
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error(`window.${key} not available after ${timeout}ms`));
        }, timeout);
      });
    }

    return {
      title: "Edit Translatable",

      render(container) {
        createInfoBlock(
          container,
          "Inserts a Minecraft translation key that is resolved client-side using the selected language.",
        );

        // Load keys for the currently selected language
        loadKeys(container);
      },

      validate() {
        return keyDropdown?.isValid() ?? false;
      },

      submit() {
        const key = keyDropdown?.getValue() ?? "";
        return {
          start: `<lang:${key}>`,
          end: `</lang>`,
        };
      },
    };
  },
};
