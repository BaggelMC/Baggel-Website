import { locales } from "@scripts/minimessage/languages";

export function initSettingsPanel(): void {
  const toggle = document.getElementById("settings-toggle");
  const body = document.getElementById("settings-body");
  const chevron = document.getElementById("settings-chevron");

  if (toggle && body && chevron) {
    toggle.addEventListener("click", () => {
      const isOpen = !body.classList.contains("hidden");
      body.classList.toggle("hidden", isOpen);
      toggle.setAttribute("aria-expanded", String(!isOpen));
      chevron.style.transform = isOpen ? "" : "rotate(180deg)";
    });
  }

  const langSelect = document.getElementById(
    "lang-select",
  ) as HTMLSelectElement | null;

  if (langSelect) {
    const isMobile = window.innerWidth < 640;
    for (const [localeCode, localeName] of Object.entries(locales)) {
      const opt = document.createElement("option");
      opt.value = localeCode;
      opt.textContent = isMobile ? localeCode : localeName;
      if (localeCode === "en_us") opt.selected = true;
      langSelect.appendChild(opt);
    }
  }
}