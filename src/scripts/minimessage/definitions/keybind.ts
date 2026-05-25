import type { TagDefinition } from "../tags";
import {
  createTextInput,
  createSearchableDropdown,
  createInfoBlock,
} from "../util/components";

const toolbarIcon = `<svg fill="currentColor" width="800px" height="800px" viewBox="0 0 35 35" data-name="Layer 2" id="bfab7229-f4bd-4fb9-b4e2-5cc957a1c57b" xmlns="http://www.w3.org/2000/svg"><path d="M30.559,33.936H4.441A4.2,4.2,0,0,1,.25,29.744V12.059A4.2,4.2,0,0,1,4.441,7.867H30.559a4.2,4.2,0,0,1,4.191,4.192V29.744A4.2,4.2,0,0,1,30.559,33.936ZM4.441,10.367A1.694,1.694,0,0,0,2.75,12.059V29.744a1.694,1.694,0,0,0,1.691,1.692H30.559a1.694,1.694,0,0,0,1.691-1.692V12.059a1.694,1.694,0,0,0-1.691-1.692Z"/><path d="M23.323,27.829H11.677a1.25,1.25,0,0,1,0-2.5H23.323a1.25,1.25,0,0,1,0,2.5Z"/><path d="M9.966,16.564a1.251,1.251,0,0,0,0-2.5,1.251,1.251,0,0,0,0,2.5Z"/><path d="M14.989,16.474a1.251,1.251,0,0,0,0-2.5,1.251,1.251,0,0,0,0,2.5Z"/><path d="M20.011,16.474a1.251,1.251,0,0,0,0-2.5,1.251,1.251,0,0,0,0,2.5Z"/><path d="M25.034,16.474a1.251,1.251,0,0,0,0-2.5,1.251,1.251,0,0,0,0,2.5Z"/><path d="M7.455,22.047a1.251,1.251,0,0,0,0-2.5,1.251,1.251,0,0,0,0,2.5Z"/><path d="M12.477,21.957a1.251,1.251,0,0,0,0-2.5,1.251,1.251,0,0,0,0,2.5Z"/><path d="M17.5,21.957a1.251,1.251,0,0,0,0-2.5,1.251,1.251,0,0,0,0,2.5Z"/><path d="M22.523,21.957a1.251,1.251,0,0,0,0-2.5,1.251,1.251,0,0,0,0,2.5Z"/><path d="M27.545,21.957a1.251,1.251,0,0,0,0-2.5,1.251,1.251,0,0,0,0,2.5Z"/><path d="M18.533,8.487a1.852,1.852,0,0,1,.847-2.478,5.376,5.376,0,0,1,3.935-.181,8.62,8.62,0,0,0,4.848.151,3.838,3.838,0,0,0,2.663-3.665c-.085-1.6-2.585-1.61-2.5,0,.075,1.408-1.734,1.551-2.763,1.426-1.668-.2-3.233-.84-4.943-.655a5.432,5.432,0,0,0-4.1,2.284,4.163,4.163,0,0,0-.146,4.38c.837,1.371,3,.116,2.159-1.262Z"/></svg>`;

export const KEYBIND_TO_LITERAL: Record<string, string> = {
  // movement
  "key.jump": "Space",
  "key.sneak": "Left Shift",
  "key.sprint": "Left Control",
  "key.left": "A",
  "key.right": "D",
  "key.back": "S",
  "key.forward": "W",

  // miscellaneous
  "key.advancements": "L",
  "key.quickActions": "G",
  "key.screenshot": "F2",
  "key.smoothCamera": "Not Bound",
  "key.fullscreen": "F11",
  "key.toggleGui": "F1",
  "key.togglePerspective": "F5",
  "key.toggleSpectatorShaderEffects": "F4",

  // multiplayer
  "key.friends": "O",
  "key.playerlist": "Tab",
  "key.chat": "T",
  "key.command": "/",
  "key.socialInteractions": "P",

  // gameplay
  "key.attack": "Left Button",
  "key.pickItem": "Middle Button",
  "key.use": "Right Button",

  // inventory
  "key.drop": "Q",
  "key.hotbar.1": "1",
  "key.hotbar.2": "2",
  "key.hotbar.3": "3",
  "key.hotbar.4": "4",
  "key.hotbar.5": "5",
  "key.hotbar.6": "6",
  "key.hotbar.7": "7",
  "key.hotbar.8": "8",
  "key.hotbar.9": "9",
  "key.inventory": "E",
  "key.swapOffhand": "F",

  // creative mode
  "key.loadToolbarActivator": "X",
  "key.saveToolbarActivator": "C",

  // spectator
  "key.spectatorOutlines": "Not Bound",
  "key.spectatorHotbar": "Middle Button",

  // debug
  "key.debug.overlay": "F3",
  "key.debug.modifier": "F3",
  "key.debug.clearChat": "D",
  "key.debug.copyRecreateCommand": "I",
  "key.debug.copyLocation": "C",
  "key.debug.spectate": "N",
  "key.debug.crash": "C",
  "key.debug.debugOptions": "F6",
  "key.debug.dumpDynamicTextures": "S",
  "key.debug.dumpVersion": "V",
  "key.debug.switchGameMode": "F4",
  "key.debug.reloadChunk": "A",
  "key.debug.reloadResourcePacks": "T",
  "key.debug.showAdvancedTooltips": "H",
  "key.debug.showHitboxes": "B",
  "key.debug.profiling": "L",
  "key.debug.focusPause": "P",
  "key.debug.profilingChart": "1",
  "key.debug.fpsCharts": "2",
  "key.debug.networkCharts": "3",
};

export const keybindTag: TagDefinition = {
  id: "keybind",
  label: "Keybind",
  appearance: (() => {
    const wrapper = document.createElement("span");
    wrapper.className = "w-6 h-6 flex items-center justify-center";

    const parser = new DOMParser();
    const doc = parser.parseFromString(toolbarIcon, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    if (!svgEl) throw new Error("SVG parsing failed");

    wrapper.appendChild(svgEl);
    return wrapper;
  })(),
  modal: () => {
    const keybindDropdown = createSearchableDropdown({
      label: "Keybind",
      items: Object.keys(KEYBIND_TO_LITERAL),
    });

    const customInput = createTextInput({
      placeholder: "custom keybind id…",
      validate: (value) =>
        value.trim().length > 0 ? null : "Keybind identifier cannot be empty.",
    });

    return {
      title: "Edit Keybind",

      render(container) {
        createInfoBlock(
          container,
          "Displays the key bound to the selected action, as configured by the player.",
        );

        keybindDropdown.render(container);

        const wrapper = document.createElement("div");
        wrapper.className = "mt-3";
        container.appendChild(wrapper);
        customInput.render(wrapper);
      },

      validate() {
        const hasDropdown = keybindDropdown.getValue().trim().length > 0;
        const hasCustom = customInput.getValue().trim().length > 0;
        return hasDropdown || customInput.isValid() && hasCustom;
      },

      submit() {
        const value = customInput.getValue().trim() || keybindDropdown.getValue();
        return {
          start: `<key:${value}>`,
          end: null,
        };
      },
    };
  },
};