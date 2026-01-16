// Responsible for handling inputs and outputs
((window) => {
  const { builder, toHTML, tags } = MiniMessage;

  let builderParams = {
    "tags": tags.defaults(),
    "translations": {}
  };
  let mm;

  let onRefresh = (() => {});
  function refreshMM() {
    const b = builder();
    for (const k of Object.keys(builderParams)) {
      b[k](builderParams[k]);
    }
    mm = b.build();
    onRefresh();
  }
  refreshMM();

  const userLangs = ((navigator) => {
    return navigator.languages || ((!!navigator.language) && [ navigator.language ]) || [];
  })(typeof navigator === "object" ? navigator : window["navigator"]);

  let targetLang = "en_us";
  for (let lang of userLangs) {
    if (MiniMessageTranslations.has(lang)) {
      targetLang = lang;
      break;
    }
  }

  MiniMessageTranslations.getAsync(targetLang).then((translations) => {
    setParam("translations", translations);
  }).catch(console.error);

  function setParam(key, value) {
    builderParams[key] = value;
    refreshMM();
  }

  window.addEventListener("DOMContentLoaded", () => {
    const input = document.querySelector("#input");
    const domOutput = document.querySelector("#output-dom");
    const copyBtn = document.querySelector("#copy-json-btn");

    if (!input || !domOutput || !copyBtn) return;

    function update() {
      domOutput.innerHTML = "";
      try {
        const component = mm.deserialize(input.value);
        toHTML(component, domOutput);

        copyBtn.dataset.json = JSON.stringify(component, null, 2);
      } catch (e) {
        console.trace(e);
        copyBtn.dataset.json = "";
      }
    }

    input.addEventListener("input", update);
    onRefresh = update;

    copyBtn.addEventListener("click", () => {
      const json = copyBtn.dataset.json;
      if (!json) return;

      navigator.clipboard.writeText(json).then(() => {
        const textSpan = copyBtn.querySelector(".btn-text");
        if (textSpan) {
          textSpan.textContent = "Copied!";
          setTimeout(() => {
            textSpan.textContent = "Copy JSON";
          }, 1500);
        }
      }).catch((err) => {
        console.error("Failed to copy JSON:", err);
      });
    });

  });

})(window);