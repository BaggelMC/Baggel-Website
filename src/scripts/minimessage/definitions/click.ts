import type { TagDefinition } from "../tags";
import {
  createTextInput,
  createSearchableDropdown,
  createInfoBlock,
} from "../util/components";

const toolbarIcon = `<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 7L5.5 5.5M15 7L16.5 5.5M5.5 16.5L7 15M11 5L11 3M5 11L3 11M17.1603 16.9887L21.0519 15.4659C21.4758 15.3001 21.4756 14.7003 21.0517 14.5346L11.6992 10.8799C11.2933 10.7213 10.8929 11.1217 11.0515 11.5276L14.7062 20.8801C14.8719 21.304 15.4717 21.3042 15.6375 20.8803L17.1603 16.9887Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const ACTIONS: { label: string; value: string; warning?: string }[] = [
  { label: "Change Page", value: "change_page" },
  { label: "Copy to Clipboard", value: "copy_to_clipboard" },
  { label: "Custom", value: "custom" },
  {
    label: "Open File",
    value: "open_file",
    warning:
      "This action is only used in messages generated automatically by the game (e.g. after taking a screenshot). Servers cannot send it for security reasons.",
  },
  { label: "Open URL", value: "open_url" },
  {
    label: "Run Command",
    value: "run_command",
    warning:
      "The command runs as if the player typed it, so they must have the required permissions. Only commands that don't send chat messages are allowed (e.g. /say, /tell, /teammsg).",
  },
  { label: "Show Dialog", value: "show_dialog" },
  {
    label: "Suggest Command",
    value: "suggest_command",
    warning:
      "Suggested commands are inserted into the chat bar, not executed. This does not work inside books.",
  },
];

function createWarningBlock(message: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className =
    "flex gap-2 mt-3 p-2 rounded-lg bg-background-50 text-sm text-text-50 max-w-80";

  const text = document.createElement("span");
  text.textContent = message;
  el.appendChild(text);

  return el;
}

export const clickTag: TagDefinition = {
  id: "click",
  label: "Click",
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
    let warningEl: HTMLDivElement | null = null;
    let inputWrapper!: HTMLDivElement;

    const actionDropdown = createSearchableDropdown({
      label: "Action",
      items: ACTIONS.map((a) => a.label),
    });

    let currentValidate: ((value: string) => string | null) | undefined;

    const input = createTextInput({
      placeholder: "Value",
      validate: (value) => currentValidate?.(value) ?? null,
    });

    function getSelected() {
      const label = actionDropdown.getValue();
      return ACTIONS.find((a) => a.label === label) ?? null;
    }

    function onActionChange() {
      const action = getSelected();

      if (warningEl) {
        warningEl.remove();
        warningEl = null;
      }
      if (action?.warning) {
        warningEl = createWarningBlock(action.warning);
        inputWrapper.parentElement?.insertBefore(warningEl, inputWrapper);
      }

      if (action?.value === "change_page") {
        currentValidate = (value) => {
          const n = Number(value);
          return Number.isInteger(n) && n >= 0
            ? null
            : "Must be a whole number starting from 0.";
        };
      } else {
        currentValidate = undefined;
      }
    }

    return {
      title: "Edit Click Action",

      render(container) {
        createInfoBlock(
          container,
          "Performs an action when clicking the component.",
        );

        actionDropdown.render(container);

        const dropdownInput = container.querySelector(
          "input",
        ) as HTMLInputElement;
        dropdownInput?.addEventListener("change", onActionChange);
        container.addEventListener("mousedown", () => {
          requestAnimationFrame(onActionChange);
        });

        inputWrapper = document.createElement("div");
        inputWrapper.className = "mt-3";
        container.appendChild(inputWrapper);

        input.render(inputWrapper);
      },

      validate() {
        return actionDropdown.isValid() && input.isValid();
      },

      submit() {
        const action = getSelected();
        return {
          start: `<click:${action?.value ?? actionDropdown.getValue()}:${input.getValue()}>`,
          end: null,
        };
      },
    };
  },
};
