import { useRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useMenuKeyboard } from "./useMenuKeyboard";

function Host({ active, onClose }: { active: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useMenuKeyboard({ ref, active, onClose });
  return (
    <div ref={ref}>
      <button role="menuitem">a</button>
      <button role="menuitem" disabled>
        b
      </button>
      <button role="menuitem">c</button>
    </div>
  );
}

describe("useMenuKeyboard", () => {
  it("moves focus with arrows, skips disabled items, and wraps", () => {
    render(<Host active onClose={() => {}} />);
    const a = screen.getByRole("menuitem", { name: "a" });
    const c = screen.getByRole("menuitem", { name: "c" });

    a.focus();
    fireEvent.keyDown(a, { key: "ArrowDown" });
    expect(c).toHaveFocus();
    fireEvent.keyDown(c, { key: "ArrowDown" });
    expect(a).toHaveFocus();
    fireEvent.keyDown(a, { key: "End" });
    expect(c).toHaveFocus();
    fireEvent.keyDown(c, { key: "Home" });
    expect(a).toHaveFocus();
  });

  it("type-ahead focuses the first item matching typed characters", () => {
    render(<Host active onClose={() => {}} />);
    const a = screen.getByRole("menuitem", { name: "a" });
    const c = screen.getByRole("menuitem", { name: "c" });

    a.focus();
    fireEvent.keyDown(a, { key: "c" });
    expect(c).toHaveFocus();
  });

  it("closes on Tab", () => {
    const onClose = vi.fn();
    render(<Host active onClose={onClose} />);

    fireEvent.keyDown(screen.getByRole("menuitem", { name: "a" }), {
      key: "Tab",
    });

    expect(onClose).toHaveBeenCalledOnce();
  });
});
