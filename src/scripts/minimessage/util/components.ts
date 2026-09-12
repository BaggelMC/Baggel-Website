export function createInfoBlock(container: HTMLElement, message: string) {
  const el = document.createElement("div");
  el.className = "flex gap-2 mt-3 p-2 text-sm text-text-50 max-w-80";

  const text = document.createElement("span");
  text.textContent = message;
  el.appendChild(text);

  container.appendChild(el);
}

export function createNumberInput(options: {
  label: string;
  min: number;
  max: number;
  initial?: number;
}) {
  let input!: HTMLInputElement;

  return {
    render(container: HTMLElement) {
      const label = document.createElement("label");
      label.className = "block text-sm mb-1";
      label.textContent = options.label;
      container.appendChild(label);

      input = document.createElement("input");
      input.type = "number";
      input.min = String(options.min);
      input.max = String(options.max);
      input.value = String(options.initial ?? options.min);
      input.className = "bg-background w-full p-2 rounded-lg";
      container.appendChild(input);
    },

    getValue() {
      return Number(input.value);
    },

    isValid() {
      const v = Number(input.value);
      return !isNaN(v) && v >= options.min && v <= options.max;
    },
  };
}

export function createToggle(options: { label: string; initial?: boolean }) {
  let button!: HTMLButtonElement;
  let knob!: HTMLSpanElement;
  let on = options.initial ?? false;

  function apply() {
    button.setAttribute("aria-checked", String(on));
    button.classList.toggle("bg-primary", on);
    button.classList.toggle("bg-background-50", !on);
    knob.classList.toggle("translate-x-6", on);
    knob.classList.toggle("translate-x-1", !on);
  }

  return {
    render(container: HTMLElement) {
      const row = document.createElement("div");
      row.className = "flex items-center gap-3";

      const label = document.createElement("span");
      label.className = "text-sm";
      label.textContent = options.label;
      row.appendChild(label);

      button = document.createElement("button");
      button.setAttribute("role", "switch");
      button.className =
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer";

      knob = document.createElement("span");
      knob.className =
        "inline-block h-4 w-4 rounded-full bg-text-50 shadow transition-all duration-200";
      button.appendChild(knob);

      button.addEventListener("click", () => {
        on = !on;
        apply();
      });

      apply();
      row.appendChild(button);
      container.appendChild(row);
    },

    getValue() {
      return on;
    },
  };
}

export function createTextInput(options: {
  label?: string;
  placeholder?: string;
  initial?: string;
  validate?: (value: string) => string | null; // return error string, or null if valid
}) {
  let input!: HTMLInputElement;
  let errorEl!: HTMLDivElement;

  return {
    render(container: HTMLElement) {
      if (options.label) {
        const label = document.createElement("label");
        label.className = "block text-sm mb-1";
        label.textContent = options.label;
        container.appendChild(label);
      }

      input = document.createElement("input");
      input.type = "text";
      input.placeholder = options.placeholder ?? "";
      input.value = options.initial ?? "";
      input.className = "bg-background w-full p-2 rounded-lg";
      container.appendChild(input);

      errorEl = document.createElement("div");
      errorEl.className = "text-error mt-2 text-sm";
      container.appendChild(errorEl);
    },

    getValue() {
      return input.value.trim();
    },

    isValid() {
      if (!options.validate) return true;
      const error = options.validate(input.value.trim());
      errorEl.textContent = error ?? "";
      return error === null;
    },
  };
}

