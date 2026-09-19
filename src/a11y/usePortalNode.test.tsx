import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { usePortalNode } from "./usePortalNode";

function Host({ active }: { active: boolean }) {
  const node = usePortalNode(active);
  return <span data-testid="state">{node ? "ready" : "none"}</span>;
}

describe("usePortalNode", () => {
  it("appends a marked body node while active and removes it on cleanup", () => {
    const { getByTestId, rerender, unmount } = render(<Host active />);

    expect(getByTestId("state")).toHaveTextContent("ready");
    expect(document.querySelector("[data-vx-portal]")).toBeInTheDocument();

    rerender(<Host active={false} />);
    expect(document.querySelector("[data-vx-portal]")).not.toBeInTheDocument();

    unmount();
  });
});
