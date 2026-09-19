import { useRef } from "react";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMorph } from "./useMorph";

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "animate");
  vi.unstubAllGlobals();
});

function Host({
  phase,
  onOpened,
}: {
  phase: "opening" | "open";
  onOpened: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(
    document.createElement("button"),
  );
  useMorph({ phase, panelRef, triggerRef, onOpened, onClosed: () => {} });
  return <div ref={panelRef} />;
}

describe("useMorph", () => {
  it("runs the open morph and calls onOpened under reduced motion", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    const onOpened = vi.fn();

    render(<Host phase="opening" onOpened={onOpened} />);

    expect(onOpened).toHaveBeenCalledOnce();
  });
});
