import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Tooltip } from "./index";
import { Button } from "../button";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function reduceMotion() {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
}

function App() {
  return (
    <Tooltip delay={400}>
      <Tooltip.Trigger asChild>
        <Button variant="ghost" iconOnly aria-label="Compartir">S</Button>
      </Tooltip.Trigger>
      <Tooltip.Content>Compartir libreta</Tooltip.Content>
    </Tooltip>
  );
}

describe("Tooltip", () => {
  it("shows after the hover delay and describes its trigger", () => {
    reduceMotion();
    vi.useFakeTimers();
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Compartir" });

    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(450));

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Compartir libreta");
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);

    fireEvent.pointerLeave(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(trigger).not.toHaveAttribute("aria-describedby");
  });

  it("never opens from touch hover, and pressing hides a visible tooltip", () => {
    reduceMotion();
    vi.useFakeTimers();
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Compartir" });

    fireEvent.pointerEnter(trigger, { pointerType: "touch" });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(450));
    fireEvent.pointerDown(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("Escape hides it", () => {
    reduceMotion();
    vi.useFakeTimers();
    render(<App />);
    fireEvent.pointerEnter(screen.getByRole("button"), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(450));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("warm group: right after one hides, a neighbor shows with NO delay", () => {
    reduceMotion();
    vi.useFakeTimers();
    vi.setSystemTime(0);
    render(
      <div>
        <Tooltip delay={400}>
          <Tooltip.Trigger>Uno</Tooltip.Trigger>
          <Tooltip.Content>Primero</Tooltip.Content>
        </Tooltip>
        <Tooltip delay={400}>
          <Tooltip.Trigger>Dos</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Title>Segundo</Tooltip.Title>
            <Tooltip.Description>Con descripción.</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>
      </div>,
    );

    fireEvent.pointerEnter(screen.getByRole("button", { name: "Uno" }), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(450));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Primero");

    fireEvent.pointerLeave(screen.getByRole("button", { name: "Uno" }));
    fireEvent.pointerEnter(screen.getByRole("button", { name: "Dos" }), { pointerType: "mouse" });
    // No timer advance: the group is warm, it shows instantly.
    const rich = screen.getByRole("tooltip");
    expect(rich.querySelector(".vx-tooltip__title")).toHaveTextContent("Segundo");
    expect(rich.querySelector(".vx-tooltip__description")).toHaveTextContent("Con descripción.");
  });

  it("has no accessibility violations while open", async () => {
    reduceMotion();
    vi.useFakeTimers();
    const { baseElement } = render(<App />);
    fireEvent.pointerEnter(screen.getByRole("button"), { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(450));
    vi.useRealTimers();

    const results = await axe(baseElement, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toHaveLength(0);
  });
});
