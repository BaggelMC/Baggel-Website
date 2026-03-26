((window) => {
  const { MiniMessage } = window.adventure;

  let mini = MiniMessage.miniMessage();

  MiniMessageTranslations.getAsync("en_us")
    .then((translations) => {
      mini = MiniMessage.builder()
        .translations(translations)
        .build();
      update();
    })
    .catch(console.error);

  window.addEventListener("DOMContentLoaded", () => {
    const input = document.querySelector("#input");
    const domOutput = document.querySelector("#output-dom");
    const copyBtn = document.querySelector("#copy-json-btn");

    if (!input || !domOutput || !copyBtn) return;

    function update() {
      domOutput.innerHTML = "";
      try {
        const component = mini.deserialize(input.value);
        mini.toHTML(component, domOutput);
        copyBtn.dataset.json = JSON.stringify(component, null, 2);
      } catch (e) {
        console.trace(e);
        copyBtn.dataset.json = "";
      }
    }

    input.addEventListener("input", update);
    update();

    copyBtn.addEventListener("click", () => {
      const json = copyBtn.dataset.json;
      if (!json) return;

      navigator.clipboard.writeText(json).then(() => {
        const textSpan = copyBtn.querySelector(".btn-text");
        if (textSpan) {
          textSpan.textContent = "Copied!";
          setTimeout(() => { textSpan.textContent = "Copy JSON"; }, 1500);
        }
      }).catch((err) => console.error("Failed to copy JSON:", err));
    });
  });

})(window);