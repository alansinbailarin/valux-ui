import { expect, test } from "@playwright/test";

/**
 * Encodes six keyboard/focus-management findings from the a11y audit as
 * executable specs, each verified against the real running app before
 * `test.fail()` was applied (or left off, for the ones that turned out to
 * already be fine). Confirmed results:
 *   - ContextMenu keyboard-unreachable  -> FAILS (test.fail())
 *   - Toast keyboard dismissal          -> FAILS (test.fail())
 *   - Dialog focus trap                 -> PASSES
 *   - Select-inside-Dialog case         -> not reachable, test.skip()
 *   - Menu focus restore                -> PASSES (audit false positive
 *                                           on this exact repro)
 *   - Menu trigger click-while-open     -> FAILS (test.fail())
 *   - Popover Tab containment           -> PASSES
 *
 * Morph/close animations run up to ~540ms (MENU_PRESET.openMs = 500,
 * DIALOG_PRESET.openMs = 540); waits below use ~800ms margins.
 */

test.describe("ContextMenu keyboard-unreachable", () => {
  test("trigger is focusable and Shift+F10 / ContextMenu key open the menu", async ({ page }) => {
    // CONFIRMED FAILING: the trigger never accepts focus (it's a bare
    // <div> with no tabIndex), so the keyboard-open assertions below
    // never even get a chance to run.
    test.fail();
    await page.goto("/context-menu");

    // First ContextMenu.Trigger on the page: a bare <div data-vx-context-trigger>
    // with no tabIndex and no keydown handler (see src/contextmenu/ContextMenuTrigger.tsx).
    const trigger = page.locator("[data-vx-context-trigger]").first();
    await expect(trigger).toBeVisible();

    // Tab-reachability proxy: a genuinely focusable element accepts
    // .focus(). A <div> with no tabindex is inert to focus() per the HTML
    // spec, which is exactly what makes it unreachable via real Tab
    // traversal too — there is no deterministic "N tab presses" that would
    // reach it since it never enters the tab order at all.
    await trigger.focus();
    await expect(trigger, "trigger should accept keyboard focus (has no tabIndex)").toBeFocused();

    // With focus never actually landing on the trigger, the keyboard
    // "open context menu" affordances (Shift+F10 / the Menu key) have
    // nothing to act on either.
    await page.keyboard.press("Shift+F10");
    await page.keyboard.press("ContextMenu");
    await page.waitForTimeout(500);

    await expect(page.getByRole("menu"), "context menu should open via keyboard").toBeVisible();
  });
});

test.describe("Toast keyboard dismissal", () => {
  test("a sticky toast exposes a focusable close control and Escape dismisses it", async ({ page }) => {
    // CONFIRMED FAILING: the toast card has no focusable close control
    // (no action button on this demo, no tabIndex on the card itself),
    // and Toaster never wires up useDismiss, so Escape does nothing.
    test.fail();
    await page.goto("/toast");

    // duration: 0 -> no auto-dismiss timer (see app/toast/ToastDemos.tsx).
    await page.getByRole("button", { name: "Disparar sticky" }).click();

    const toaster = page.locator("[data-vx-toaster]");
    const toastCard = toaster.locator("[data-vx-toast]").first();
    await expect(toastCard).toBeVisible();

    const focusableInToast = toaster.locator(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    await expect(
      focusableInToast.first(),
      "toaster should contain at least one keyboard-focusable close control",
    ).toBeVisible();

    // Escape should dismiss the toast when focus is inside/near it.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(800);

    await expect(toastCard, "Escape should dismiss the toast").toBeHidden();
  });
});

test.describe("Dialog focus trap", () => {
  // CONFIRMED PASSING: useFocusTrap correctly wraps Shift+Tab between the
  // dialog's two focusable elements (the Eliminar button and the DialogX
  // close button) on this demo. Plain expects below.
  test("Shift+Tab never leaves the dialog panel", async ({ page }) => {
    await page.goto("/dialog");

    await page.getByRole("button", { name: "Eliminar" }).click();
    const dialog = page.locator("[data-vx-dialog]");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(800);

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Shift+Tab");
      const stillInside = await dialog.evaluate(
        (panel) => panel.contains(document.activeElement),
      );
      expect(stillInside, `activeElement left the dialog panel after ${i + 1} Shift+Tab press(es)`).toBe(true);
    }
  });

  // The audit also flags a Select-inside-Dialog case (the Select panel
  // portals OUTSIDE the dialog's DOM subtree, so useFocusTrap's
  // querySelectorAll never finds its options and Tab can walk out of the
  // trap through it). As of this run there is no reachable showroom demo
  // combining Select + Dialog (app/dialog/DialogDemos.tsx has that demo
  // commented out, and no other route pairs them) — recorded here so the
  // gap is visible, not silently dropped.
  test.skip(
    "Select-inside-Dialog defeats the focus trap — not reachable in the current showroom (no live demo combines Select + Dialog)",
    () => {},
  );
});

