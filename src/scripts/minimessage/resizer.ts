export function initResizer(): void {
  const textarea = document.getElementById(
    "input",
  ) as HTMLTextAreaElement | null;
  const resizer = document.getElementById("resizer") as HTMLDivElement | null;

  if (!textarea || !resizer) return;

  let startY: number;
  let startHeight: number;

  resizer.addEventListener("mousedown", (e: MouseEvent) => {
    e.preventDefault();
    startY = e.clientY;
    startHeight = textarea.offsetHeight;

    const onMouseMove = (e: MouseEvent) => {
      const newHeight = startHeight + (e.clientY - startY);
      if (newHeight >= 100) {
        textarea.style.height = `${newHeight}px`;

        const simplebarEl = textarea.closest(
          "[data-simplebar]",
        ) as HTMLElement | null;
        const simplebarInstance =
          simplebarEl && (simplebarEl as any).SimpleBar;
        simplebarInstance?.recalculate();
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  });
}