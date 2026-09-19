import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./index";

describe("Switch", () => {
  it("is a real checkbox with role=switch; clicking the label toggles", () => {
    const onChange = vi.fn();
    render(<Switch label="Notificaciones" onChange={onChange} />);
    const control = screen.getByRole("switch", { name: "Notificaciones" });
    expect(control).not.toBeChecked();

    fireEvent.click(screen.getByText("Notificaciones"));
    expect(control).toBeChecked();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("wires the description via aria-describedby", () => {
    render(<Switch label="Backups" description="Cada noche a las 2am." />);
    expect(screen.getByRole("switch")).toHaveAccessibleDescription(
      "Cada noche a las 2am.",
    );
  });

  it("supports controlled usage and disabled", () => {
    const { rerender } = render(<Switch label="Wifi" checked={false} onChange={() => {}} />);
    const control = screen.getByRole("switch");
    expect(control).not.toBeChecked();
    rerender(<Switch label="Wifi" checked onChange={() => {}} />);
    expect(control).toBeChecked();

    render(<Switch label="Bloqueado" disabled />);
    expect(screen.getByRole("switch", { name: "Bloqueado" })).toBeDisabled();
  });

  it("submits its name/value inside a native form", () => {
    let data: FormData | null = null;
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Switch label="Promos" name="promos" defaultChecked />
        <button type="submit">Guardar</button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(data!.get("promos")).toBe("on");
  });

  it("exposes size as a data attribute", () => {
    const { container } = render(<Switch label="X" size="lg" />);
    expect(container.querySelector("[data-vx-switch]")).toHaveAttribute(
      "data-vx-size",
      "lg",
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Switch label="Notificaciones" description="Push y correo." defaultChecked />
        <Switch label="Sonidos" size="sm" />
      </>,
    );
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