test.describe("Menu focus restore", () => {
  // CONFIRMED PASSING — this is a FALSE POSITIVE from the audit on this
  // exact repro: MenuContentSurface's cleanup effect (`return () =>
  // trigger?.focus()`) does still run on unmount, but by the time it
  // fires here focus has NOT been yanked away from the element the user
  // clicked. Keeping this as a plain (non test.fail()) assertion so a
  // real regression here still gets caught.
  test("focus stays where the user clicked after the menu closes", async ({ page }) => {
    await page.goto("/menu");

    const trigger = page.getByRole("button", { name: "Acciones del documento" });
    await trigger.click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Click a genuinely unrelated focusable control elsewhere on the page.
    // (The role=switch input is 1x1px + pointer-events:none by design —
    // see src/styles/switch.css — so click its wrapping <label>, which is
    // what a real mouse click actually lands on.)
    const elsewhere = page.getByRole("switch", { name: "Dark mode" });
    await elsewhere.locator("xpath=ancestor::label[1]").click();

    // The menu's close-unmount effect returns focus to the trigger
    // (src/menu/MenuContentSurface.tsx `useLayoutEffect(() => { ... return
    // () => trigger?.focus(); })`), which fires whenever the panel
    // eventually unmounts — even if the user has since moved focus
    // elsewhere. Give the closing morph time to finish and the cleanup to run.
    await page.waitForTimeout(500);

    const activeIsElsewhere = await elsewhere.evaluate((node) => document.activeElement === node);
    expect(activeIsElsewhere, "focus should remain on the element the user clicked, not jump back to the menu trigger").toBe(true);
  });
});

test.describe("Menu trigger click-while-open", () => {
  test("clicking the trigger again while open closes the menu (does not reopen it)", async ({ page }) => {
    // CONFIRMED FAILING: the menu reopens instead of staying closed.
    test.fail();
    await page.goto("/menu");

    const trigger = page.getByRole("button", { name: "Acciones del documento" });
    await trigger.click();
    await expect(page.getByRole("menu")).toBeVisible();
    // Let the open morph settle into its resting position before the
    // second click.
    await page.waitForTimeout(800);

    // In THIS demo the open panel's resting position visually overlaps
    // its own trigger (confirmed empirically: a real Playwright .click()
    // on the trigger here times out because the menu panel/label
    // intercepts the pointer at that screen position). That is a
    // separate, real layout quirk worth its own note, but it would mask
    // the specific bug under test here. Dispatch the pointerdown+click
    // pair directly on the trigger element (bypassing screen-coordinate
    // hit-testing) to exercise the actual handler logic: useDismiss's
    // document-level pointerdown listener (src/a11y/useDismiss.ts) closes
    // the menu because the trigger isn't inside the panel, then
    // MenuTrigger's onClick (src/menu/MenuTrigger.tsx `setOpen(!open)`)
    // reads the now-stale-vs-fresh `open` state and can reopen it.
    await trigger.dispatchEvent("pointerdown", { bubbles: true, cancelable: true, pointerId: 1, pointerType: "mouse", button: 0 });
    await trigger.dispatchEvent("pointerup", { bubbles: true, cancelable: true, pointerId: 1, pointerType: "mouse", button: 0 });
    await trigger.dispatchEvent("click", { bubbles: true, cancelable: true, button: 0 });
    await page.waitForTimeout(800);

    await expect(page.getByRole("menu"), "menu should stay closed after a second trigger click").toBeHidden();
  });
});

test.describe("Popover Tab containment", () => {
  // CONFIRMED PASSING: tabbing past the popover's only focusable lands
  // back within document.body, not on <html>/browser chrome.
  test("tabbing past the last focusable stays inside the document", async ({ page }) => {
    await page.goto("/popover");

    await page.getByRole("button", { name: "Abrir", exact: true }).click();
    const popover = page.locator("[data-vx-popover]");
    await expect(popover).toBeVisible();
    await page.waitForTimeout(800);

    // Popover is intentionally non-modal (no trap/lock/inert — see
    // src/popover/PopoverContentSurface.tsx comment). The only focusable
    // inside this demo's content is the "Cerrar" Popover.Close button,
    // which already holds focus per the open-effect.
    await expect(page.getByRole("button", { name: "Cerrar" })).toBeFocused();

    await page.keyboard.press("Tab");

    const focusState = await page.evaluate(() => {
      const active = document.activeElement;
      return {
        tag: active?.tagName ?? null,
        inBody: active ? document.body.contains(active) : false,
      };
    });

    expect(focusState.tag, "focus should not be lost to <html>/browser chrome").not.toBe("HTML");
    expect(focusState.inBody, "focus should land on an element still inside document.body").toBe(true);
  });
});
