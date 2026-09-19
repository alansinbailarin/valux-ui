// The shared vocabulary both morph directions are written in: what a preset
// is, what the body's colors and travel mean, and the handful of helpers that
// turn those into keyframe strings. Split out of morphKeyframes.ts so the
// open and the close can each own a file (and its line budget) without either
// one re-deriving the primitives.

export type MenuMorphDirection = "open" | "close";

/** Personality of the morph: the Menu preset IS today's approved values;
 * larger surfaces (Dialog) travel longer with a softer streak. */
export interface MorphPreset {
  openMs: number;
  closeMs: number;
  /** 0..1 — how far the body stretches into a line. On the way out it is how
   * far the WIDTH is allowed to lag the height (0 = a plain shrink that keeps
   * the panel's aspect, 1 = the full mid-flight bar). */
  streak: number;
  blur: number; // px at peak travel
  /** Grow past the final size before settling. Surfaces that already fill
   * the viewport (size="full") set 0 so content never scales past 1. */
  overshoot?: number;
}

export const MENU_PRESET: MorphPreset = { openMs: 500, closeMs: 460, streak: 1, blur: 10 };
export const DIALOG_PRESET: MorphPreset = { openMs: 540, closeMs: 460, streak: 0.85, blur: 12 };

export interface MorphColors {
  trigger: string;
  /** The surface's settled color (may be translucent glass). */
  panel: string;
  /** Opaque approximation of the settled glass (composited over the page):
   * the body travels OPAQUE — mid-flight translucency without backdrop blur
   * read as a see-through body, and the blur popping in at settle was worse. */
  travel?: string;
}

/** Viewport offset from the panel's resting spot to the trigger, applied in
 * full while compressed and released as the body reaches its own place.
 * Panels that open AT their trigger travel (0,0) — a no-op. */
export interface MorphTravel {
  x: number;
  y: number;
}

export const ROUND = "999px"; // circle/pill end (matches a round trigger)
export const DEFAULT_RECT = "16px"; // settled panel radius fallback

export const round = (n: number): number => Number(n.toFixed(4));

/** translate() prefix for a keyframe that is `f` of the way toward the
 * trigger (1 = fully compressed at the trigger, 0 = settled in place). */
export function tr(travel: MorphTravel | undefined, f: number): string {
  if (!travel || (travel.x === 0 && travel.y === 0) || f === 0) return "";
  return `translate(${round(travel.x * f)}px,${round(travel.y * f)}px) `;
}

/** One axis' scale `f` of the way through its journey from the panel's size
 * to the trigger's. Exact at both ends — `1` before it moves and the ratio
 * itself once landed — so keyframe strings never carry float dust. */
export function axis(b: number, f: number): number {
  if (f === 0) return 1;
  if (f === 1) return b;
  return round(1 + (b - 1) * f);
}

const GLASS_OFF = "blur(0px) saturate(100%)";

/** backdrop-filter keyframe pair (with the -webkit- alias Safari needs). */
export function glassAt(glass: string | undefined, on: boolean) {
  if (!glass) return {};
  const value = on ? glass : GLASS_OFF;
  return { backdropFilter: value, WebkitBackdropFilter: value };
}