export function createSearchableDropdown(options: {
  label: string;
  items: string[];
  initial?: string;
  placeholder?: string;
  onSelect?: (value: string | null) => void;
}) {
  let selected: string | null = options.initial ?? null;
  let filtered: string[] = options.items;

  // Virtual scroll constants
  const ROW_HEIGHT = 32;
  const VISIBLE_ROWS = 8;
  const VIEWPORT_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

  let searchInput!: HTMLInputElement;
  let viewport!: HTMLDivElement;
  let innerTrack!: HTMLDivElement;
  let rowsContainer!: HTMLDivElement;

  function renderRows() {
    const scrollOffset = viewport.scrollTop;
    const start = Math.floor(scrollOffset / ROW_HEIGHT);
    const end = Math.min(start + VISIBLE_ROWS + 2, filtered.length);

    innerTrack.style.height = `${filtered.length * ROW_HEIGHT}px`;

    rowsContainer.style.top = `${start * ROW_HEIGHT}px`;

    const needed = end - start;
    while (rowsContainer.children.length > needed) {
      rowsContainer.removeChild(rowsContainer.lastChild!);
    }
    while (rowsContainer.children.length < needed) {
      const row = document.createElement("div");
      row.style.height = `${ROW_HEIGHT}px`;
      row.className =
        "flex items-center px-2 cursor-pointer rounded text-sm hover:bg-background-50 transition-colors";
      rowsContainer.appendChild(row);
    }

    for (let i = 0; i < needed; i++) {
      const item = filtered[start + i];
      const row = rowsContainer.children[i] as HTMLDivElement;
      row.textContent = item;
      row.classList.toggle("text-primary", item === selected);

      row.onclick = () => {
        selected = item;
        searchInput.value = item;
        viewport.style.display = "none";
        renderRows();
        options.onSelect?.(selected);
      };
    }
  }

  function applyFilter(query: string) {
    const q = query.toLowerCase();
    filtered = q
      ? options.items.filter((item) => item.toLowerCase().includes(q))
      : options.items;

    viewport.scrollTop = 0;
    renderRows();
  }

  return {
    render(container: HTMLElement) {
      if (options.label) {
        const label = document.createElement("label");
        label.className = "block text-sm mb-1";
        label.textContent = options.label;
        container.appendChild(label);
      }

      const wrapper = document.createElement("div");
      wrapper.className = "relative";
      container.appendChild(wrapper);

      // Input
      searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.placeholder = options.placeholder ?? "Search...";
      searchInput.value = selected ?? "";
      searchInput.className = "bg-background w-full p-2 rounded-lg text-sm";

      searchInput.addEventListener("focus", () => {
        viewport.style.display = "block";
        applyFilter(searchInput.value);
      });

      searchInput.addEventListener("input", () => {
        selected = null;
        applyFilter(searchInput.value);
        viewport.style.display = "block";
        options.onSelect?.(null);
      });

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          viewport.style.display = "none";
          searchInput.blur();
        }
      });

      wrapper.appendChild(searchInput);

      viewport = document.createElement("div");
      viewport.style.display = "none";
      viewport.style.height = `${VIEWPORT_HEIGHT}px`;
      viewport.className =
        "absolute z-50 w-full mt-1 overflow-y-auto rounded-lg bg-background border border-background-50 shadow-lg";

      viewport.addEventListener("scroll", () => {
        renderRows();
      });

      innerTrack = document.createElement("div");
      innerTrack.style.position = "relative";

      rowsContainer = document.createElement("div");
      rowsContainer.style.position = "absolute";
      rowsContainer.style.left = "0";
      rowsContainer.style.right = "0";

      innerTrack.appendChild(rowsContainer);
      viewport.appendChild(innerTrack);
      wrapper.appendChild(viewport);

      document.addEventListener("mousedown", (e) => {
        if (!wrapper.contains(e.target as Node)) {
          viewport.style.display = "none";
          if (selected !== null) {
            searchInput.value = selected;
          }
        }
      });
    },

    getValue() {
      return selected;
    },

    isValid() {
      return selected !== null && options.items.includes(selected);
    },
  };
}

export interface SpriteThumbnailInfo {
  url: string;
  width: number;
  height: number;
  animation: {
    frameWidth: number;
    frameHeight: number;
    frames: readonly { row: number; durationMs: number }[];
  } | null;
}

const SPRITE_THUMB_SIZE = 24; // px, longest edge

export function createSpriteList<
  T extends { namespace: string; path: string },
