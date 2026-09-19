import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useInertBackground } from "./useInertBackground";

function Host({
  active,
  portal,
}: {
  active: boolean;
  portal: HTMLElement | null;
}) {
  useInertBackground(portal, active);
  return null;
}

describe("useInertBackground", () => {
  it("marks sibling body children inert while active", () => {
    const sibling = document.createElement("div");
    const portal = document.createElement("div");
    document.body.append(sibling, portal);

    const { rerender } = render(<Host active portal={portal} />);
    expect(sibling.hasAttribute("inert")).toBe(true);
    expect(sibling).toHaveAttribute("aria-hidden", "true");

    rerender(<Host active={false} portal={portal} />);
    expect(sibling.hasAttribute("inert")).toBe(false);

    sibling.remove();
    portal.remove();
  });
});
