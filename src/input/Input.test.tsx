import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { Input, TextArea } from "./index";

describe("Input", () => {
  it("wires label, hint, and message through generated ids", () => {
    render(<Input label="Correo" hint="Nunca lo compartimos." />);
    const field = screen.getByLabelText("Correo");
    expect(field).toHaveAccessibleDescription("Nunca lo compartimos.");

    render(<Input label="Usuario" tone="danger" message="Ocupado." />);
    const invalid = screen.getByLabelText("Usuario");
    expect(invalid).toHaveAttribute("aria-invalid", "true");
    expect(invalid).toHaveAccessibleDescription("Ocupado.");
    expect(screen.getByRole("status")).toHaveTextContent("Ocupado.");
  });

  it("curated types preset the right mobile keyboard", () => {
    render(<Input label="Correo" type="email" />);
    const email = screen.getByLabelText("Correo");
    expect(email).toHaveAttribute("inputmode", "email");
    expect(email).toHaveAttribute("autocomplete", "email");
    expect(email).toHaveAttribute("spellcheck", "false");

    render(<Input label="Precio" type="number" />);
    expect(screen.getByLabelText("Precio")).toHaveAttribute("inputmode", "decimal");

    render(<Input label="Buscar" type="search" />);
    expect(screen.getByLabelText("Buscar")).toHaveAttribute("enterkeyhint", "search");
  });

  it("explicit props override type presets", () => {
    render(<Input label="Otro" type="email" autoComplete="off" />);
    expect(screen.getByLabelText("Otro")).toHaveAttribute("autocomplete", "off");
  });

  it("password ships a built-in eye toggle that reveals", () => {
    render(<Input label="Contraseña" type="password" defaultValue="hunter2" />);
    const field = screen.getByLabelText("Contraseña");
    expect(field).toHaveAttribute("type", "password");

    const eye = screen.getByRole("button", { name: "Show password" });
    expect(eye).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(eye);
    expect(field).toHaveAttribute("type", "text");
    expect(eye).toHaveAttribute("aria-pressed", "true");
  });

  it("number renders styled steppers honoring step/min/max", () => {
    const onChange = vi.fn();
    render(
      <Input label="Precio" type="number" defaultValue="8" step={2} max={10} onChange={onChange} />,
    );
    const field = screen.getByLabelText("Precio") as HTMLInputElement;
    const up = screen.getByRole("button", { name: "Increase" });
    expect(up).toHaveAttribute("tabindex", "-1");

    fireEvent.click(up);
    expect(field.value).toBe("10");
    expect(onChange).toHaveBeenCalled();
    fireEvent.click(up); // clamped at max
    expect(field.value).toBe("10");
    fireEvent.click(screen.getByRole("button", { name: "Decrease" }));
    expect(field.value).toBe("8");
  });

  it("counts characters live when showCount + maxLength", () => {
    render(<Input label="Bio" maxLength={20} showCount defaultValue="Hola" />);
    expect(screen.getByText("4/20")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "Hola mundo" } });
    expect(screen.getByText("10/20")).toBeInTheDocument();
  });

  it("exposes variant, size, and tone as data attributes", () => {
    const { container } = render(
      <Input label="X" variant="soft" size="lg" tone="warning" message="Ojo" />,
    );
    const root = container.querySelector("[data-vx-input]");
    expect(root).toHaveAttribute("data-vx-variant", "soft");
    expect(root).toHaveAttribute("data-vx-size", "lg");
    expect(root).toHaveAttribute("data-vx-tone", "warning");
  });

  it("keeps working uncontrolled inside a form", () => {
    let submitted: unknown = null;
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      submitted = new FormData(event.currentTarget).get("nombre");
    };
    render(
      <form onSubmit={onSubmit}>
        <Input label="Nombre" name="nombre" defaultValue="Ada" />
        <button type="submit">Enviar</button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(submitted).toBe("Ada");
  });

  it("TextArea shares the chrome and counts too", () => {
    render(<TextArea label="Notas" maxLength={50} showCount defaultValue="Hey" />);
    const area = screen.getByLabelText("Notas");
    expect(area.tagName).toBe("TEXTAREA");
    expect(screen.getByText("3/50")).toBeInTheDocument();
    fireEvent.input(area, { target: { value: "Hey tú" } });
    expect(screen.getByText("6/50")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Input label="Correo" type="email" hint="Trabajo o personal." />
        <Input label="Contraseña" type="password" />
        <TextArea label="Notas" />
      </>,
    );
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
