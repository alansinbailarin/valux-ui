import { buildGhostReturnKeyframes, MENU_PRESET } from "./morphKeyframes";
import type { MenuMorphDirection, MorphPreset } from "./morphKeyframes";
import { planMorph } from "./morphPlan";
import { prefersReducedMotion } from "./reducedMotion";

export interface RunMorphOptions {
  panel: HTMLElement;
  trigger: HTMLElement | null;
  /** Counter-scaled clone of the trigger content, shown while closing. */
  ghost?: HTMLElement | null;
  direction: MenuMorphDirection;
  preset?: MorphPreset;
  onFinish: () => void;
}

export function runMorph({
  panel,
  trigger,
  ghost,
  direction,
  preset = MENU_PRESET,
  onFinish,
}: RunMorphOptions): void {
  if (
    prefersReducedMotion() ||
    typeof panel.animate !== "function" ||
    // A gesture (pull/scrub dismiss) already played the exit.
    panel.hasAttribute("data-vx-skip-morph")
  ) {
    onFinish();
    return;
  }

  // Detached (no trigger): nothing to morph toward — a quick scale-fade out
  // instead (the entrance is CSS-driven on insertion).
  if (!trigger) {
    if (direction === "close") {
      const fade = panel.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(0.96)" },
        ],
        { duration: 160, easing: "ease-in", fill: "forwards" },
      );
      fade.onfinish = onFinish;
    } else {
      onFinish();
    }
    return;
  }

  // Reset any in-flight morph so the panel reports its natural content size
  // (StrictMode double-invoke and rapid open/close both re-enter here).
  if (typeof panel.getAnimations === "function") {
    for (const animation of panel.getAnimations()) animation.cancel();
  }

  const plan = planMorph(panel, trigger, direction, preset);
  const animation = panel.animate(plan.keyframes, {
    duration: plan.duration,
    fill: "forwards",
  });

  if (direction === "close" && ghost) {
    if (typeof ghost.getAnimations === "function") {
      for (const inFlight of ghost.getAnimations()) inFlight.cancel();
    }
    ghost.animate(buildGhostReturnKeyframes(plan.bx, plan.by, preset), {
      duration: plan.duration,
      fill: "forwards",
    });
  }

  animation.onfinish = () => {
    if (direction === "open") {
      // The settled state matches the panel's plain CSS, so drop the fill:
      // a lingering `filter: blur(0px)` would make the panel its own
      // backdrop root and disable the glass backdrop-filter at rest.
      // (The close fill must stay — the panel unmounts right after.)
      animation.cancel();
    }
    onFinish();
  };
}
