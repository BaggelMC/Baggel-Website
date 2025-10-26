import React, { useEffect, useState, useRef } from "react";

interface SelectorBarProps {
  currentLang?: string;
  currentVersion?: string;
  availableLangs?: string[];
  availableVersions?: string[];
  showLang?: boolean;
  showVersion?: boolean;
  path?: string;
}

export default function SelectorBar({
  currentLang: propLang,
  currentVersion: propVersion,
  availableLangs = ["en", "de"],
  availableVersions = ["1.1.0"],
  showLang = true,
  showVersion = true,
  path: propPath,
}: SelectorBarProps) {
  const [currentLang, setLang] = useState(propLang ?? "en");
  const [currentVersion, setVersion] = useState(propVersion ?? undefined);
  const [path, setPath] = useState(propPath ?? "");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const langNames: Record<string, string> = {
    en: "English",
    de: "Deutsch",
  };

  // Auto-detect language, version, and path
  useEffect(() => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/").filter(Boolean);

    const detectedLang = parts[1];
    const detectedVersionIndex = parts.findIndex((p) => p === "docs") + 1;
    const detectedVersion =
      detectedVersionIndex > 0 ? parts[detectedVersionIndex] : undefined;

    const remainingPath = parts.slice(2).join("/");

    if (!propLang) setLang(detectedLang);
    if (!propVersion && detectedVersion) setVersion(detectedVersion);
    if (!propPath) setPath(remainingPath);

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function buildUrl(lang: string, version?: string) {
    const base = `/plugins/${lang}/${path}`;
    return version
      ? base.replace(/docs\/[^/]+\//, `docs/${version}/`)
      : base;
  }

  function safeRedirect(lang: string, version?: string) {
    window.location.assign(buildUrl(lang, version));
  }

  const buttonClass =
    "flex items-center gap-1 px-4 py-2 rounded-2xl bg-background border border-text/20 text-text font-medium hover:text-accent transition";

  const menuClass =
    "absolute mt-2 z-50 rounded-2xl p-px bg-linear-to-br from-background via-background-50 to-background shadow-lg transition-all duration-200";

  const innerMenuClass =
    "bg-background rounded-[inherit] overflow-hidden divide-y divide-background-50";

  return (
    <div ref={menuRef} className="flex flex-wrap gap-4 items-center justify-end relative">
      {showLang && (
        <div className="relative dropdown">
          <button
            className={buttonClass}
            onClick={() => setOpenMenu(openMenu === "lang" ? null : "lang")}
          >
            {langNames[currentLang] ?? currentLang.toUpperCase()}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${
                openMenu === "lang" ? "rotate-180 text-accent" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openMenu === "lang" && (
            <div className={menuClass}>
              <div className={innerMenuClass}>
                {availableLangs.map((lang) => (
                  <button
                    key={lang}
                    className={`block w-full text-left px-4 py-2 hover:bg-accent-light hover:text-accent transition ${
                      lang === currentLang ? "text-accent font-semibold" : ""
                    }`}
                    onClick={() => safeRedirect(lang, currentVersion)}
                  >
                    {langNames[lang] ?? lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showVersion && (
        <div className="relative dropdown">
          <button
            className={buttonClass}
            onClick={() => setOpenMenu(openMenu === "version" ? null : "version")}
          >
            {currentVersion ? `v${currentVersion}` : "Version"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${
                openMenu === "version" ? "rotate-180 text-accent" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openMenu === "version" && (
            <div className={menuClass}>
              <div className={innerMenuClass}>
                {availableVersions.map((v) => (
                  <button
                    key={v}
                    className={`block w-full text-left px-4 py-2 hover:bg-accent-light hover:text-accent transition ${
                      v === currentVersion ? "text-accent font-semibold" : ""
                    }`}
                    onClick={() => safeRedirect(currentLang, v)}
                  >
                    v{v}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
