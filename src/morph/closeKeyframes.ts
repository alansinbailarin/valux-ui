import { axis, glassAt, MENU_PRESET, round, tr } from "./morphVocabulary";
import type { MorphColors, MorphPreset, MorphTravel } from "./morphVocabulary";

/** Fraction of the close spent holding the panel at its full size while the
 * content cascades out. Exported so the gesture scrubber can start a drag
 * where the motion starts instead of inside the hold. */
export const CLOSE_HOLD = 0.14;

interface CloseStop {
  offset: number;
  /** Fraction of the height's journey from the panel's size to the trigger's. */
  fy: number;
  /** Same for the width. It lags behind the height — that lag IS the streak. */
  fx: number;
  /** Fraction of the preset's peak blur. */
  blur: number;
  /** Ghost: intended VISUAL size, as a fraction of the trigger content's
   * natural size (the counter-scale is derived from it and the panel's). */
  vx: number;
  vy: number;
  /** Ghost opacity. */
  op: number;
}

/* The close, as one table — read by the panel keyframes AND by the ghost's
   counter-scale, so the two can never drift apart.

   v9 played the close as three separate beats and it read as three: the width
   sat at EXACTLY 1 for the first 41% (all you saw was the height collapsing,
   which the eye reports as "it stretched sideways"), then the height sat
   still for the next 33% while the width caught up, and the body under- then
   overshot the trigger's size at the tail (0.9x -> 1.02x) while the corner
   radius ballooned to ~1000px and came back down. The Menu's panel opens AT
   its trigger, so its morph has NO travel to carry continuity across those
   beats — the two scale axes are the entire performance.

   v10: every stop moves BOTH axes, the width merely lagging, and each axis's
   per-segment speed traces a single bell (accelerate, cruise, settle). The
   segments are deliberately linear: a cubic ease on every one of them is what
   turned each waypoint into a stop. */
const CLOSE_STOPS: readonly CloseStop[] = [
  { offset: 0, fy: 0, fx: 0, blur: 0, vx: 1, vy: 1, op: 0 },
  // The hold: content is leaving, the panel is still the panel.
  { offset: CLOSE_HOLD, fy: 0.045, fx: 0.008, blur: 0.1, vx: 0.99, vy: 0.96, op: 0 },
  // Two stops to leave the hold on. One is a kick — the eye reads the panel
  // as having been shoved rather than as having started moving.
  { offset: 0.24, fy: 0.135, fx: 0.028, blur: 0.34, vx: 0.96, vy: 0.87, op: 0.04 },
  { offset: 0.34, fy: 0.33, fx: 0.085, blur: 0.66, vx: 0.92, vy: 0.77, op: 0.12 },
  { offset: 0.46, fy: 0.64, fx: 0.215, blur: 1, vx: 0.89, vy: 0.7, op: 0.3 },
  // Flattest point of the body, and the fastest — the streak.
  { offset: 0.6, fy: 0.87, fx: 0.45, blur: 0.6, vx: 0.87, vy: 0.66, op: 0.62 },
  { offset: 0.74, fy: 0.96, fx: 0.775, blur: 0.26, vx: 0.9, vy: 0.78, op: 0.92 },
  { offset: 0.82, fy: 0.99, fx: 0.925, blur: 0.09, vx: 0.93, vy: 0.89, op: 1 },
  // Landed at the trigger's exact size, sharp, holding for the crossfade.
  { offset: 0.9, fy: 1, fx: 1, blur: 0, vx: 0.95, vy: 0.95, op: 1 },
  { offset: 1, fy: 1, fx: 1, blur: 0, vx: 0.95, vy: 0.95, op: 1 },
];

/** Stops (from the table above) where the close hands one thing over. The
 * corners are resolved by the streak and never move again — a radius still
 * settling under an arriving body was the "and THEN the corners show up"
 * beat. */
const TRAVEL_TONE_AT = 0.24; // glass off, body goes opaque for the journey
const CORNERS_HOME_AT = 0.46;
const TRIGGER_TONE_AT = 0.74; // the body is already the trigger's color

/** The width's journey at a stop, after `streak` decides how far it may lag
 * behind the height. Shared by the panel and the ghost. */
function closeFx(stop: CloseStop, streak: number): number {
  return stop.fy + (stop.fx - stop.fy) * streak;
}

export interface CloseKeyframeOptions {
  /** Trigger size over panel size, per axis — where both axes are headed. */
  bx: number;
  by: number;
  rect: string;
  land: string;
  blur: number;
  streak: number;
  colors?: MorphColors;
  travel?: MorphTravel;
  glass?: string;
}

export function buildCloseKeyframes({
  bx,
  by,
  rect,
  land,
  blur: BLUR,
  streak,
  colors,
  travel,
  glass,
}: CloseKeyframeOptions): Keyframe[] {
  // The body's color has morphed into the trigger's well before the tail
  // crossfade hands off to the real trigger beneath — seamless even when the
  // two surfaces contrast.
  return CLOSE_STOPS.map((stop) => {
    const fx = closeFx(stop, streak);
    // One shared fraction for the travel keeps the path a straight line; the
    // per-axis scales are what bend the silhouette.
    const home = (fx + stop.fy) / 2;
    const color =
      stop.offset === 0
        ? colors?.panel
        : stop.offset === TRAVEL_TONE_AT
          ? colors?.travel
          : stop.offset === TRIGGER_TONE_AT || stop.offset === 1
            ? colors?.trigger
            : undefined;
    return {
      offset: stop.offset,
      transform: `${tr(travel, home)}scale(${axis(bx, fx)},${axis(by, stop.fy)})`,
      filter: `blur(${round(BLUR * stop.blur)}px)`,
      opacity: stop.offset === 1 ? 0 : 1,
      // Left unset in between so the radius interpolates straight from the
      // panel's rect to the trigger's rounding — no 999px detour.
      ...(stop.offset <= CLOSE_HOLD
        ? { borderRadius: rect }
        : stop.offset >= CORNERS_HOME_AT
          ? { borderRadius: land }
          : {}),
      ...(color && { backgroundColor: color }),
      // The glass rides only the settled end; the body travels opaque.
      ...(stop.offset === 0
        ? glassAt(glass, true)
        : stop.offset === TRAVEL_TONE_AT
          ? glassAt(glass, false)
          : {}),
    };
  });
}

/** Counter-scale keyframes for a ghost of the trigger's content, centered
 * inside the closing panel and scaling about its OWN center. At each stop,
 * panel-scale x ghost-scale equals the stop's `vx`/`vy`: natural at the start,
 * a physical squish through the streak, and a near-natural landing (no bounce)
 * that the real content finishes settling from.
 *
 * It walks the SAME table as the panel, so the pair cannot fall out of sync —
 * hand-mirrored anchors used to let their product drift (stretched text on
 * wide pill triggers). */
export function buildGhostReturnKeyframes(
  bx: number,
  by: number,
  preset: MorphPreset = MENU_PRESET,
): Keyframe[] {
  return CLOSE_STOPS.map((stop) => ({
    offset: stop.offset,
    transform: `scale(${(stop.vx / axis(bx, closeFx(stop, preset.streak))).toFixed(4)},${(
      stop.vy / axis(by, stop.fy)
    ).toFixed(4)})`,
    opacity: stop.op,
  }));
}
