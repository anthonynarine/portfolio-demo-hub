
// # Filename: src/components/ThemeToggle.tsx

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark";

function setHtmlTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem("theme") as ThemeMode | null;
  if (saved === "light" || saved === "dark") return saved;

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const initial = getInitialTheme();
    setMode(initial);
    setHtmlTheme(initial);
  }, []);

  function toggleTheme() {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    setHtmlTheme(next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 backdrop-blur transition hover:bg-white/10 dark:text-slate-100"
      aria-label="Toggle theme"
    >
      {mode === "dark" ? <Moon size={16} /> : <Sun size={16} />}
      <span className="hidden sm:inline">{mode === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
