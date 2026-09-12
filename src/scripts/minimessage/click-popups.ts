const POPUP_DURATION = 8000;
const MAX_POPUPS = 6;

const ACTION_LABELS: Record<string, string> = {
  open_url: "Opened URL:",
  run_command: "Ran Command:",
  suggest_command: "Suggested Command:",
  change_page: "Changed Page to:",
  copy_to_clipboard: "Copied to Clipboard:",
  custom: "Custom Action:",
};

function removePopup(el: HTMLElement) {
  el.classList.add("mc-popup-out");
  el.addEventListener("transitionend", () => el.remove(), { once: true });
  setTimeout(() => el.remove(), 400);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function initClickPopups(): void {
  const container = document.getElementById("mc-click-container");
  const outputDom = document.getElementById("output-dom");
  if (!container || !outputDom) return;

  function spawnPopup(action: string, value: string) {
    const existing =
      container!.querySelectorAll<HTMLElement>(".mc-click-popup");
    if (existing.length >= MAX_POPUPS) {
      removePopup(existing[0]);
    }

    const label = ACTION_LABELS[action] ?? action;

    const popup = document.createElement("div");
    popup.className = "mc-click-popup";
    popup.style.position = "relative";
    popup.style.overflow = "hidden";
    popup.style.setProperty("--mc-duration", `${POPUP_DURATION}ms`);

    popup.innerHTML = `
      <div class="mc-click-popup-body">
        <div class="mc-click-popup-action">${escapeHtml(label)}</div>
        <div class="mc-click-popup-value">${escapeHtml(value)}</div>
      </div>
      <button class="mc-click-popup-close" aria-label="Dismiss" title="Dismiss">✕</button>
      <div class="mc-click-progress"></div>
    `;

    const closeBtn = popup.querySelector<HTMLButtonElement>(
      ".mc-click-popup-close",
    )!;
    closeBtn.addEventListener("click", () => removePopup(popup));

    container!.appendChild(popup);

    let timer = setTimeout(() => removePopup(popup), POPUP_DURATION);

    popup.addEventListener("mouseenter", () => clearTimeout(timer));
    popup.addEventListener("mouseleave", () => {
      timer = setTimeout(() => removePopup(popup), 800);
    });
  }

  outputDom.addEventListener("click", (e: MouseEvent) => {
    const target = (e.target as Element).closest<HTMLElement>(
      "[data-mc-click-action]",
    );
    if (!target) return;
    const action = target.dataset.mcClickAction ?? "";
    const value = target.dataset.mcClickValue ?? "";
    spawnPopup(action, value);
  });

  outputDom.addEventListener("click", (e: MouseEvent) => {
    if (!e.shiftKey) return;
    const target = (e.target as Element).closest<HTMLElement>(
      "[data-mc-insertion]",
    );
    if (!target) return;
    const value = target.dataset.mcInsertion ?? "";
    spawnPopup("Inserted Text:", value);
  });
}