import { tagRegistry } from "../pages/tools/minimessage/tags/registry"; 

export function initMiniMessageToolbar() {
  const textarea = document.getElementById("input") as HTMLTextAreaElement | null;
  const toolbar = document.getElementById("tag-toolbar");

  if (!textarea || !toolbar) return;

  tagRegistry.forEach(tag => {
    const btn = document.createElement("button");

    btn.className =
      "p-2 rounded-xl bg-background hover:bg-background-50 text-text " +
      "flex items-center justify-center";

    if (tag.icon) {
      btn.innerHTML = tag.icon;
    } else {
      btn.textContent = tag.label;
    }

    btn.onclick = () => tag.onClick(textarea);

    toolbar.appendChild(btn);
  });

}


initMiniMessageToolbar();
