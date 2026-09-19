import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useScrollLock } from "./useScrollLock";

function Host({ active }: { active: boolean }) {
  useScrollLock(active);
  return null;
}

describe("useScrollLock", () => {
  it("locks page scroll (html + pinned body, the iOS-proof way) and restores it", () => {
    const { rerender, unmount } = render(<Host active />);
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.width).toBe("100%");

    rerender(<Host active={false} />);
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");

    unmount();
  });
});
