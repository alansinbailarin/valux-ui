import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Sheet } from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function reduceMotion() {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
}

function App(props: { dismissable?: boolean }) {
  return (
    <Sheet>
      <Sheet.Trigger>Ajustes</Sheet.Trigger>
      <Sheet.Content dismissable={props.dismissable} height="half">
        <Sheet.Title>Ajustes rápidos</Sheet.Title>
        <Sheet.Description>Preferencias de esta libreta.</Sheet.Description>
        <input aria-label="Nombre" />
      </Sheet.Content>
    </Sheet>
  );
}

describe("Sheet", () => {
  it("opens as a bottom modal named by its Title; X and Escape close it", () => {
    reduceMotion();
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Ajustes" }));
    const sheet = screen.getByRole("dialog", { name: "Ajustes rápidos" });
    expect(sheet).toHaveAttribute("data-vx-sheet");
    expect(sheet).toHaveAttribute("data-vx-phase", "open");
    expect(sheet).toHaveAttribute("data-vx-height", "half");
    expect(sheet).toHaveAccessibleDescription("Preferencias de esta libreta.");
    expect(screen.getByLabelText("Nombre")).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ajustes" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("respects dismissable={false} and keeps the trigger in place (no morph attrs)", () => {
    reduceMotion();
    render(<App dismissable={false} />);
    const trigger = screen.getByRole("button", { name: "Ajustes" });

    fireEvent.click(trigger);
    expect(trigger).not.toHaveAttribute("data-vx-morph-origin");

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.pointerDown(document.body);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("expandable drag follows the finger and the midpoint decides on release", () => {
    reduceMotion();
    render(
      <Sheet defaultOpen>
        <Sheet.Content expandable aria-label="Expandible">
          contenido
        </Sheet.Content>
      </Sheet>,
    );
    const sheet = screen.getByRole("dialog", { name: "Expandible" });

    // Follow the drag (inline height), no snap before release.
    fireEvent.pointerDown(sheet, { button: 0, clientY: 600 });
    fireEvent.pointerMove(sheet, { buttons: 1, clientY: 80 });
    expect(sheet.style.height).not.toBe("");
    expect(sheet).not.toHaveAttribute("data-vx-expanded");

    // Released past the midpoint (520px of the 744px budget) -> expands.
    fireEvent.pointerUp(sheet);
    expect(sheet).toHaveAttribute("data-vx-expanded");
    expect(sheet.style.height).toBe("");

    // Dragging down but releasing below the midpoint -> collapses, stays open.
    fireEvent.pointerDown(sheet, { button: 0, clientY: 100 });
    fireEvent.pointerMove(sheet, { buttons: 1, clientY: 560 });
    fireEvent.pointerUp(sheet);
    expect(sheet).not.toHaveAttribute("data-vx-expanded");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("expandable: two-finger swipes track continuously and settle at the midpoint", () => {
    reduceMotion();
    vi.useFakeTimers();
    render(
      <Sheet defaultOpen>
        <Sheet.Content expandable aria-label="Expandible">
          contenido corto
        </Sheet.Content>
      </Sheet>,
    );
    const sheet = screen.getByRole("dialog", { name: "Expandible" });

    // fingers up = positive deltaY: height follows below the midpoint...
    fireEvent.wheel(sheet, { deltaY: 250, cancelable: true });
    expect(sheet.style.height).toBe("250px");
    expect(sheet).not.toHaveAttribute("data-vx-expanded");

    // ...and CROSSING the midpoint commits right then (no idle wait).
    fireEvent.wheel(sheet, { deltaY: 250, cancelable: true });
    expect(sheet).toHaveAttribute("data-vx-expanded");
    expect(sheet.style.height).toBe("");

    // Trailing inertia right after the commit is swallowed...
    const swallowed = fireEvent.wheel(sheet, { deltaY: 90, cancelable: true });
    expect(swallowed).toBe(false);
    vi.advanceTimersByTime(300); // ...until the stream goes quiet.

    // fingers down from expanded: crossing back below the midpoint collapses
    fireEvent.wheel(sheet, { deltaY: -600, cancelable: true });
    expect(sheet).not.toHaveAttribute("data-vx-expanded");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("has no accessibility violations while open", async () => {
    reduceMotion();
    const { baseElement } = render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Ajustes" }));

    const results = await axe(baseElement, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toHaveLength(0);
  });
});
