"use client";

import { useCallback, useRef } from "react";
import type { CSSProperties, MouseEvent } from "react";

import { launchWave } from "./modeWave";

type Mode = "dark" | "light";

const STORAGE_KEY = "vx-mode";

/** What the page is actually showing right now: the explicit choice if one
 * was made, the OS preference otherwise. Read at click time, not held in
 * state — the OS can flip underneath us between clicks. */
function effectiveMode(): Mode {
  const set = document.documentElement.dataset.vxMode;
  if (set === "dark" || set === "light") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

type DocumentWithVT = Document & {
  startViewTransition?: (update: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

/** The color-mode switch: a fixed orb that flips dark/light as a wave
 * washing out of it across the page — the new theme revealed through a
 * growing circle, with a crest of foam riding the front line (modeWave.ts
 * owns the choreography; this component owns the moment and the origin).
 *
 * Deliberately does NOT go through the kit's runViewTransition: that engine
 * resolves against a route change, and a theme flip navigates nowhere. */
export function ModeOrb({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const crestRef = useRef<HTMLSpanElement>(null);

  const toggle = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const next: Mode = effectiveMode() === "dark" ? "light" : "dark";
    const apply = () => {
      root.dataset.vxMode = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage may be unavailable (private mode); the flip still works */
      }
    };

    const doc = document as DocumentWithVT;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || typeof doc.startViewTransition !== "function") {
      // No wave: the honest reduced-motion (and no-support) path is an
      // instant flip, not a slower disguise of the same sweep.
      apply();
      return;
    }

    // The wave radiates from the orb itself, so its origin is the button's
    // centre, and it must reach the farthest viewport corner to finish.
    const orb = event.currentTarget.getBoundingClientRect();
    const x = Math.round(orb.left + orb.width / 2);
    const y = Math.round(orb.top + orb.height / 2);
    const radius = Math.ceil(
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      ),
    );
    root.style.setProperty("--vx-wave-x", `${x}px`);
    root.style.setProperty("--vx-wave-y", `${y}px`);
    root.style.setProperty("--vx-wave-r", `${radius}px`);

    // Scopes the wave CSS to THIS transition: without the flag, any future
    // view transition (page navigation) would inherit the theme wipe. The
    // bare value ARMS the wave — new snapshot held invisible at radius 0
    // (mode-orb.css) — and launchWave releases it once frames flow again.
    root.dataset.vxWave = "";
    const transition = doc.startViewTransition(apply);
    transition.ready
      .then(() => {
        try {
          launchWave(root, crestRef.current, x, y, radius);
        } catch {
          // Engine without WAAPI-on-VT-pseudos: the CSS keyframes still
          // play the same wave (crestless), just without the compositor
          // guarantee.
          root.dataset.vxWave = "go";
        }
      })
      .catch(() => {
        /* transition skipped: the flip already applied, cleanup below runs */
      });
    transition.finished.finally(() => {
      delete root.dataset.vxWave;
    });
  }, []);

  return (
    <>
      <button
        type="button"
        className={["vx-mode-orb", className].filter(Boolean).join(" ")}
        style={style}
        aria-label="Toggle color mode"
        onClick={toggle}
      />
      <span ref={crestRef} className="vx-wave-crest" aria-hidden="true" />
    </>
  );
}
