import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Dialog } from "./index";

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "animate");
  vi.unstubAllGlobals();
});

function reduceMotion() {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
}

function App(props: { dismissable?: boolean }) {
  return (
    <Dialog>
      <Dialog.Trigger>Editar</Dialog.Trigger>
      <Dialog.Content aria-label="Editar perfil" dismissable={props.dismissable}>
        <input aria-label="Nombre" />
        <Dialog.Close>Guardar</Dialog.Close>
      </Dialog.Content>
    </Dialog>
  );
}

describe("DialogContent", () => {
  it("is not rendered while closed", () => {
    render(<App />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens as a modal dialog, traps focus inside, closes on Escape", () => {
    reduceMotion();
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    const dialog = screen.getByRole("dialog", { name: "Editar perfil" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByLabelText("Nombre")).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("respects dismissable={false} for Escape and outside clicks", () => {
    reduceMotion();
    render(<App dismissable={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.pointerDown(document.body);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes from Dialog.Close and restores focus to the trigger", () => {
    reduceMotion();
    render(<App />);

    const trigger = screen.getByRole("button", { name: "Editar" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("marks background siblings inert while open", () => {
    reduceMotion();
    const sibling = document.createElement("div");
    document.body.appendChild(sibling);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(sibling.hasAttribute("inert")).toBe(true);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(sibling.hasAttribute("inert")).toBe(false);
    sibling.remove();
  });

  it("has no accessibility violations while open", async () => {
    reduceMotion();
    const { baseElement } = render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));

    const results = await axe(baseElement, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toHaveLength(0);
  });
});
