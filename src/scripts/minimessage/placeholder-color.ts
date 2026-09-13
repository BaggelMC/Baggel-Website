import { getPlainText } from "./editable-highlight";

export function initPlaceholderColor(): void {
  const input = document.getElementById("input") as HTMLElement | null;

  if (!input) return;

  const updateColor = () => {
    if (getPlainText(input).trim() === "") {
      input.classList.add("placeholder-color");
      input.classList.remove("input-color");
    } else {
      input.classList.add("input-color");
      input.classList.remove("placeholder-color");
    }
  };

  updateColor();
  input.addEventListener("input", updateColor);
}