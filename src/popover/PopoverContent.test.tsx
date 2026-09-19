import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Popover } from "./index";

afterEach(() => vi.unstubAllGlobals());

function reduceMotion() {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
}

function App() {
  return (
    <div>
      <Popover>
        <Popover.Trigger>Filtros</Popover.Trigger>
        <Popover.Content>
          <input aria-label="Buscar" />
          <Popover.Close>Aplicar</Popover.Close>
        </Popover.Content>
      </Popover>
      <button>fuera</button>
    </div>
  );
}

describe("Popover", () => {
  it("opens anchored and NON-modal: background stays interactive, no scroll lock", () => {
    reduceMotion();
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Filtros" }));
    const popover = screen.getByRole("dialog", { name: "Filtros" });
    expect(popover).toHaveAttribute("data-vx-popover");
    expect(popover).not.toHaveAttribute("aria-modal");
    expect(screen.getByLabelText("Buscar")).toHaveFocus();
    // non-modal: siblings are NOT inert and the page is NOT scroll-locked
    expect(screen.getByRole("button", { name: "fuera" }).closest("[inert]")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes from Popover.Close, Escape, and outside pointerdown", () => {
    reduceMotion();
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Filtros" });

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    fireEvent.pointerDown(screen.getByText("fuera"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("hides the trigger while open (the panel IS the trigger) and restores it", () => {
    reduceMotion();
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Filtros" });

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("data-vx-morph-origin", "hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveAttribute("data-vx-morph-origin", "landed");
  });

  it("has no accessibility violations while open", async () => {
    reduceMotion();
    const { baseElement } = render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Filtros" }));

    const results = await axe(baseElement, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toHaveLength(0);
  });
});
