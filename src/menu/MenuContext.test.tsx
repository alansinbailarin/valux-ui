import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MenuContext, useMenuContext } from "./MenuContext";

function Consumer() {
  const { phase } = useMenuContext();
  return <span>{phase}</span>;
}

describe("useMenuContext", () => {
  it("throws when used outside a Menu", () => {
    expect(() => render(<Consumer />)).toThrow(/must be used within <Menu>/i);
  });

  it("exposes the provided value", () => {
    render(
      <MenuContext.Provider
        value={{
          open: true,
          phase: "open",
          setOpen: () => {},
          setPhase: () => {},
          triggerRef: { current: null },
          menuId: "m1",
        }}
      >
        <Consumer />
      </MenuContext.Provider>,
    );

    expect(screen.getByText("open")).toBeInTheDocument();
  });
});
