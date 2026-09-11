
// # Filename: src/components/ThemeToggle.tsx

import { useEffect, useState } from "react";
import { Cloud, CloudLightning, CloudRain, Moon, Sun } from "lucide-react";

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

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialTheme());

  useEffect(() => {
    setHtmlTheme(mode);
  }, [mode]);

  function chooseTheme(next: ThemeMode) {
    setMode(next);
    setHtmlTheme(next);
    localStorage.setItem("theme", next);
  }

  function buttonClass(themeMode: ThemeMode) {
    const isActive = mode === themeMode;
    return [
      "inline-flex h-9 items-center justify-center gap-2 border px-3 text-xs font-semibold uppercase tracking-[0.14em] transition",
      isActive
        ? "border-neutral-950 bg-neutral-950 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950"
        : "border-neutral-300 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-50 dark:hover:text-neutral-50",
    ].join(" ");
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2" aria-label="Atmosphere modes">
        {atmosphereModes.map((themeMode) => (
          <button
            key={themeMode}
            type="button"
            onClick={() => chooseTheme(themeMode)}
            className={buttonClass(themeMode)}
            aria-pressed={mode === themeMode}
            aria-label={`Use ${getThemeLabel(themeMode)} mode`}
          >
            {getThemeIcon(themeMode)}
            <span className="hidden sm:inline">{getVisibleLabel(themeMode)}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2" aria-label="Light and dark modes">
        {baseModes.map((themeMode) => (
          <button
            key={themeMode}
            type="button"
            onClick={() => chooseTheme(themeMode)}
            className={buttonClass(themeMode)}
            aria-pressed={mode === themeMode}
            aria-label={`Use ${getThemeLabel(themeMode)} mode`}
          >
            {getThemeIcon(themeMode)}
            <span className="hidden sm:inline">{getThemeLabel(themeMode)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
