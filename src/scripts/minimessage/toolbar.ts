import type { TagDefinition } from "./tags";
import { openModal } from "./modal";
import { captureSelectionOffsets, insertAtOffsets } from "./insert";

export type TagCategory = {
  display: string;
  tags: TagDefinition[];
};

export type ToolbarContent = TagDefinition[] | Record<string, TagCategory>;

export function renderToolbar(
  container: HTMLElement,
  input: HTMLElement,
  content: ToolbarContent,
) {
  const categories: Record<string, TagCategory> = Array.isArray(content)
    ? { __all: { display: "", tags: content } }
    : content;

  const entries = Object.entries(categories);

  entries.forEach(([key, category], index) => {
    const group = document.createElement("div");
    group.className = "tag-group flex items-center gap-1.5";
    group.dataset.category = key;

    if (category.display) {
      const label = document.createElement("span");
      label.className =
        "tag-group-label text-[10px] font-medium text-text-50 uppercase tracking-wide select-none mr-0.5";
      label.textContent = category.display;
      group.appendChild(label);
    }

    const buttons = document.createElement("div");
    buttons.className = "flex items-center gap-1";

    category.tags.forEach((tag) => {
      const button = document.createElement("button");
      button.className =
        "tag-button group relative flex items-center justify-center w-8.5 h-8.5 shrink-0 overflow-hidden bg-background border border-background-50 rounded-lg cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 hover:border-primary hover:shadow-lg active:scale-95 active:translate-y-0 active:duration-75";

      const glow = document.createElement("span");
      glow.className =
        "pointer-events-none absolute inset-0 bg-accent opacity-0 scale-50 group-hover:opacity-15 group-hover:scale-100 transition-all duration-300 ease-out";
      glow.setAttribute("aria-hidden", "true");
      button.appendChild(glow);

      const iconWrap = document.createElement("span");
      iconWrap.className =
        "relative flex items-center justify-center w-full h-full text-sm font-semibold leading-none select-none text-text-80 group-hover:text-primary transition-colors duration-200 " +
        "[&>svg]:w-5 [&>svg]:h-5 [&>svg]:shrink-0 [&>img]:w-5 [&>img]:h-5 [&>img]:object-contain";

      const appearance =
        typeof tag.appearance === "function"
          ? tag.appearance()
          : tag.appearance;
      button.title = tag.label;
      iconWrap.appendChild(appearance);
      button.appendChild(iconWrap);

      button.addEventListener("mousedown", (e) => e.preventDefault());

      button.onclick = () => {
        const selection = captureSelectionOffsets(input);

        if (tag.modal) {
          const modal = tag.modal({ textarea: input });
          openModal({
            title: modal.title,
            render: modal.render,
            onSubmit: () => {
              if (modal.validate && !modal.validate()) return false;
              const res = modal.submit();
              insertAtOffsets(input, selection, res.start, res.end);
              return true;
            },
          });
        } else if (tag.staticResult) {
          insertAtOffsets(
            input,
            selection,
            tag.staticResult.start,
            tag.staticResult.end,
          );
        }
      };

      buttons.appendChild(button);
    });

    group.appendChild(buttons);
    container.appendChild(group);

    if (index < entries.length - 1) {
      const divider = document.createElement("div");
      divider.className = "w-px h-5 bg-background-50 mx-1 shrink-0";
      divider.setAttribute("aria-hidden", "true");
      container.appendChild(divider);
    }
  });
}
