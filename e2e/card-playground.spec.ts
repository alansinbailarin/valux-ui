import { expect, test } from "@playwright/test";

/**
 * The expanded card's playground: name + description, live prop knobs, the
 * self-writing usage snippet with its copy circle, and the draggable
 * specimen that springs home. Split from card-expand.spec.ts, which owns
 * the transition/dialog mechanics.
 */

const tile = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Open the Button component" });

test.describe("card playground", () => {
  test("the detail panel edits the specimen in real time", async ({ page }) => {
    await page.goto("/");
    await tile(page).scrollIntoViewIfNeeded();
    await tile(page).click();
    await expect(page.getByRole("dialog", { name: "Button component" })).toBeVisible();

    // Name and description are on stage.
    await expect(page.locator(".expand__name")).toHaveText("Button");
    await expect(page.locator(".expand__description")).toContainText("pressable");

    // Knobs land on the canvas immediately. Kit radios hide the input under
    // a styled label, so the LABEL is the click target.
    const specimen = page.locator(".expand__canvas button");
    await expect(specimen).toHaveAttribute("data-vx-variant", "solid");
    await page.locator(".expand__props .vx-radio", { hasText: "ghost" }).click();
    await expect(specimen).toHaveAttribute("data-vx-variant", "ghost");
    await page.locator(".expand__props .vx-radio", { hasText: "lg" }).click();
    await expect(specimen).toHaveAttribute("data-vx-size", "lg");
    await page.locator(".expand__props label", { hasText: "loading" }).first().click();
    await expect(specimen).toHaveAttribute("data-vx-loading", "");
  });

  test("code copies exactly, and the dragged specimen springs home", async ({
    page,
  }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await tile(page).scrollIntoViewIfNeeded();
    await tile(page).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // Copy reflects the knobs: the clipboard text and the colored view
    // derive from the same segments.
    await page.locator(".expand__props .vx-radio", { hasText: "ghost" }).click();
    await page.getByRole("button", { name: "Copy code" }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'import { Button } from "@valux/ui";\n\n<Button variant="ghost">Button</Button>',
    );
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();

    // Drag the toy far off-centre; on release it springs back to identity.
    const toy = page.locator(".expand__toy");
    const box = (await toy.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 150, box.y - 100, { steps: 6 });
    await page.mouse.up();
    await expect
      .poll(() => toy.evaluate((el) => getComputedStyle(el).transform), {
        timeout: 3000,
      })
      .toBe("none");
  });

});
