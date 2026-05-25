import type { TagDefinition } from "./tags";
import { openModal } from "./modal";
import { insertAtSelection } from "./insert";

export type TagCategory = {
  display: string;
  tags: TagDefinition[];
};

export type ToolbarContent =
  | TagDefinition[]
  | Record<string, TagCategory>;

export function renderToolbar(
  container: HTMLElement,
  textarea: HTMLTextAreaElement,
  content: ToolbarContent
) {
  const categories: Record<string, TagCategory> = Array.isArray(content)
    ? { __all: { display: "", tags: content } }
    : content;

  Object.entries(categories).forEach(([key, category]) => {
    const group = document.createElement("div");
    group.className =
      "tag-group flex flex-col gap-2 bg-background-10 rounded-xl border border-background-50 p-2";
    group.dataset.category = key;

    if (category.display) {
      const label = document.createElement("span");
      label.className =
        "tag-group-label text-xs font-medium text-muted-foreground uppercase tracking-wide select-none";
      label.textContent = category.display;
      group.appendChild(label);
    }

    const buttons = document.createElement("div");
    buttons.className = "flex flex-wrap gap-1.5";

    category.tags.forEach(tag => {
      const button = document.createElement("button");
      button.className =
        "tag-button bg-background p-2 rounded-xl shadow-lg cursor-pointer transition duration-300 hover:scale-105";
      const appearance =
        typeof tag.appearance === "function" ? tag.appearance() : tag.appearance;
      button.title = tag.label;
      button.appendChild(appearance);

      button.onclick = () => {
        if (tag.modal) {
          const modal = tag.modal({ textarea });
          openModal({
            title: modal.title,
            render: modal.render,
            onSubmit: () => {
              if (modal.validate && !modal.validate()) return false;
              const res = modal.submit();
              insertAtSelection(textarea, res.start, res.end);
              return true;
            },
          });
        } else if (tag.staticResult) {
          insertAtSelection(textarea, tag.staticResult.start, tag.staticResult.end);
        }
      };

      buttons.appendChild(button);
    });

    group.appendChild(buttons);
    container.appendChild(group);
  });
}