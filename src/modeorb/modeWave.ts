/* The wave itself: geometry, clocks, and the release gate. ModeOrb decides
   the moment and the origin; everything below is how the front travels.

   Everything here is LITERAL WAAPI, not the CSS keyframes: keyframes that
   read var(--vx-wave-*) resolve on the main thread every frame, so the wave
   ran there and dropped frames whenever the page was busy (devtools replay
   at 100% stuttered identically — the main-thread tell). Literal values are
   compositor-adoptable: the wave keeps its clock even when the main thread
   chokes. */

const WAVE_MS = 850;
/* In-out sine, not ease-out: filmed frame by frame, ease-out spent the whole
   journey in the first quarter — 85% of the screen covered by t=200ms, then
   half a second closing corner slivers. A wave should CROSS, visibly, for
   most of its duration. */
const WAVE_EASE = "cubic-bezier(0.37, 0, 0.63, 1)";
/** The crest element's radius in CSS px (half its width); the scale
 * animation turns it into the wavefront's actual radius. */
const CREST_R = 100;

/**
 * Arms the wave paused at radius zero and releases it when the pipeline is
 * demonstrably presenting frames. Throws if the engine cannot animate
 * view-transition pseudos — the caller falls back to the CSS keyframes.
 *
 * Paused-at-zero arming (inside ready's microtask) means the new snapshot is
 * held invisible from the pseudo-tree's very first frame: no CSS-matching
 * race can flash the full new theme. The opacity [1,1] pair rides along to
 * override the armed opacity:0 (mode-orb.css) while the wave plays.
 *
 * The opening is scrubbed rather than released on a timer — see the long
 * comment at the gate below for why every simpler gate was fooled by the
 * first, cold flip of a session.
 */
export function launchWave(
  root: HTMLElement,
  crest: HTMLElement | null,
  x: number,
  y: number,
  radius: number,
): void {
  const wave = root.animate(
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${radius}px at ${x}px ${y}px)`,
      ],
      opacity: [1, 1],
    },
    {
      duration: WAVE_MS,
      easing: WAVE_EASE,
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    },
  );
  wave.pause();
  const anims = [wave];

  // The crest: same clock, same single-segment curve, so its rim IS the
  // front. Transform and opacity are SEPARATE animations on purpose — a
  // middle keyframe re-applies the easing per segment, which would bend the
  // scale off the clip's curve and float the foam away from the edge.
  if (crest) {
    crest.style.left = `${x}px`;
    crest.style.top = `${y}px`;
    anims.push(
      crest.animate(
        {
          transform: [
            "translate(-50%, -50%) scale(0)",
            `translate(-50%, -50%) scale(${radius / CREST_R})`,
          ],
        },
        { duration: WAVE_MS, easing: WAVE_EASE },
      ),
      // Foam dying on the sand: gone before the corners resolve.
      crest.animate(
        { opacity: [0.9, 0.55, 0], offset: [0, 0.72, 1] },
        { duration: WAVE_MS, easing: "linear" },
      ),
    );
    for (const animation of anims) animation.pause();
  }

  // The wave is driven by PRODUCED FRAMES for its whole life — it is never
  // handed to the compositor clock. Every release strategy tried before
  // this was defeated by the same enemy: the first flip of a session owes
  // a cold bill (style, raster, first-use GPU work) that lands hundreds of
  // ms AFTER any warm-looking opening. Headed telemetry on real GPU caught
  // it red-handed: released at ct=44ms after three tight rAF gaps, then a
  // 500ms main-thread stall with zero presented frames while the clock ran
  // — next visible frame at ct=544ms, radius 1140px: "starts at the
  // trigger, then comes from the centre", the reported bug, verbatim.
  //
  // Scrubbing caps the advance at one frame's worth per produced frame, so
  // a stall HOLDS the front (nothing is being presented anyway) instead of
  // teleporting it. On a warm 60fps machine the writes land every 16ms and
  // the wave is indistinguishable from clock-driven.
  //
  // The explicit finish() matters: these animations stay paused forever,
  // and a paused animation never finishes — without it, transition.finished
  // never resolves, the pseudo tree never tears down, and the page is left
  // permanently inside the view transition.
  if (root.dataset.vxScrub === "off") {
    // Instrumentation escape hatch: filmstrip tooling freezes and seeks the
    // animations itself, and the scrub loop would overwrite its seeks.
    for (const animation of anims) animation.play();
    return;
  }
  let previous = performance.now();
  let scrubbed = 0;
  const advance = (now: number) => {
    if (anims[0].playState === "idle") return; // transition was skipped
    scrubbed += Math.min(now - previous, 34);
    previous = now;
    if (scrubbed >= WAVE_MS) {
      for (const animation of anims) animation.finish();
      return;
    }
    for (const animation of anims) animation.currentTime = scrubbed;
    requestAnimationFrame(advance);
  };
  requestAnimationFrame(advance);
}
