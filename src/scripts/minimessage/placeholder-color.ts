export function initPlaceholderColor(): void {
  const textarea = document.getElementById(
    "input",
  ) as HTMLTextAreaElement | null;

  if (!textarea) return;

  const updateColor = () => {
    if (textarea.value.trim() === "") {
      textarea.classList.add("placeholder-color");
      textarea.classList.remove("input-color");
    } else {
      textarea.classList.add("input-color");
      textarea.classList.remove("placeholder-color");
    }
  };

  updateColor();
  textarea.addEventListener("input", updateColor);
}