>(options: {
  items: readonly T[];
  resolve: (item: T) => SpriteThumbnailInfo | null;
  placeholder?: string;
  initial?: T | null;
}) {
  let selected: T | null = options.initial ?? null;
  let filtered: readonly T[] = options.items;

  // Virtual scroll constants (same technique as createSearchableDropdown)
  const ROW_HEIGHT = 40;
  const VISIBLE_ROWS = 10;
  const VIEWPORT_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

  let searchInput!: HTMLInputElement;
  let viewport!: HTMLDivElement;
  let innerTrack!: HTMLDivElement;
  let rowsContainer!: HTMLDivElement;
  let emptyState!: HTMLDivElement;

  function itemLabel(item: T): string {
    return item.namespace === "minecraft"
      ? item.path
      : `${item.namespace}:${item.path}`;
  }

  function applyThumbnail(thumb: HTMLDivElement, item: T) {
    const info = options.resolve(item);
    if (!info) {
      thumb.style.backgroundImage = "";
      thumb.style.width = `${SPRITE_THUMB_SIZE}px`;
      thumb.style.height = `${SPRITE_THUMB_SIZE}px`;
      return;
    }

    // Only the first frame is shown for animated sprites for now. When
    // animated previews are added, this is the place to start a per-row
    // timer that steps `backgroundPosition` through `info.animation.frames`
    // using each frame's `durationMs`, instead of always using frame 0.
    const frameWidth = info.animation?.frameWidth ?? info.width;
    const frameHeight = info.animation?.frameHeight ?? info.height;
    const firstRow = info.animation?.frames[0]?.row ?? 0;

    const scale = SPRITE_THUMB_SIZE / Math.max(frameWidth, frameHeight);

    thumb.style.width = `${frameWidth * scale}px`;
    thumb.style.height = `${frameHeight * scale}px`;
    thumb.style.backgroundImage = `url(${info.url})`;
    thumb.style.backgroundSize = `${info.width * scale}px ${info.height * scale}px`;
    thumb.style.backgroundPosition = `0 -${firstRow * frameHeight * scale}px`;
  }

  function renderRows() {
    const scrollOffset = viewport.scrollTop;
    const start = Math.floor(scrollOffset / ROW_HEIGHT);
    const end = Math.min(start + VISIBLE_ROWS + 2, filtered.length);

    innerTrack.style.height = `${filtered.length * ROW_HEIGHT}px`;
    rowsContainer.style.top = `${start * ROW_HEIGHT}px`;

    const needed = end - start;
    while (rowsContainer.children.length > needed) {
      rowsContainer.removeChild(rowsContainer.lastChild!);
    }
    while (rowsContainer.children.length < needed) {
      const row = document.createElement("div");
      row.style.height = `${ROW_HEIGHT}px`;
      row.className =
        "flex items-center gap-2 px-2 cursor-pointer rounded text-sm hover:bg-background-50 transition-colors";

      const thumbWrap = document.createElement("div");
      thumbWrap.className = "shrink-0 w-6 h-6 flex items-center justify-center";
      const thumb = document.createElement("div");
      thumb.className = "bg-no-repeat [image-rendering:pixelated]";
      thumbWrap.appendChild(thumb);
      row.appendChild(thumbWrap);

      const label = document.createElement("span");
      label.className = "truncate";
      row.appendChild(label);

      rowsContainer.appendChild(row);
    }

    for (let i = 0; i < needed; i++) {
      const item = filtered[start + i];
      const row = rowsContainer.children[i] as HTMLDivElement;
      const thumb = row.querySelector("div > div") as HTMLDivElement;
      const label = row.children[1] as HTMLSpanElement;

      label.textContent = itemLabel(item);
      row.classList.toggle("bg-background-50", item === selected);
      applyThumbnail(thumb, item);

      row.onclick = () => {
        selected = item;
        renderRows();
      };
    }

    emptyState.classList.toggle("hidden", filtered.length > 0);
  }

  function applyFilter(query: string) {
    const q = query.toLowerCase();
    filtered = q
      ? options.items.filter((item) =>
          itemLabel(item).toLowerCase().includes(q),
        )
      : options.items;
    viewport.scrollTop = 0;
    renderRows();
  }

  return {
    render(container: HTMLElement) {
      searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.placeholder = options.placeholder ?? "Search sprites...";
      searchInput.className =
        "bg-background w-full p-2 rounded-lg text-sm mb-2";
      searchInput.addEventListener("input", () =>
        applyFilter(searchInput.value),
      );
      container.appendChild(searchInput);

      viewport = document.createElement("div");
      viewport.style.height = `${VIEWPORT_HEIGHT}px`;
      viewport.className =
        "relative overflow-y-auto rounded-lg bg-background border border-background-50";
      viewport.addEventListener("scroll", () => renderRows());
      container.appendChild(viewport);

      innerTrack = document.createElement("div");
      innerTrack.style.position = "relative";
      viewport.appendChild(innerTrack);

      rowsContainer = document.createElement("div");
      rowsContainer.style.position = "absolute";
      rowsContainer.style.left = "0";
      rowsContainer.style.right = "0";
      innerTrack.appendChild(rowsContainer);

      emptyState = document.createElement("div");
      emptyState.className = "text-sm text-text-50 p-2 hidden";
      emptyState.textContent = "No sprites match your search.";
      container.appendChild(emptyState);

      renderRows();
    },

    getValue() {
      return selected;
    },

    isValid() {
      return selected !== null;
    },
  };
}
