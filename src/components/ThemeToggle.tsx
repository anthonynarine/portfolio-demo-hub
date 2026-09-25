
// # Filename: src/components/ThemeToggle.tsx

import { useEffect, useRef, useState } from "react";
import { Check, Cloud, CloudLightning, CloudRain, Menu, Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "cloudy" | "dark" | "rainy" | "thunderstorm";

const atmosphereModes: ThemeMode[] = ["cloudy", "rainy", "thunderstorm"];
const baseModes: ThemeMode[] = ["light", "dark"];

function setHtmlTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("cloudy", "dark", "rainy", "thunderstorm");
  if (mode !== "light") root.classList.add(mode);
}

function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem("theme") as ThemeMode | null;
  if (
    saved === "light" ||
    saved === "cloudy" ||
    saved === "dark" ||
    saved === "rainy" ||
    saved === "thunderstorm"
  ) {
    return saved;
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function getThemeIcon(mode: ThemeMode) {
  if (mode === "cloudy") return <Cloud size={15} />;
  if (mode === "dark") return <Moon size={15} />;
  if (mode === "rainy") return <CloudRain size={15} />;
  if (mode === "thunderstorm") return <CloudLightning size={15} />;
  return <Sun size={15} />;
}

function getThemeLabel(mode: ThemeMode) {
  return mode[0].toUpperCase() + mode.slice(1);
}

function getVisibleLabel(mode: ThemeMode) {
  return mode === "thunderstorm" ? "Storm" : getThemeLabel(mode);
}

const iconButtonBase =
  "inline-flex h-9 w-9 items-center justify-center border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-neutral-50";
const activeClass =
  "border-neutral-950 bg-neutral-950 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950";
const idleClass =
  "border-neutral-300 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-50 dark:hover:text-neutral-50";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialTheme());
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setHtmlTheme(mode);
  }, [mode]);

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function chooseTheme(next: ThemeMode) {
    setMode(next);
    setHtmlTheme(next);
    localStorage.setItem("theme", next);
    setMenuOpen(false);
  }

  const atmosphereActive = atmosphereModes.includes(mode);

  return (
    <div className="flex items-center gap-2">
      {baseModes.map((themeMode) => (
        <button
          key={themeMode}
          type="button"
          onClick={() => chooseTheme(themeMode)}
          className={`${iconButtonBase} ${mode === themeMode ? activeClass : idleClass}`}
          aria-pressed={mode === themeMode}
          aria-label={`Use ${getThemeLabel(themeMode)} mode`}
          title={`${getThemeLabel(themeMode)} mode`}
        >
          {getThemeIcon(themeMode)}
        </button>
      ))}

      <div ref={menuRef} className="relative">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className={`${iconButtonBase} ${atmosphereActive ? activeClass : idleClass}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={
            atmosphereActive ? `More modes (${getVisibleLabel(mode)} active)` : "More modes"
          }
          title="More modes"
        >
          <Menu size={15} />

        </button>

        {menuOpen ? (
          <div
            role="menu"
            aria-label="Atmosphere modes"
            className="absolute right-0 top-full z-40 mt-2 min-w-40 border border-neutral-300 bg-[#FAFAF8] py-1 shadow-lg cloudy:bg-[#E4E8EB] dark:border-neutral-700 dark:bg-neutral-900 rainy:bg-[#16191C] thunderstorm:bg-[#353C45]"
          >
            {atmosphereModes.map((themeMode) => {
              const isActive = mode === themeMode;
              return (
                <button
                  key={themeMode}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => chooseTheme(themeMode)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] transition hover:bg-neutral-950/5 dark:hover:bg-white/10 ${
                    isActive
                      ? "text-neutral-950 dark:text-neutral-50"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {getThemeIcon(themeMode)}
                  <span className="flex-1">{getVisibleLabel(themeMode)}</span>
                  {isActive ? <Check size={13} /> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
