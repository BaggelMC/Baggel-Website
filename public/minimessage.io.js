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
    if (!input || !domOutput) return;

    function update() {
      domOutput.innerHTML = "";
      try {
        const component = mm.deserialize(input.value);
        toHTML(component, domOutput);
      } catch (e) {
        console.trace(e);
      }
    }

    input.addEventListener("input", update);
    onRefresh = update;
  });
})(window);