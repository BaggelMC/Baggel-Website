// Hand-written replacement for the loader half of the generated
// /tools/minimessage/translation/index.mjs. The generated per-locale JSON
// files stay exactly where they are in /public — this just fetches them
// over HTTP instead of using ES module import(), since Vite refuses to
// treat anything under /public as an importable module (including the
// index.mjs -> ./data/<locale>.json dynamic imports it does internally).
const DATA_BASE_URL = "/tools/minimessage/translation/data";

class MinecraftTranslationsImpl {
  async get(locale: string): Promise<Record<string, string> | null> {
    try {
      const res = await fetch(`${DATA_BASE_URL}/${locale}.json`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`Could not load translations for "${locale}":`, err);
      return null;
    }
  }
}

const MinecraftTranslations = new MinecraftTranslationsImpl();
export default MinecraftTranslations;