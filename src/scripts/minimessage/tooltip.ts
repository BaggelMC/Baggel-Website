export function initTooltip(): void {
  const mcTooltip = document.getElementById("mc-tooltip");
  const outputDom = document.getElementById("output-dom");

  if (!mcTooltip || !outputDom) return;

  outputDom.addEventListener("mouseover", (e) => {
    const target = (e.target as Element).closest("[data-mc-tooltip]");
    if (!target) return;
    mcTooltip.innerHTML = target.getAttribute("data-mc-tooltip") ?? "";
    mcTooltip.style.display = "block";
    //@ts-ignore
    window.adventure.DomEffects.apply(mcTooltip);
  });

  outputDom.addEventListener("mouseout", (e) => {
    const target = (e.target as Element).closest("[data-mc-tooltip]");
    if (!target) return;
    mcTooltip.style.display = "none";
  });

  outputDom.addEventListener("scroll", (e) => {
    const target = (e.target as Element).closest("[data-mc-tooltip]");
    if (!target) return;
    mcTooltip.style.display = "none";
  });

  window.addEventListener("mousemove", (e) => {
    if (mcTooltip.style.display === "none") return;

    let x = e.clientX + 16;
    let y = e.clientY - 32;

    // Flip left if it would overflow right edge
    if (x + mcTooltip.offsetWidth > window.innerWidth - 8) {
      x = e.clientX - mcTooltip.offsetWidth - 8;
    }
    // Flip up if it would overflow bottom edge
    if (y + mcTooltip.offsetHeight > window.innerHeight - 8) {
      y = e.clientY - mcTooltip.offsetHeight - 8;
    }

    mcTooltip.style.left = x + "px";
    mcTooltip.style.top = y + "px";
  });
}