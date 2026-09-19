import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MenuContext } from "./MenuContext";
import { MenuItem } from "./MenuItem";

function withContext(ui: React.ReactNode, setOpen = () => {}) {
  return render(
    <MenuContext.Provider
      value={{
        open: true,
        phase: "open",
        setOpen,
        setPhase: () => {},
        triggerRef: { current: null },
        menuId: "m1",
      }}
    >
      {ui}
    </MenuContext.Provider>,
  );
}

describe("MenuItem", () => {
  it("fires onSelect and closes on click", () => {
    const onSelect = vi.fn();
    const setOpen = vi.fn();
    withContext(<MenuItem onSelect={onSelect}>Editar</MenuItem>, setOpen);

    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("does nothing when disabled", () => {
    const onSelect = vi.fn();
    const setOpen = vi.fn();
    withContext(
      <MenuItem disabled onSelect={onSelect}>
        Compartir
      </MenuItem>,
      setOpen,
    );

    const item = screen.getByRole("menuitem", { name: "Compartir" });
    expect(item).toBeDisabled();
    fireEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
    expect(setOpen).not.toHaveBeenCalled();
  });

  it("marks destructive items with a data attribute", () => {
    withContext(<MenuItem destructive>Eliminar</MenuItem>);
    expect(screen.getByRole("menuitem", { name: "Eliminar" })).toHaveAttribute(
      "data-vx-destructive",
      "",
    );
  });
});
