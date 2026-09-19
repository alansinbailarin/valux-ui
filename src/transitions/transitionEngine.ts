"use client";

import { prefersReducedMotion } from "../morph/reducedMotion";

type DocumentWithVT = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => {
    finished: Promise<void>;
  };
};

/** The in-flight navigation: <ViewTransitions /> resolves it when the new
 * route commits, letting the browser snapshot the finished page. */
export const pendingNavigation: { resolve: (() => void) | null } = {
  resolve: null,
};

/** Runs `update` inside a browser View Transition. The extension point of
 * the whole system: `preset` lands on <html data-vx-transition="...">
 * for the transition's lifetime, so CSS decides the choreography — new
 * presets are pure CSS, no new JS. Falls back to a plain update when the
 * API is missing (Firefox) or motion is reduced. */
export function runViewTransition(
  update: () => Promise<void> | void,
  preset?: string,
): void {
  const doc = document as DocumentWithVT;
  if (!doc.startViewTransition || prefersReducedMotion()) {
    void update();
    return;
  }
  if (preset) document.documentElement.setAttribute("data-vx-transition", preset);
  const transition = doc.startViewTransition(async () => {
    await update();
  });
  void transition.finished.finally(() => {
    document.documentElement.removeAttribute("data-vx-transition");
  });
}
