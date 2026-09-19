import { useCallback, useEffect, useRef } from "react";
import type { PointerEventHandler } from "react";

import {
  cancelButtonPress,
  pressButton,
  releaseButton,
  resetButtonPress,
} from "./Button.motion";

interface ButtonInteractionOptions<T extends HTMLElement> {
  disabled: boolean;
  onLostPointerCapture?: PointerEventHandler<T>;
  onPointerCancel?: PointerEventHandler<T>;
  onPointerDown?: PointerEventHandler<T>;
  onPointerUp?: PointerEventHandler<T>;
}

export function useButtonInteraction<T extends HTMLElement>({
  disabled,
  onLostPointerCapture,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
}: ButtonInteractionOptions<T>) {
  const activeElementRef = useRef<T | null>(null);
  useEffect(() => {
    if (!disabled || !activeElementRef.current) return;
    resetButtonPress(activeElementRef.current);
    activeElementRef.current = null;
  }, [disabled]);
  const handlePointerDown: PointerEventHandler<T> = useCallback(
    (event) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || disabled || event.button !== 0) return;
      activeElementRef.current = event.currentTarget;
      pressButton(event.currentTarget, event.pointerId, event.pointerType);
    },
    [disabled, onPointerDown],
  );
  const handlePointerUp: PointerEventHandler<T> = useCallback(
    (event) => {
      onPointerUp?.(event);
      if (!disabled) releaseButton(event.currentTarget, event.pointerId);
      activeElementRef.current = null;
    },
    [disabled, onPointerUp],
  );
  const handlePointerCancel: PointerEventHandler<T> = useCallback(
    (event) => {
      onPointerCancel?.(event);
      cancelButtonPress(event.currentTarget, event.pointerId);
      activeElementRef.current = null;
    },
    [onPointerCancel],
  );
  const handleLostPointerCapture: PointerEventHandler<T> = useCallback(
    (event) => {
      onLostPointerCapture?.(event);
      cancelButtonPress(event.currentTarget, event.pointerId);
      activeElementRef.current = null;
    },
    [onLostPointerCapture],
  );

  return {
    onLostPointerCapture: handleLostPointerCapture,
    onPointerCancel: handlePointerCancel,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
  };
}
