// # Filename: src/components/LayoutSwitch.tsx

import { GalleryHorizontalEnd, Rows3 } from "lucide-react";
import { setLayout, useHomeLayout, type HomeLayout } from "../hooks/useHomeLayout";

const options: { layout: HomeLayout; label: string; icon: React.ReactNode }[] = [
  { layout: "story", label: "Story layout", icon: <GalleryHorizontalEnd size={15} /> },
  { layout: "classic", label: "Classic layout", icon: <Rows3 size={15} /> },
];

const buttonBase =
  "inline-flex h-9 w-9 items-center justify-center border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-neutral-50";
const activeClass =
  "border-neutral-950 bg-neutral-950 text-white dark:border-neutral-50 dark:bg-neutral-50 dark:text-neutral-950";
const idleClass =
  "border-neutral-300 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-50 dark:hover:text-neutral-50";

export function LayoutSwitch() {
  const layout = useHomeLayout();

  return (
    <div role="group" aria-label="Page layout" className="flex items-center gap-2">
      {options.map((option) => (
        <button
          key={option.layout}
          type="button"
          onClick={() => setLayout(option.layout)}
          className={`${buttonBase} ${layout === option.layout ? activeClass : idleClass}`}
          aria-pressed={layout === option.layout}
          aria-label={`Use the ${option.label.toLowerCase()}`}
          title={option.label}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
