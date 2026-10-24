/**
 * =============================================================================
 *  <community-badges>  —  our 88×31 community badges, as a Web Component
 * =============================================================================
 *
 * This file is meant to be read. If you are about to put it on your website,
 * please do read it: it is short, and everything it does is explained below.
 *
 * -----------------------------------------------------------------------------
 *  HOW TO USE IT
 * -----------------------------------------------------------------------------
 *
 *  The simplest version:
 *
 *      <script type="module" src="https://baggel.de/embed.js"></script>
 *      <community-badges></community-badges>
 *
 *  With customization:
 *
 *      <community-badges id="community"></community-badges>
 *      <script type="module">
 *        import "https://baggel.de/embed.js";
 *
 *        document.querySelector("#community").config = {
 *          exclude:   ["bob"],                                  // hide members
 *          overrides: { alice: { badge: "/my-alice-badge.svg" } }, // change members
 *          extra:     [{ id: "pal", name: "My Pal",             // add members
 *                        url: "https://pal.example/",
 *                        badge: "/pal.svg" }],
 *        };
 *      </script>
 *
 * -----------------------------------------------------------------------------
 *  WHAT THIS SCRIPT DOES (the complete list)
 * -----------------------------------------------------------------------------
 *
 *  1. Downloads a small JSON file (web_badges.json) listing the community members.
 *     By default it lives next to this script. The request is sent WITHOUT
 *     cookies or login credentials.
 *  2. Applies the optional `config` you set (exclude / overrides / extra).
 *  3. Builds a list of links, each containing one badge image, inside a
 *     Shadow DOM so the rest of your page's CSS can't accidentally break it.
 *
 *  Network traffic your visitors cause:
 *    - one request for this script,
 *    - one request for web_badges.json,
 *    - one request per badge image (a normal <img>; the browser does this).
 *  Whoever hosts those files can see those requests in their server logs, as
 *  with any file on the internet.
 *
 *  What this script does NOT do:
 *    - no analytics, no tracking, no cookies, no localStorage,
 *    - no contact with any server other than the ones your own config and the
 *      JSON file point to,
 *    - no redirects: the links go straight to each member's website,
 *    - no eval(), no innerHTML, no inline event handlers. All content is placed
 *      on the page with safe DOM calls, and only http(s) links are allowed.
 *
 * -----------------------------------------------------------------------------
 *  CONFIG REFERENCE   (element.config = { ... })   all keys optional
 * -----------------------------------------------------------------------------
 *
 *   exclude    string[]               ids of members you do NOT want to show.
 *   overrides  { [id]: partial }      change fields of an existing member.
 *                                     Allowed fields: name, url, badge, alt.
 *   extra      member[]               additional members to append. A member is
 *                                     { id, name, url, badge, alt? }.
 *                                     If an id already exists it is replaced.
 *
 *   Relative URLs in your config (like "/images/x.svg") are resolved against
 *   YOUR page, not ours.
 *
 *   Setting `element.config` again re-renders the list.
 *
 * -----------------------------------------------------------------------------
 *  STYLING REFERENCE
 * -----------------------------------------------------------------------------
 *
 *  Because of the Shadow DOM, your page's CSS cannot reach inside by accident.
 *  We deliberately expose two ways in:
 *
 *  (a) CSS custom properties, for quick adjustments. Set them on the element
 *      or on any ancestor:
 *
 *        --cb-gap        space between badges                (default 6px)
 *        --cb-justify    flex alignment: flex-start | center | flex-end |
 *                        space-between                       (default flex-start)
 *        --cb-width      rendered badge width                (default 88px)
 *        --cb-height     rendered badge height               (default 31px)
 *        --cb-fit        object-fit for the image            (default contain)
 *        --cb-rendering  image-rendering: auto | pixelated   (default auto)
 *        --cb-focus      keyboard focus outline color        (default currentColor)
 *
 *  (b) Shadow parts, for complete redesigns. Style them with ::part():
 *
 *        community-badges::part(list)          the <ul>
 *        community-badges::part(item)          each <li>
 *        community-badges::part(link)          each <a>
 *        community-badges::part(badge)         each <img>
 *        community-badges::part(member-alice)  the <li> of the member "alice"
 *
 *      Tip: ::part() can't be chained with descendant selectors, so to react
 *      to hovering use  ::part(badge):hover  rather than  ::part(link):hover img.
 *
 *  The element also sets   data-state="loading" | "ready" | "error"   on itself
 *  so you can style each phase, e.g.
 *     community-badges[data-state="loading"] { min-height: 31px; }
 *
 *  If the JSON can't be loaded, anything you wrote INSIDE the tag is shown as
 *  fallback content:
 *     <community-badges><a href="https://baggel.de/">Our community</a></community-badges>
 *
 * -----------------------------------------------------------------------------
 *  OPTIONAL ATTRIBUTE
 * -----------------------------------------------------------------------------
 *
 *   src="..."   load a different JSON file (useful for testing locally).
 *
 * =============================================================================
 */


