// Shared "warmth": once one tooltip has shown, moving to a neighbor within
// this window shows it INSTANTLY (native toolbars behave this way).
const WARM_MS = 300;
let lastHiddenAt = 0;

export function markTooltipHidden(): void {
  lastHiddenAt = Date.now();
}

export function tooltipsAreWarm(): boolean {
  return Date.now() - lastHiddenAt < WARM_MS;
}
