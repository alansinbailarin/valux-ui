import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Menu } from "./Menu";
import { useMenuContext } from "./MenuContext";

function Probe() {
  const { phase, open } = useMenuContext();
  return <span data-testid="probe">{`${open}:${phase}`}</span>;
}

describe("Menu root", () => {
  it("starts closed", () => {
    render(
      <Menu>
        <Probe />
      </Menu>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("false:closed");
  });

  it("derives opening from a controlled open prop", () => {
    render(
      <Menu open>
        <Probe />
      </Menu>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("true:opening");
  });
});
