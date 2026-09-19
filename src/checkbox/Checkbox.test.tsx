import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "./index";
import { Radio, RadioGroup } from "../radio";

describe("Checkbox", () => {
  it("toggles from the label and fires onChange", () => {
    const onChange = vi.fn();
    render(<Checkbox label="Acepto los términos" onChange={onChange} />);
    const box = screen.getByRole("checkbox", { name: "Acepto los términos" });
    fireEvent.click(screen.getByText("Acepto los términos"));
    expect(box).toBeChecked();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("supports indeterminate (mixed) state", () => {
    render(<Checkbox label="Seleccionar todo" indeterminate />);
    const box = screen.getByRole("checkbox") as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
  });

  it("wires description and submits in native forms", () => {
    let data: FormData | null = null;
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          data = new FormData(event.currentTarget);
        }}
      >
        <Checkbox label="Promos" description="Correos ocasionales." name="promos" defaultChecked />
        <button type="submit">Ir</button>
      </form>,
    );
    expect(screen.getByRole("checkbox")).toHaveAccessibleDescription("Correos ocasionales.");
    fireEvent.click(screen.getByRole("button", { name: "Ir" }));
    expect(data!.get("promos")).toBe("on");
  });
});

describe("RadioGroup", () => {
  it("selects one option at a time; uncontrolled with defaultValue", () => {
    render(
      <RadioGroup label="Plan" defaultValue="pro">
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
        <Radio value="team" label="Team" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();

    fireEvent.click(screen.getByRole("radio", { name: "Team" }));
    expect(screen.getByRole("radio", { name: "Team" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Pro" })).not.toBeChecked();
  });

  it("controlled: reports via onValueChange and follows value", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <RadioGroup label="Tema" value="light" onValueChange={onValueChange}>
        <Radio value="light" label="Claro" />
        <Radio value="dark" label="Oscuro" />
      </RadioGroup>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Oscuro" }));
    expect(onValueChange).toHaveBeenCalledWith("dark");
    // Still light until the owner re-renders with the new value.
    expect(screen.getByRole("radio", { name: "Claro" })).toBeChecked();
    rerender(
      <RadioGroup label="Tema" value="dark" onValueChange={onValueChange}>
        <Radio value="light" label="Claro" />
        <Radio value="dark" label="Oscuro" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "Oscuro" })).toBeChecked();
  });

  it("group disabled blocks every option", () => {
    render(
      <RadioGroup label="Bloqueado" disabled defaultValue="a">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "B" })).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Checkbox label="Notificarme" description="Solo lo importante." />
        <RadioGroup label="Plan" defaultValue="pro">
          <Radio value="free" label="Free" description="Para probar." />
          <Radio value="pro" label="Pro" />
        </RadioGroup>
      </>,
    );
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
