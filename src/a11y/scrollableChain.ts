/** Gesture guards must respect the REAL scroll container (e.g. Dialog.Body),
 * not just the panel: walk from the event target up to the root, asking
 * whether anything can still scroll in the gesture's direction. */
export function canScrollUp(target: EventTarget | null, root: HTMLElement): boolean {
  let el = target instanceof Element ? target : null;
  while (el) {
    if (el.scrollTop > 0) return true;
    if (el === root) break;
    el = el.parentElement;
  }
  return false;
}

export function canScrollDown(target: EventTarget | null, root: HTMLElement): boolean {
  let el = target instanceof Element ? target : null;
  while (el) {
    if (el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
    if (el === root) break;
    el = el.parentElement;
  }
  return false;
}
