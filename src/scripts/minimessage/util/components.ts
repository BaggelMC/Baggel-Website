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
}) {
  let selected: string | null = options.initial ?? null;
  let filtered: string[] = options.items;

  // Virtual scroll constants
  const ROW_HEIGHT = 32;
  const VISIBLE_ROWS = 8;
  const VIEWPORT_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

  let searchInput!: HTMLInputElement;
  let viewport!: HTMLDivElement;
  let spacerTop!: HTMLDivElement;
  let spacerBottom!: HTMLDivElement;
  let rowsContainer!: HTMLDivElement;
  let scrollOffset = 0;

  function getVisibleRange() {
    const start = Math.floor(scrollOffset / ROW_HEIGHT);
    const end = Math.min(start + VISIBLE_ROWS + 2, filtered.length); // +2 overscan
    return { start, end };
  }

  function renderRows() {
    const { start, end } = getVisibleRange();

    spacerTop.style.height = `${start * ROW_HEIGHT}px`;
    spacerBottom.style.height = `${Math.max(0, (filtered.length - end) * ROW_HEIGHT)}px`;

    // Reuse existing row elements where possible
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
        // Re-render just to update the highlight if dropdown reopens
        renderRows();
      };
    }
  }

  function applyFilter(query: string) {
    const q = query.toLowerCase();
    filtered = q
      ? options.items.filter(item => item.toLowerCase().includes(q))
      : options.items;
    scrollOffset = 0;
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
        applyFilter(searchInput.value);
        viewport.style.display = "block";
      });

      searchInput.addEventListener("input", () => {
        selected = null;
        applyFilter(searchInput.value);
        viewport.style.display = "block";
      });

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          viewport.style.display = "none";
          searchInput.blur();
        }
      });

      wrapper.appendChild(searchInput);

      // Dropdown viewport
      viewport = document.createElement("div");
      viewport.style.display = "none";
      viewport.style.height = `${VIEWPORT_HEIGHT}px`;
      viewport.className =
        "absolute z-50 w-full mt-1 overflow-y-auto rounded-lg bg-background border border-background-50 shadow-lg";

      viewport.addEventListener("scroll", () => {
        scrollOffset = viewport.scrollTop;
        renderRows();
      });

      // Virtual scroll structure: spacer | rows | spacer
      spacerTop = document.createElement("div");
      rowsContainer = document.createElement("div");
      spacerBottom = document.createElement("div");

      viewport.appendChild(spacerTop);
      viewport.appendChild(rowsContainer);
      viewport.appendChild(spacerBottom);
      wrapper.appendChild(viewport);

      // Close on outside click
      document.addEventListener("mousedown", (e) => {
        if (!wrapper.contains(e.target as Node)) {
          viewport.style.display = "none";
          // Reset input to last valid selection
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