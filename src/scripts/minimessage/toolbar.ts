import type { TagDefinition } from "./tags";
import { openModal } from "./modal";
import { insertAtSelection } from "./insert";

export function renderToolbar(
  container: HTMLElement,
  textarea: HTMLTextAreaElement,
  tags: TagDefinition[]
) {
  tags.forEach(tag => {
    const button = document.createElement("button");
    button.className = "tag-button";


    
    const appearance =
      typeof tag.appearance === "function"
        ? tag.appearance()
        : tag.appearance;

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
        insertAtSelection(
          textarea,
          tag.staticResult.start,
          tag.staticResult.end
        );
      }
    };

    container.appendChild(button);
  });
}
