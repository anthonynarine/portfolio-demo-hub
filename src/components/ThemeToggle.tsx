
// # Filename: src/components/ThemeToggle.tsx

import { useEffect, useState } from "react";
import { Cloud, CloudRain, Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "cloudy" | "dark" | "rainy";

function setHtmlTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("cloudy", "dark", "rainy");
  if (mode !== "light") root.classList.add(mode);
}

function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem("theme") as ThemeMode | null;
  if (saved === "light" || saved === "cloudy" || saved === "dark" || saved === "rainy") return saved;

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function getNextTheme(mode: ThemeMode): ThemeMode {
  if (mode === "light") return "cloudy";
  if (mode === "cloudy") return "dark";
  if (mode === "dark") return "rainy";
  return "light";
}

function getThemeIcon(mode: ThemeMode) {
  if (mode === "cloudy") return <Cloud size={15} />;
  if (mode === "dark") return <Moon size={15} />;
  if (mode === "rainy") return <CloudRain size={15} />;
  return <Sun size={15} />;
}

function getThemeLabel(mode: ThemeMode) {
  return mode[0].toUpperCase() + mode.slice(1);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialTheme());

  useEffect(() => {
    setHtmlTheme(mode);
  }, [mode]);

  function toggleTheme() {
    const next = getNextTheme(mode);
    setMode(next);
    setHtmlTheme(next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 border border-neutral-300 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-50 dark:hover:text-neutral-50"
      aria-label={`Toggle theme, current mode ${getThemeLabel(mode)}`}
    >
      <span className="text-neutral-950 dark:text-neutral-50">
        {getThemeIcon(mode)}
      </span>
      <span className="hidden sm:inline">{getThemeLabel(mode)}</span>
    </button>
  );
}
