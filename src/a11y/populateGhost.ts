/** Fills the return-ghost with a clone of the trigger's content, carrying the
 * trigger's computed text styles — inside the panel it would otherwise inherit
 * the panel's color (dark-on-light while the trigger's text is white). */
export function populateGhost(
  ghost: HTMLElement,
  trigger: HTMLElement,
): void {
  const content = trigger.querySelector(
    ".vx-menu-trigger__content, .vx-dialog-trigger__content, .vx-popover-trigger__content, .vx-select__content",
  );
  if (!content) return;

  // The FULL content travels back — text and icons together, so nothing pops
  // in afterwards.
  ghost.replaceChildren(content.cloneNode(true));
  const triggerText = getComputedStyle(trigger);
  ghost.style.color = triggerText.color;
  ghost.style.font = triggerText.font;
  ghost.style.letterSpacing = triggerText.letterSpacing;
}
