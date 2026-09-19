import { CLOSE_HOLD } from "./morphKeyframes";
import type { MorphPreset } from "./morphKeyframes";
import { planMorph } from "./morphPlan";
import { swallowInertia } from "../a11y/swallowInertia";

const TRAVEL_PX = 260; // gesture distance driving the scrub window
const COMMIT_AT = 0.45; // short of it: rewind to open; past it: close NOW
const SCRUB_WINDOW = 0.5; // scrub through the first half of the close morph

export interface ScrubController {
  readonly committed: boolean;
  active(): boolean;
  apply(offset: number): void;
  settle(offset: number): void;
  dispose(): void;
}

/** Owns one scrubbed close: seeks the paused close morph with the gesture,
 * commits or rewinds on settle, and self-heals — a watchdog settles a scrub
 * whose event stream died, and a failsafe force-closes if the commit's
 * animation never reports back (both left the panel frozen mid-flight). */
export function createScrubController(
  panel: HTMLElement,
  trigger: HTMLElement,
  preset: MorphPreset | undefined,
  onDismiss: () => void,
): ScrubController {
  let scrub: Animation | null = null;
  let committed = false;
  let lastActivity = Date.now();
  let lastOffset = 0;
  let watchdog: ReturnType<typeof setInterval> | undefined;
  let failsafe: ReturnType<typeof setTimeout> | undefined;
  const scrim = () =>
    panel.parentElement?.querySelector<HTMLElement>("[data-vx-dialog-scrim]");
  const duration = () => Number(scrub?.effect?.getTiming().duration ?? 0);

  const finishClose = () => {
    clearTimeout(failsafe);
    panel.setAttribute("data-vx-skip-morph", "");
    panel.style.opacity = "0"; // no flash through the instant closing phase
    onDismiss();
  };

  const controller: ScrubController = {
    get committed() {
      return committed;
    },
    active: () => scrub !== null,
    apply(offset: number) {
      if (committed) return;
      if (!scrub) {
        const plan = planMorph(panel, trigger, "close", preset);
        scrub = panel.animate(plan.keyframes, { duration: plan.duration, fill: "forwards" });
        scrub.pause();
        clearInterval(watchdog);
        watchdog = setInterval(() => {
          if (scrub && !committed && Date.now() - lastActivity > 500) {
            controller.settle(lastOffset); // event stream died mid-gesture
          }
          if (!scrub) clearInterval(watchdog);
        }, 250);
      }
      lastActivity = Date.now();
      lastOffset = offset;
      const progress = Math.min(1, offset / TRAVEL_PX);
      // Skip the close's opening hold — that beat exists so the panel's
      // CONTENT can cascade out, which a scrub never plays (the phase is
      // still "open" under the finger). Dragging through it would just feel
      // like the first quarter of the gesture did nothing.
      scrub.currentTime =
        (CLOSE_HOLD + progress * (SCRUB_WINDOW - CLOSE_HOLD)) * duration();
      const scrimEl = scrim();
      if (scrimEl) scrimEl.style.opacity = `${1 - progress * 0.9}`;
    },
    settle(offset: number) {
      const current = scrub;
      if (!current || committed) return;
      scrub = null;
      clearInterval(watchdog);
      if (offset / TRAVEL_PX >= COMMIT_AT) {
        committed = true;
        swallowInertia(); // outlives the hook: eats trailing inertia
        // Reveal the trigger NOW — waiting for React's phase flip left a blank beat
        trigger.removeAttribute("data-vx-morph-origin");
        current.play();
        current.onfinish = finishClose;
        failsafe = setTimeout(finishClose, 1200); // onfinish never fired -> force
      } else {
        scrim()?.style.removeProperty("opacity");
        current.playbackRate = -1.6; // rewind to fully open, then release
        current.play();
        current.onfinish = () => current.cancel();
      }
    },
    dispose() {
      clearInterval(watchdog);
      clearTimeout(failsafe);
      scrub?.cancel();
      scrub = null;
    },
  };
  return controller;
}

export { COMMIT_AT, TRAVEL_PX };
