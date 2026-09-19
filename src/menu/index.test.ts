import { describe, expect, it } from "vitest";

import { Menu } from "./index";

describe("menu barrel", () => {
  it("exposes a compound Menu with all parts", () => {
    expect(typeof Menu).toBe("function");
    expect(typeof Menu.Trigger).toBe("function");
    expect(typeof Menu.Content).toBe("function");
    expect(typeof Menu.Item).toBe("function");
    expect(typeof Menu.Separator).toBe("function");
    expect(typeof Menu.Label).toBe("function");
  });
});
