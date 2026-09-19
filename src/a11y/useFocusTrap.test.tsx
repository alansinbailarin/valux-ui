import { useRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFocusTrap } from "./useFocusTrap";

function Host({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div ref={ref}>
      <button>first</button>
      <button>last</button>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("moves focus to the first focusable and wraps on Tab", () => {
    render(<Host active />);
    const first = screen.getByRole("button", { name: "first" });
    const last = screen.getByRole("button", { name: "last" });

    expect(first).toHaveFocus();

    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(first).toHaveFocus();
  });
});