/* ============================================================================
 * 1. CONSTANTS
 * ========================================================================= */

/**
 * The version of the JSON format this script understands. If web_badges.json ever
 * says something else, we refuse to guess and show the fallback instead.
 */
const SUPPORTED_DATA_VERSION = 1;

/**
 * Where to find the member list by default: a file called "web_badges.json" in the
 * same folder as this script. `import.meta.url` is the address this script was
 * loaded from, which is what lets us say "next to me" no matter who embeds us.
 */
const DEFAULT_DATA_URL = new URL("./web_badges.json", import.meta.url).href;

/** The classic dimensions of these buttons. */
const BADGE_WIDTH = 88;
const BADGE_HEIGHT = 31;


/* ============================================================================
 * 2. STYLES
 *
 * This CSS lives inside the Shadow DOM, so it only affects this component.
 * Every `var(--cb-...)` below is a hook that embedders can override.
 * ========================================================================= */

const STYLES = `
  /* The element itself behaves like a normal block. */
  :host {
    display: block;
  }

  /* Respect the standard "hidden" attribute. */
  :host([hidden]) {
    display: none;
  }

  /* The list: a wrapping row of badges. */
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cb-gap, 6px);
    justify-content: var(--cb-justify, flex-start);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: block;
  }

  /* line-height: 0 stops the browser from adding a few pixels of empty space
     under the image (the "inline image gap"). */
  a {
    display: block;
    line-height: 0;
  }

  /* A visible outline for keyboard users. */
  a:focus-visible {
    outline: 2px solid var(--cb-focus, currentColor);
    outline-offset: 2px;
  }

  img {
    display: block;
    width: var(--cb-width, 88px);
    height: var(--cb-height, 31px);
    object-fit: var(--cb-fit, contain);
    image-rendering: var(--cb-rendering, auto);
  }
`;


/* ============================================================================
 * 3. LOADING THE MEMBER LIST
 * ========================================================================= */

/**
 * Remembers requests we already started, keyed by URL. If a page contains
 * several <community-badges>, they all share ONE download of the JSON.
 *
 * @type {Map<string, Promise<unknown[]>>}
 */
const requestsByUrl = new Map();

/**
 * Downloads and sanity-checks the JSON file.
 *
 * @param {string} url  Absolute URL of the JSON file.
 * @returns {Promise<unknown[]>}  The raw `members` array (still unvalidated).
 */
