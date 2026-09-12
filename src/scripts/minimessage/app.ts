import MinecraftTranslations from "@scripts/minimessage/translations";

// Files never leave the device; persisting them to IndexedDB just avoids
// re-uploading them every refresh. localStorage can't hold binary Blob/File
// data (and has a ~5MB cap), so IndexedDB is used instead.
const PACK_DB_NAME = "minimessage-tool";
const PACK_DB_VERSION = 1;
const PACK_STORE_NAME = "resourcePacks";
const PACK_STORE_KEY = "packFiles";

function openPackDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const req = indexedDB.open(PACK_DB_NAME, PACK_DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(PACK_STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadPersistedPackFiles(): Promise<File[]> {
  try {
    const db = await openPackDb();
    const files = await new Promise<File[]>((resolve, reject) => {
      const tx = db.transaction(PACK_STORE_NAME, "readonly");
      const req = tx.objectStore(PACK_STORE_NAME).get(PACK_STORE_KEY);
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return files;
  } catch (err) {
    console.warn("Could not load saved resource packs:", err);
    return [];
  }
}

async function persistPackFiles(files: File[]): Promise<void> {
  try {
    const db = await openPackDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PACK_STORE_NAME, "readwrite");
      tx.objectStore(PACK_STORE_NAME).put(files, PACK_STORE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.warn("Could not save resource packs:", err);
  }
}

export function initApp(): void {
  window.addEventListener("DOMContentLoaded", async () => {
    const { MiniMessage, JsonComponentSerializer, ResourcePacks } = (
      window as any
    ).adventure;

    const input = document.querySelector(
      "#input",
    ) as HTMLTextAreaElement | null;
    const domOutput = document.querySelector(
      "#output-dom",
    ) as HTMLElement | null;
    const copyBtn = document.querySelector(
      "#copy-json-btn",
    ) as HTMLButtonElement | null;
    const strictToggle = document.querySelector(
      "#strict-toggle",
    ) as HTMLElement | null;
    const strictKnob = document.querySelector(
      "#strict-knob",
    ) as HTMLElement | null;
    const strictLabel = document.querySelector(
      "#strict-label",
    ) as HTMLElement | null;
    const langSelect = document.querySelector(
      "#lang-select",
    ) as HTMLSelectElement | null;
    const packInput = document.querySelector(
      "#resourcepack-input",
    ) as HTMLInputElement | null;
    const packListEl = document.querySelector(
      "#resourcepack-list",
    ) as HTMLElement | null;

    if (!input || !domOutput || !copyBtn) return;

    (window as any).__mcTranslations = MinecraftTranslations;

    let strictMode = false;
    let currentLang = "en_us";

    // Ordered list of File objects — array order == pack priority (later wins)
    let packFiles: File[] = [];
    let resourcePacks = ResourcePacks.empty();
    // Bridge to definitions/sprite.ts, which runs in a separate module and
    // needs the *current* ResourcePacks instance at the moment its modal is
    // opened. Mirrors the __mcTranslations bridge above.
    (window as any).__resourcePacks = resourcePacks;

    async function rebuildResourcePacks() {
      const old = resourcePacks;
      resourcePacks =
        packFiles.length > 0
          ? await ResourcePacks.fromZips([...packFiles].reverse())
          : ResourcePacks.empty();
      (window as any).__resourcePacks = resourcePacks;
      old.dispose(); // free old blob URLs only once the new set is ready
    }

    function renderPackList() {
      if (!packListEl) return;
      packListEl.innerHTML = "";
      packListEl.classList.toggle("hidden", packFiles.length === 0);

      packFiles.forEach((file, i) => {
        const row = document.createElement("div");
        row.className =
          "flex items-center gap-2 bg-background-50 rounded-lg px-3 py-1.5";

        const name = document.createElement("span");
        name.className = "text-sm text-text-80 flex-1 truncate";
        name.textContent = file.name;
        row.appendChild(name);

        const makeBtn = (label: string, title: string, disabled: boolean) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.textContent = label;
          btn.title = title;
          btn.disabled = disabled;
          btn.className =
            "text-text-50 hover:text-text disabled:opacity-30 disabled:pointer-events-none text-xs w-5 h-5 flex items-center justify-center cursor-pointer";
          return btn;
        };

        const upBtn = makeBtn("↑", "Move up (increase priority)", i === 0);
        upBtn.addEventListener("click", async () => {
          [packFiles[i - 1], packFiles[i]] = [packFiles[i], packFiles[i - 1]];
          renderPackList();
          await rebuildResourcePacks();
          await persistPackFiles(packFiles);
          mini = await buildMini();
          update();
        });
        row.appendChild(upBtn);

        const downBtn = makeBtn(
          "↓",
          "Move down (decrease priority)",
          i === packFiles.length - 1,
        );
        downBtn.addEventListener("click", async () => {
          [packFiles[i], packFiles[i + 1]] = [packFiles[i + 1], packFiles[i]];
          renderPackList();
          await rebuildResourcePacks();
          await persistPackFiles(packFiles);
          mini = await buildMini();
          update();
        });
        row.appendChild(downBtn);

        const removeBtn = makeBtn("✕", "Remove", false);
        removeBtn.addEventListener("click", async () => {
          packFiles.splice(i, 1);
          renderPackList();
          await rebuildResourcePacks();
          await persistPackFiles(packFiles);
          mini = await buildMini();
          update();
        });
        row.appendChild(removeBtn);

        packListEl.appendChild(row);
      });
    }

    async function buildMini() {
      const raw = await MinecraftTranslations.get(currentLang);
      const verbose = false;
      return MiniMessage.builder()
        .strict(strictMode)
        .postProcessor((c: any) => {
          return verbose ? c : c.compact();
        })
        .translations(raw)
        .resourcePacks(resourcePacks)
        .build();
    }

    packFiles = await loadPersistedPackFiles();
    if (packFiles.length > 0) {
      renderPackList();
      await rebuildResourcePacks();
    }

    let mini = await buildMini();

    function update() {
      domOutput!.innerHTML = "";
      try {
        const component = mini.deserialize(input!.value);
        mini.toHTML(component, domOutput);
        const json = JsonComponentSerializer.json().serialize(component);
        copyBtn!.dataset.json = JSON.stringify(json, null, 2);
      } catch (e: any) {
        console.trace(e);
        copyBtn!.dataset.json = "";
        domOutput!.innerHTML = `<span style="color:#ff5555;font-family:monospace;font-size:0.85em;opacity:0.8">${e.message ?? "Parse error"}</span>`;
      }
    }

    input.addEventListener("input", update);
    update();

    if (strictToggle && strictKnob && strictLabel) {
      strictToggle.addEventListener("click", async () => {
        strictMode = !strictMode;
        strictToggle.setAttribute("aria-checked", String(strictMode));
        if (strictMode) {
          strictKnob.style.transform = "translateX(1.375rem)";
          strictKnob.style.background = "var(--color-primary)";
          strictToggle.style.background =
            "color-mix(in srgb, var(--color-primary) 30%, transparent)";
          strictLabel.textContent = "On";
        } else {
          strictKnob.style.transform = "translateX(0.25rem)";
          strictKnob.style.background = "";
          strictToggle.style.background = "";
          strictLabel.textContent = "Off";
        }
        mini = await buildMini();
        update();
      });
    }

    if (langSelect) {
      langSelect.addEventListener("change", async () => {
        currentLang = langSelect.value;
        mini = await buildMini();
        update();
      });
    }

    if (packInput) {
      packInput.addEventListener("change", async () => {
        const newFiles = Array.from(packInput.files ?? []);
        if (newFiles.length === 0) return;

        packFiles.push(...newFiles);
        packInput.value = ""; // allow re-selecting the same file later

        renderPackList();
        await rebuildResourcePacks();
        await persistPackFiles(packFiles);
        mini = await buildMini();
        update();
      });
    }

    copyBtn.addEventListener("click", () => {
      const json = copyBtn.dataset.json;
      if (!json) return;

      navigator.clipboard
        .writeText(json)
        .then(() => {
          const textSpan = copyBtn.querySelector(".btn-text");
          if (textSpan) {
            textSpan.textContent = "Copied!";
            setTimeout(() => {
              textSpan.textContent = "Copy JSON";
            }, 1500);
          }
        })
        .catch((err) => console.error("Failed to copy JSON:", err));
    });
  });
}
