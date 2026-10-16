// # Filename: src/components/story/journeyPath.ts

/**
 * Geometry for the single line that runs through the horizontal story.
 *
 * Every position is written as a fraction of one panel: x in panel widths
 * (1.5 = halfway through the second panel), y in viewport heights. The
 * builders turn those into pixels so nothing is stretched by the viewport's
 * aspect ratio, and the panel copy in StoryScroller is positioned with the
 * same fractions so the text sits beside the line rather than on top of it.
 */

type Point = [number, number];

export const PANEL_COUNT = 6;

/** Straight segment the timeline ticks hang off (panel 4). */
export const TIMELINE = { x0: 4.05, y0: 0.66, x1: 4.95, y1: 0.4 } as const;

/** Where the timeline zigzags, as fractions across panel 4: the 2013 and 2022 (bootcamp) ticks. */
export const ZIGZAG_SPAN = [0.38, 0.58] as const;

/** y (in viewport heights) of the timeline at a fraction `f` across panel 4. */
export function timelineY(f: number) {
  const x = 4 + f;
  const t = (x - TIMELINE.x0) / (TIMELINE.x1 - TIMELINE.x0);
  return TIMELINE.y0 + (TIMELINE.y1 - TIMELINE.y0) * t;
}

/** Deterministic PRNG so the scribble is the same on every load. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Catmull-Rom spline through the points, emitted as cubic Béziers. */
function smoothPath(points: Point[]) {
  if (points.length < 2) return "";
  const p = [points[0], ...points, points[points.length - 1]];
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const [x2, y2] = p[i + 1];
    const [x3, y3] = p[i + 2];
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return d;
}

/** Points that wander around a centre in loose loops, like a pen that won't lift. */
function tanglePoints(cx: number, cy: number, rx: number, ry: number, count: number, seed: number) {
  const rand = mulberry32(seed);
  const points: Point[] = [];
  let angle = Math.PI;
  for (let i = 0; i < count; i++) {
    // Big, uneven angle steps make the strokes cross back over the middle
    // instead of orbiting it; the small offset keeps loops from sharing a centre.
    angle += 1.1 + rand() * 2.6;
    const r = 0.18 + rand() * 0.82;
    const drift = (rand() - 0.5) * 0.35;
    points.push([cx + (Math.cos(angle) * r + drift) * rx, cy + (Math.sin(angle) * r + drift * 0.6) * ry]);
  }
  return points;
}

/**
 * The scribble on the opening panel, ending exactly where the journey line starts.
 * With `start` (pixels: just after the "Full-stack software engineer" label) the line
 * leaves the label, runs a short way right, then lifts into the scribble; without it,
 * it enters from the left edge.
 */
export function buildTanglePath(w: number, h: number, start?: Point | null) {
  const unit = Math.min(w, h);
  const cx = 0.6 * w;
  const cy = 0.42 * h;
  const tangle = tanglePoints(cx, cy, unit * 0.3, unit * 0.24, 78, 11);
  const lead: Point[] = start
    ? [
        start,
        [start[0] + 0.06 * w, start[1]],
        [Math.max(start[0] + 0.12 * w, 0.4 * w), (start[1] + 0.56 * h) / 2],
        [Math.max(start[0] + 0.16 * w, 0.44 * w), 0.56 * h],
      ]
    : [
        [-0.02 * w, 0.58 * h],
        [0.14 * w, 0.52 * h],
        [0.3 * w, 0.62 * h],
        [0.4 * w, 0.56 * h],
      ];
  return smoothPath([
    ...lead,
    ...tangle,
    [0.86 * w, 0.48 * h],
    [1.0 * w, 0.5 * h],
  ]);
}

/** The line from the end of the scribble, through every chapter, into the closing circle. */
export function buildJourneyPath(w: number, h: number) {
  const at = (x: number, y: number): Point => [x * w, y * h];
  const unit = Math.min(w, h);

  const circle = { cx: 5.5 * w, cy: 0.42 * h, r: unit * 0.13 };
  const ring: Point[] = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const theta = Math.PI + (i / steps) * Math.PI * 2;
    const r = circle.r + Math.sin(theta * 14) * unit * 0.006;
    ring.push([circle.cx + Math.cos(theta) * r, circle.cy + Math.sin(theta) * r]);
  }

  // The whole timeline is emitted as straight segments, not run through the
  // spline, so every tick's dot sits exactly on the line. The 2013 → 2022
  // stretch is a hard zigzag (the restless years before the bootcamp).
  const [zigFrom, zigTo] = ZIGZAG_SPAN;
  const zigStart = at(4 + zigFrom, timelineY(zigFrom));
  const zigEnd = at(4 + zigTo, timelineY(zigTo));
  const teeth = 9;
  const amplitude = unit * 0.045;
  let zigzag = "";
  for (let i = 1; i < teeth; i++) {
    const t = i / teeth;
    const x = zigStart[0] + (zigEnd[0] - zigStart[0]) * t;
    const y = zigStart[1] + (zigEnd[1] - zigStart[1]) * t + (i % 2 ? -amplitude : amplitude);
    zigzag += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  zigzag += ` L ${zigEnd[0].toFixed(1)} ${zigEnd[1].toFixed(1)}`;
  const timelineEnd = at(TIMELINE.x1, TIMELINE.y1);
  const straight = (point: Point) => ` L ${point[0].toFixed(1)} ${point[1].toFixed(1)}`;

  const before = smoothPath([
    at(1.0, 0.5),
    at(1.18, 0.62),
    at(1.35, 0.74),
    at(1.55, 0.66),
    at(1.75, 0.5),
    at(2.0, 0.42),
    at(2.3, 0.38),
    at(2.6, 0.44),
    at(2.85, 0.4),
    at(3.05, 0.44),
    at(3.25, 0.58),
    at(3.5, 0.46),
    at(3.75, 0.6),
    // On the timeline's own slope, so the curve meets the straight part without a kink.
    at(3.95, timelineY(-0.05)),
    at(TIMELINE.x0, TIMELINE.y0),
  ]);

  // Drop the leading "M x y": the second half continues from the end of the timeline.
  const after = smoothPath([timelineEnd, at(5.12, timelineY(1.12)), at(5.25, 0.38), ...ring]).replace(
    /^M [^C]+/,
    " "
  );

  return `${before}${straight(zigStart)}${zigzag}${straight(timelineEnd)}${after}`;
}

/** A fixed-size scribble for the stacked (phone) layout, where there is no journey line. */
export function buildCompactTanglePath() {
  return smoothPath([[0, 330], [120, 300], ...tanglePoints(320, 240, 200, 160, 70, 11), [640, 260]]);
}
