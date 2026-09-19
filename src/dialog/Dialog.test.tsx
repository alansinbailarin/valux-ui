import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Dialog } from "./index";
import { useDialogContext } from "./DialogContext";

function Probe() {
  const { phase, open } = useDialogContext();
  return <span data-testid="probe">{`${open}:${phase}`}</span>;
}

describe("Dialog root + trigger", () => {
  it("starts closed and derives opening from a controlled open prop", () => {
    const { rerender } = render(
      <Dialog>
        <Probe />
      </Dialog>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("false:closed");

    rerender(
      <Dialog open>
        <Probe />
      </Dialog>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("true:opening");
  });

  it("trigger toggles with dialog semantics and asChild keeps both APIs", () => {
    render(
      <Dialog>
        <Dialog.Trigger asChild>
          <button className="consumer">Abrir</button>
        </Dialog.Trigger>
      </Dialog>,
    );

    const trigger = screen.getByRole("button", { name: "Abrir" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveClass("vx-dialog-trigger", "consumer");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("data-vx-morph-origin", "hidden");
  });

  it("renders the trigger on the server and defers the portaled content", () => {
    const html = renderToString(
      <Dialog defaultOpen>
        <Dialog.Trigger>Abrir</Dialog.Trigger>
        <Dialog.Content aria-label="Editar">contenido</Dialog.Content>
      </Dialog>,
    );

    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain("contenido");
  });
});
