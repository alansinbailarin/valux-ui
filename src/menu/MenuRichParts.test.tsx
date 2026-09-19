import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MenuContext } from "./MenuContext";
import { MenuItem } from "./MenuItem";
import { MenuLabel } from "./MenuLabel";
import { MenuSeparator } from "./MenuSeparator";

function withContext(ui: React.ReactNode) {
  return render(
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
      {ui}
    </MenuContext.Provider>,
  );
}

describe("Menu rich parts", () => {
  it("renders a separator with the proper role", () => {
    withContext(<MenuSeparator />);

    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("data-vx-menu-separator");
  });

  it("renders a presentational section label", () => {
    withContext(<MenuLabel>Archivo</MenuLabel>);

    const label = screen.getByText("Archivo");
    expect(label).toHaveAttribute("data-vx-menu-label");
    expect(label).not.toHaveAttribute("role", "menuitem");
  });

  it("renders a decorative trailing shortcut hint on items", () => {
    withContext(<MenuItem shortcut="⌘D">Duplicar</MenuItem>);

    const item = screen.getByRole("menuitem", { name: "Duplicar" });
    const hint = item.querySelector(".vx-menu-item__shortcut");
    expect(hint).toHaveTextContent("⌘D");
    expect(hint).toHaveAttribute("aria-hidden", "true");
  });
});
