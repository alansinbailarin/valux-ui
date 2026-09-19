import { prefersReducedMotion } from "../morph/reducedMotion";

const SNAP_EASE = "cubic-bezier(0.32, 0.72, 0.28, 1)";
const TOP_GAP = 24; // px left above a fully expanded sheet

export interface ExpandController {
  readonly current: number;
  progress(): number;
  heightNow(): number;
  track(h: number): void;
  settle(expand?: boolean): void;
  /** A deliberate re-grab picks up from the live height mid-settle. */
  resume(): void;
  dispose(): void;
}

/** Owns the sheet's height detents: continuous tracking, spring settles,
 * and the settle-in-flight animation state. */
export function createExpandController(panel: HTMLElement): ExpandController {
  const base = panel.getBoundingClientRect().height; // natural detent
  const max = () => window.innerHeight - TOP_GAP;
  let current = -1;
  let settleAnim: Animation | null = null;

  const track = (h: number) => {
    current = Math.min(max(), Math.max(base, h));
    panel.style.height = `${current}px`;
  };
  const progress = () => (current - base) / Math.max(1, max() - base);
  const heightNow = () => {
    if (current >= 0) return current;
    return panel.hasAttribute("data-vx-expanded") ? max() : base;
  };
  const settle = (expand = progress() > 0.5) => {
    if (current < 0) return;
    const from = current;
    const target = expand ? max() : base;
    current = -1;
    const done = () => {
      panel.toggleAttribute("data-vx-expanded", expand);
      panel.style.height = "";
    };
    if (prefersReducedMotion() || typeof panel.animate !== "function") return done();
    const anim = panel.animate(
      [{ height: `${from}px` }, { height: `${target}px` }],
      { duration: 280, easing: SNAP_EASE, fill: "forwards" },
    );
    settleAnim = anim;
    anim.onfinish = () => {
      anim.cancel();
      settleAnim = null;
      done();
    };
  };
  const resume = () => {
    if (!settleAnim) return;
    const live = panel.getBoundingClientRect().height;
    settleAnim.cancel();
    settleAnim = null;
    track(live);
  };

  return {
    get current() {
      return current;
    },
    progress,
    heightNow,
    track,
    settle,
    resume,
    dispose: () => settleAnim?.cancel(),
  };
}
