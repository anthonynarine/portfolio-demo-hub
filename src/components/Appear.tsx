// # Filename: src/components/Appear.tsx

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Blur-in reveal. Works inside the horizontal story too: IntersectionObserver
 * accounts for transforms and for the sticky panel's overflow clipping, so an
 * item only counts as visible once the track has slid it into view.
 */
export function Appear({
  children,
  className = "",
  delay = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px -6% -6% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`appear ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
