const REST_TRANSFORM = "translateY(0) scale(1)";
const PRESSED_TRANSFORM =
  "translateY(1px) scaleX(0.982) scaleY(0.955)";
const activeAnimations = new WeakMap<HTMLElement, Animation>();
const activePointers = new WeakMap<HTMLElement, number>();

function shouldReduceMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function replaceAnimation(
  button: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) {
  const previousAnimation = activeAnimations.get(button);

  if (shouldReduceMotion() || typeof button.animate !== "function") {
    previousAnimation?.cancel();
    activeAnimations.delete(button);
    return;
  }

  const nextAnimation = button.animate(keyframes, options);
  previousAnimation?.cancel();
  activeAnimations.set(button, nextAnimation);
}

export function pressButton(
  button: HTMLElement,
  pointerId: number,
  pointerType = "mouse",
) {
  if (activePointers.has(button)) return;
  activePointers.set(button, pointerId);

  // Capture only mouse/pen pointers (to catch drags off the button). WebKit
  // SUPPRESSES the synthesized click when a touch pointer is captured during
  // pointerdown — capturing here made every tap dead on iOS.
  if (pointerType !== "touch" && typeof button.setPointerCapture === "function") {
    button.setPointerCapture(pointerId);
  }

  replaceAnimation(button, [
    { transform: REST_TRANSFORM },
    { transform: PRESSED_TRANSFORM },
  ], {
    duration: 140,
    easing: "cubic-bezier(0.32, 0.72, 0, 1)",
    fill: "forwards",
  });
}

export function releaseButton(button: HTMLElement, pointerId: number) {
  if (!activePointers.has(button)) return;
  if (activePointers.get(button) !== pointerId) return;
  activePointers.delete(button);

  replaceAnimation(
    button,
    [
      {
        transform: PRESSED_TRANSFORM,
        offset: 0,
      },
      {
        transform: "translateY(-0.5px) scaleX(1.008) scaleY(1.012)",
        offset: 0.52,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      { transform: REST_TRANSFORM, offset: 1 },
    ],
    { duration: 300, easing: "linear" },
  );
}

export function cancelButtonPress(
  button: HTMLElement,
  pointerId: number,
) {
  if (!activePointers.has(button)) return;
  if (activePointers.get(button) !== pointerId) return;
  activePointers.delete(button);

  replaceAnimation(button, [{ transform: REST_TRANSFORM }], {
    duration: 140,
    easing: "cubic-bezier(0.32, 0.72, 0, 1)",
  });
}

export function resetButtonPress(button: HTMLElement) {
  activePointers.delete(button);
  replaceAnimation(button, [{ transform: REST_TRANSFORM }], {
    duration: 140,
    easing: "cubic-bezier(0.32, 0.72, 0, 1)",
  });
}
