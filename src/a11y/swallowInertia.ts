/** After a gesture commits a close, macOS trackpads keep streaming decaying
 * wheel events (inertia). The surface that owned the gesture unmounts, so
 * this standalone guard keeps swallowing wheel events at the document level
 * until the stream goes quiet — otherwise the tail scrolls (visibly nudges)
 * the page the instant the panel disappears. */
export function swallowInertia(quietMs = 160, maxMs = 1500): void {
  if (typeof document === "undefined") return;

  let quietTimer: ReturnType<typeof setTimeout>;
  const stop = () => {
    clearTimeout(quietTimer);
    clearTimeout(hardStop);
    document.removeEventListener("wheel", onWheel, { capture: true });
  };
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(quietTimer);
    quietTimer = setTimeout(stop, quietMs);
  };

  document.addEventListener("wheel", onWheel, { capture: true, passive: false });
  quietTimer = setTimeout(stop, quietMs);
  const hardStop = setTimeout(stop, maxMs);
}
