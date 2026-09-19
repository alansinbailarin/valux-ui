/** surface="trigger": the panel adopts the trigger's resting colors (with the
 * usual whisper of primary) so the morph keeps perfect color continuity. */
export function adoptTriggerSurface(
  panel: HTMLElement,
  trigger: HTMLElement,
): void {
  const triggerStyle = getComputedStyle(trigger);
  const background =
    triggerStyle.getPropertyValue("--vx-button-background").trim() ||
    triggerStyle.backgroundColor;
  if (background && !/rgba?\(0, 0, 0, 0\)|transparent/.test(background)) {
    panel.style.setProperty(
      "--vx-dialog-surface",
      `color-mix(in srgb, var(--vx-color-primary) 6%, ${background})`,
    );
    panel.style.color = triggerStyle.color;
  }
}
