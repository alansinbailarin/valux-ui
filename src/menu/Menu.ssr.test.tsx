import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Menu } from "./index";

describe("Menu server rendering", () => {
  it("renders the trigger on the server and defers the portaled content", () => {
    const html = renderToString(
      <Menu defaultOpen>
        <Menu.Trigger aria-label="Acciones">+</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Editar</Menu.Item>
        </Menu.Content>
      </Menu>,
    );

    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain("vx-menu-trigger__content");
    // The portal/content only exists in the browser.
    expect(html).not.toContain('role="menu"');
    expect(html).not.toContain("Editar");
  });
});
