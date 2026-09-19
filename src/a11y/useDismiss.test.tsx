import { useRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDismiss } from "./useDismiss";

function Host({
  dismissable,
  onDismiss,
}: {
  dismissable: boolean;
  onDismiss: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss({ active: true, dismissable, panelRef, onDismiss });
  return (
    <div>
      <div ref={panelRef}>
        <button>inside</button>
      </div>
      <button>outside</button>
    </div>
  );
}

describe("useDismiss", () => {
  it("closes on Escape and on outside pointerdown", () => {
    const onDismiss = vi.fn();
    render(<Host dismissable onDismiss={onDismiss} />);

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.pointerDown(screen.getByRole("button", { name: "outside" }));

    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it("ignores inside clicks and does nothing when not dismissable", () => {
    const onDismiss = vi.fn();
    render(<Host dismissable={false} onDismiss={onDismiss} />);

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.pointerDown(screen.getByRole("button", { name: "inside" }));

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
