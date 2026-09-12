import { renderToolbar } from "@scripts/minimessage/toolbar";
import { boldTag } from "@scripts/minimessage/definitions/bold";
import { italicTag } from "@scripts/minimessage/definitions/italic";
import { underlinedTag } from "@scripts/minimessage/definitions/underlined";
import { strikethroughTag } from "@scripts/minimessage/definitions/strikethrough";
import { obfuscatedTag } from "@scripts/minimessage/definitions/obfuscated";
import { headTag } from "@scripts/minimessage/definitions/head";
import { colorTag } from "@scripts/minimessage/definitions/color";
import { gradientTag } from "@scripts/minimessage/definitions/gradient";
import { shadowColorTag } from "@scripts/minimessage/definitions/shadow";
import { hoverTag } from "@scripts/minimessage/definitions/hover";
import { rainbowTag } from "@scripts/minimessage/definitions/rainbow";
import { prideTag } from "@scripts/minimessage/definitions/pride";
import { clickTag } from "@scripts/minimessage/definitions/click";
import { resetTag } from "@scripts/minimessage/definitions/reset";
import { newlineTag } from "@scripts/minimessage/definitions/newline";
import { insertionTag } from "@scripts/minimessage/definitions/insertion";
import { translatableTag } from "@scripts/minimessage/definitions/translatable";
import { keybindTag } from "@scripts/minimessage/definitions/keybind";

const toolbarContent = {
  basic: {
    display: "Basic",
    tags: [colorTag, boldTag, italicTag, underlinedTag, strikethroughTag],
  },

  utility: {
    display: "Utility",
    tags: [resetTag, newlineTag],
  },

  effects: {
    display: "Effects",
    tags: [gradientTag, shadowColorTag, obfuscatedTag, rainbowTag, prideTag],
  },

  interactive: {
    display: "Interactive",
    tags: [clickTag, hoverTag, insertionTag],
  },

  content: {
    display: "Content",
    tags: [headTag, keybindTag, translatableTag],
  },
};

export function initToolbar(): void {
  const textarea = document.getElementById("input");
  const toolbar = document.getElementById("tag-toolbar");

  if (
    textarea instanceof HTMLTextAreaElement &&
    toolbar instanceof HTMLDivElement
  ) {
    renderToolbar(toolbar, textarea, toolbarContent);
  }
}