function fetchMembers(url) {
  // Already requested (or in flight)? Reuse it.
  if (requestsByUrl.has(url)) {
    return requestsByUrl.get(url);
  }

  const request = fetch(url, {
    credentials: "omit", // never send cookies to the server
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`server answered with HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data || data.version !== SUPPORTED_DATA_VERSION) {
        throw new Error(`unsupported data version: ${data && data.version}`);
      }
      if (!Array.isArray(data.members)) {
        throw new Error('data has no "members" list');
      }
      return data.members;
    });

  requestsByUrl.set(url, request);

  // If it failed, forget it, so the next render can try again.
  request.catch(() => requestsByUrl.delete(url));

  return request;
}


/* ============================================================================
 * 4. CLEANING UP DATA
 *
 * Member data comes from two places we don't fully control: the JSON file and
 * the embedder's config. Before anything reaches the page, each entry is
 * checked and normalized here.
 * ========================================================================= */

/**
 * @typedef {Object} Member
 * @property {string} id     Unique, stable key, e.g. "alice".
 * @property {string} name   Display name. Also used as the link tooltip.
 * @property {string} url    Absolute http(s) URL of the member's website.
 * @property {string} badge  Absolute http(s) URL of the badge image.
 * @property {string} alt    Alternative text for the image.
 */

/** Wraps non-arrays so we can loop safely: toArray(undefined) → [] */
function toArray(value) {
  return Array.isArray(value) ? value : [];
}

/**
 * Turns `value` into an absolute URL, but ONLY if it's a normal web address.
 *
 * Why the check? Browsers also understand addresses like `javascript:...`,
 * which run code when a link is clicked. Allowing only http: and https: makes
 * sure a link can only ever be a link.
 *
 * @param {unknown} value  What was written in the JSON or the config.
 * @param {string}  base   What to resolve relative addresses against.
 * @returns {string|null}  An absolute URL, or null if unusable.
 */
function toSafeUrl(value, base) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  try {
    const url = new URL(value, base);
    const isWebAddress = url.protocol === "https:" || url.protocol === "http:";
    return isWebAddress ? url.href : null;
  } catch {
    return null; // not a valid URL at all
  }
}

/**
 * Validates one raw entry and returns a clean Member, or null if it's unusable.
 * An entry needs an id, a usable url, and a usable badge. Name and alt text
 * fall back to sensible defaults.
 *
 * @param {unknown} raw   One entry as found in the JSON or config.
 * @param {string}  base  Base for resolving relative URLs in this entry.
 * @returns {Member|null}
 */
function toMember(raw, base) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const id = String(raw.id ?? "").trim();
  const url = toSafeUrl(raw.url, base);
  const badge = toSafeUrl(raw.badge, base);

  if (id === "" || url === null || badge === null) {
    return null;
  }

  const name = String(raw.name ?? id);
  const alt = String(raw.alt ?? name);

  return { id, name, url, badge, alt };
}


/* ============================================================================
 * 5. APPLYING THE EMBEDDER'S CONFIG
 * ========================================================================= */

/**
 * Combines the community's member list with the embedder's customizations.
 *
 * The order of operations is always the same:
 *   1. Start with the members from web_badges.json.
 *   2. Drop the ones listed in `config.exclude`.
 *   3. Apply `config.overrides` to the ones that remain.
 *   4. Add `config.extra` at the end.
 *
 * @param {unknown[]} remoteMembers  Raw entries from web_badges.json.
 * @param {string}    remoteBase     URL of web_badges.json (for relative URLs in it).
 * @param {Object}    config         The embedder's config (may be empty).
 * @returns {Member[]}
 */
function buildMemberList(remoteMembers, remoteBase, config) {
  // Relative URLs the EMBEDDER writes ("/images/x.svg") mean "on my site".
  const embedderBase = document.baseURI;

  const excludedIds = new Set(toArray(config.exclude));
  const overrides =
    config.overrides && typeof config.overrides === "object" ? config.overrides : {};

  // A Map keeps insertion order and makes "same id replaces" automatic.
  /** @type {Map<string, Member>} */
  const members = new Map();

  // Steps 1–3: community members, minus excluded, plus overrides.
  for (const raw of remoteMembers) {
    const member = toMember(raw, remoteBase);

    if (member === null) {
      console.warn("<community-badges>: skipping an invalid entry in the data:", raw);
      continue;
    }
    if (excludedIds.has(member.id)) {
      continue;
    }

    // Object.hasOwn: only accept overrides the embedder really wrote, never
    // inherited properties like "constructor".
    const override = Object.hasOwn(overrides, member.id) ? overrides[member.id] : null;
    members.set(member.id, override ? applyOverride(member, override, embedderBase) : member);
  }

  // Step 4: the embedder's own extras.
  for (const raw of toArray(config.extra)) {
    const member = toMember(raw, embedderBase);

    if (member === null) {
      console.warn("<community-badges>: skipping an invalid entry in config.extra:", raw);
      continue;
    }
    members.set(member.id, member);
  }

  return [...members.values()];
}

/**
 * Returns a copy of `member` with the fields from `override` applied.
 * Anything missing or invalid in the override keeps its original value, so
 * overriding only the `badge` is perfectly fine. The `id` can never change.
 *
 * @param {Member} member
 * @param {Object} override  e.g. { badge: "/my-badge.svg" }
 * @param {string} base      Base for resolving relative URLs in the override.
 * @returns {Member}
 */
function applyOverride(member, override, base) {
  return {
    id: member.id,
    name: typeof override.name === "string" ? override.name : member.name,
    alt: typeof override.alt === "string" ? override.alt : member.alt,
    url: toSafeUrl(override.url, base) ?? member.url,
    badge: toSafeUrl(override.badge, base) ?? member.badge,
  };
}


/* ============================================================================
 * 6. BUILDING THE HTML
 * ========================================================================= */

/**
 * Builds this structure (one <li> per member):
 *
 *   <ul part="list">
 *     <li part="item member-alice">
 *       <a part="link" href="https://alice.example/" title="Alice">
 *         <img part="badge" src="…" alt="…" width="88" height="31">
 *       </a>
 *     </li>
 *     …
 *   </ul>
 *
 * Everything is created with document.createElement and set via properties.
 * Text is never parsed as HTML, so member data can't inject markup.
 *
 * @param {Member[]} members
 * @returns {HTMLUListElement}
 */
function buildList(members) {
  const list = document.createElement("ul");
  list.setAttribute("part", "list");
  // Safari removes list semantics when `list-style: none` is used. Saying it
  // explicitly keeps the list readable for screen reader users.
  list.setAttribute("role", "list");
  list.setAttribute("aria-label", "Community websites");

  for (const member of members) {
    const item = document.createElement("li");
    // Besides the shared "item" part, every member gets a part of its own so
    // embedders can style individuals. Part names can't contain odd characters,
    // so anything other than letters, digits, "_" and "-" becomes "-".
    const safeId = member.id.replace(/[^\w-]/g, "-");
    item.setAttribute("part", `item member-${safeId}`);

    const link = document.createElement("a");
    link.setAttribute("part", "link");
    link.href = member.url;
    link.title = member.name;

    const image = document.createElement("img");
    image.setAttribute("part", "badge");
    image.src = member.badge;
    image.alt = member.alt;
    image.width = BADGE_WIDTH; // reserves space so the page doesn't jump
    image.height = BADGE_HEIGHT;
    image.loading = "lazy"; // don't fetch images far below the fold early
    image.decoding = "async";

    link.append(image);
    item.append(link);
    list.append(item);
  }

  return list;
}


/* ============================================================================
 * 7. THE WEB COMPONENT
 *
 * A custom element is a class the browser instantiates whenever it meets the
 * matching tag. The browser calls the methods named ...Callback at the
 * appropriate moments.
 * ========================================================================= */

class CommunityBadges extends HTMLElement {
  // Tells the browser: "call attributeChangedCallback when `src` changes."
  static observedAttributes = ["src"];

  // `#name` fields are truly private: nothing outside this class can touch them.

  /** The embedder's customizations, as last assigned to `element.config`. */
  #config = {};

  /**
   * Counts how many times we started rendering. Rendering involves waiting for
   * the network. If something changes while we wait (new config, new `src`),
   * a newer render starts, and the older one notices its number is outdated
   * and quietly gives up. "Latest render wins."
   */
  #latestRender = 0;

  /** The hidden DOM tree where our content lives, plus our stylesheet. */
  #shadow = this.attachShadow({ mode: "open" });
  #styleElement = Object.assign(document.createElement("style"), {
    textContent: STYLES,
  });

  /* -------- the public `config` property -------- */

  get config() {
    return this.#config;
  }

  set config(value) {
    this.#config = value && typeof value === "object" ? value : {};
    if (this.isConnected) {
      this.#render();
    }
  }

  /* -------- lifecycle: called by the browser -------- */

  /** The element was added to the page. */
  connectedCallback() {
    // A subtle situation: if someone writes `element.config = {...}` BEFORE this
    // script has finished loading, the browser doesn't know about our `config`
    // setter yet and simply stores the value on the element as a plain field.
    // That plain field would then hide our setter forever. So: if there is such
    // a field, pick up its value, remove it, and let our setter take over.
    if (Object.hasOwn(this, "config")) {
      const earlyValue = this.config;
      delete this.config;
      this.#config = earlyValue && typeof earlyValue === "object" ? earlyValue : {};
    }

    this.#render();
  }

  /** The element was removed from the page. */
  disconnectedCallback() {
    // Invalidate any render still waiting for the network.
    this.#latestRender++;
  }

  /** The `src` attribute changed. */
  attributeChangedCallback(_name, oldValue, newValue) {
    // This also fires while the element is first being created; in that case
    // connectedCallback does the first render, so we skip it here.
    if (this.isConnected && oldValue !== newValue) {
      this.#render();
    }
  }

  /* -------- rendering -------- */

  async #render() {
    const thisRender = ++this.#latestRender;
    const isOutdated = () => thisRender !== this.#latestRender;

    this.dataset.state = "loading";
    this.setAttribute("aria-busy", "true");

    try {
      // Which JSON file? The `src` attribute if given, else the default.
      const dataUrl = new URL(this.getAttribute("src") ?? DEFAULT_DATA_URL, document.baseURI).href;

      const remoteMembers = await fetchMembers(dataUrl);
      if (isOutdated()) return;

      const members = buildMemberList(remoteMembers, dataUrl, this.#config);
      this.#shadow.replaceChildren(this.#styleElement, buildList(members));
      this.dataset.state = "ready";
    } catch (error) {
      if (isOutdated()) return;

      console.warn("<community-badges>: could not load the badges.", error);

      // Show whatever the embedder wrote between the tags, if anything.
      // A <slot> is the spot where an element's own children appear.
      this.#shadow.replaceChildren(this.#styleElement, document.createElement("slot"));
      this.dataset.state = "error";
    }

    if (!isOutdated()) {
      this.removeAttribute("aria-busy");
    }
  }
}


/* ============================================================================
 * 8. REGISTRATION
 *
 * This is the line that teaches the browser what <community-badges> means.
 * The check makes it safe if this script ends up loaded twice on a page.
 * ========================================================================= */

if (!customElements.get("community-badges")) {
  customElements.define("community-badges", CommunityBadges);
}