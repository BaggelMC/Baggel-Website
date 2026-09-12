import type { TagDefinition, TagModalDefinition } from "../tags";
import {
  createInfoBlock,
  createSearchableDropdown,
  createSpriteList,
} from "../util/components";
import type { SpriteThumbnailInfo } from "../util/components";

interface AtlasId {
  namespace: string;
  id: string;
}

interface TextureId {
  namespace: string;
  path: string;
}

interface ResourcePacksLike {
  listAtlases(): readonly AtlasId[];
  listAtlasSprites(namespace: string, id: string): readonly TextureId[] | null;
  resolveSprite(
    atlasNamespace: string,
    atlasId: string,
    spriteNamespace: string,
    spritePath: string,
  ): SpriteThumbnailInfo | null;
}

function getResourcePacks(): ResourcePacksLike | null {
  return (window as any).__resourcePacks ?? null;
}

function atlasDisplay(atlas: AtlasId): string {
  return `${atlas.namespace}:${atlas.id}`;
}

function parseAtlasDisplay(display: string): AtlasId {
  const sep = display.indexOf(":");
  return {
    namespace: display.substring(0, sep),
    id: display.substring(sep + 1),
  };
}

function formatArg(namespace: string, value: string): string {
  if (namespace === "minecraft" && !value.includes(":")) {
    return value;
  }
  const raw = `${namespace}:${value}`;
  const escaped = raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

const toolbarIcon = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v10h14V7H5Zm2 8 3.5-4.5 2.5 3 3-4L18 15H7Z"/></svg>`;

function buildIcon(): HTMLElement {
  const wrapper = document.createElement("span");
  wrapper.className = "w-6 h-6 flex items-center justify-center";

  const parser = new DOMParser();
  const doc = parser.parseFromString(toolbarIcon, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  if (!svgEl) throw new Error("SVG parsing failed");

  wrapper.appendChild(svgEl);
  return wrapper;
}

export const spriteTag: TagDefinition = {
  id: "sprite",
  label: "Sprite",
  appearance: buildIcon(),

  modal: (): TagModalDefinition => {
    const resourcePacks = getResourcePacks();
    const atlases = resourcePacks ? [...resourcePacks.listAtlases()] : [];

    if (!resourcePacks || atlases.length === 0) {
      return {
        title: "Insert Sprite",
        render(container) {
          createInfoBlock(
            container,
            "No resource packs are loaded yet. Upload one above, then try again.",
          );
        },
        validate() {
          return false;
        },
        submit() {
          return { start: "", end: null }; // unreachable: validate() always fails
        },
      };
    }

    const atlasOptions = atlases.map(atlasDisplay);
    let spriteList: ReturnType<typeof createSpriteList<TextureId>> | null =
      null;
    let spriteListContainer: HTMLDivElement;

    function loadSpritesForAtlas(display: string | null) {
      spriteListContainer.innerHTML = "";
      spriteList = null;
      if (!display) return;

      const atlas = parseAtlasDisplay(display);
      const sprites =
        resourcePacks!.listAtlasSprites(atlas.namespace, atlas.id) ?? [];

      spriteList = createSpriteList<TextureId>({
        items: sprites,
        resolve: (sprite) =>
          resourcePacks!.resolveSprite(
            atlas.namespace,
            atlas.id,
            sprite.namespace,
            sprite.path,
          ),
      });
      spriteList.render(spriteListContainer);
    }

    const atlasDropdown = createSearchableDropdown({
      label: "Atlas",
      items: atlasOptions,
      placeholder: "Search atlases...",
      initial: atlasOptions.length === 1 ? atlasOptions[0] : undefined,
      onSelect: loadSpritesForAtlas,
    });

    return {
      title: "Insert Sprite",

      render(container) {
        createInfoBlock(
          container,
          "Pick the atlas the texture lives in, then the sprite itself.",
        );

        atlasDropdown.render(container);

        spriteListContainer = document.createElement("div");
        spriteListContainer.className = "mt-3";
        container.appendChild(spriteListContainer);

        // createSearchableDropdown's `initial` only sets the displayed value,
        // it doesn't fire onSelect. So if we pre-selected the only atlas,
        // load its sprites explicitly
        if (atlasOptions.length === 1) {
          loadSpritesForAtlas(atlasOptions[0]);
        }
      },

      validate() {
        return (
          atlasDropdown.isValid() && spriteList !== null && spriteList.isValid()
        );
      },

      submit() {
        const atlas = parseAtlasDisplay(atlasDropdown.getValue()!);
        const sprite = spriteList!.getValue()!;
        return {
          start: `<sprite:${formatArg(atlas.namespace, atlas.id)}:${formatArg(sprite.namespace, sprite.path)}>`,
          end: null,
        };
      },
    };
  },
};
