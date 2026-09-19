import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const requiredFiles = [
  "src/button/Button.types.ts",
  "src/button/ButtonContent.tsx",
  "src/button/ButtonContent.types.ts",
  "src/button/index.ts",
  "src/theme/ValuxProvider.tsx",
  "src/theme/ValuxProvider.types.ts",
  "src/theme/ValuxProvider.test.tsx",
  "src/theme/color/parseColor.ts",
  "src/theme/color/surfaceTint.ts",
  "src/theme/color/index.ts",
  "src/theme/index.ts",
  "src/styles/tokens.css",
  "src/styles/modes.css",
  "src/styles/variants.css",
  "src/styles/button.css",
  "src/styles/button-colors.css",
  "src/styles/button-variants.css",
  "src/styles/button-content.css",
  "src/styles/button-sizes.css",
  "src/styles/menu-tokens.css",
  "src/styles/menu-content.css",
  "src/styles/menu-item.css",
  "src/menu/Menu.tsx",
  "src/menu/Menu.types.ts",
  "src/menu/MenuContext.ts",
  "src/menu/MenuTrigger.tsx",
  "src/menu/MenuContent.tsx",
  "src/menu/MenuContentSurface.tsx",
  "src/menu/MenuItem.tsx",
  "src/menu/MenuSeparator.tsx",
  "src/menu/MenuLabel.tsx",
  "src/menu/useMenuState.ts",
  "src/menu/useMenuKeyboard.ts",
  "src/menu/placement.ts",
  "src/menu/index.ts",
  "src/morph/morphKeyframes.ts",
  "src/morph/runMorph.ts",
  "src/morph/compositeBackground.ts",
  "src/morph/compositeBackground.test.ts",
  "src/morph/useMorph.ts",
  "src/morph/reducedMotion.ts",
  "src/a11y/useDismiss.ts",
  "src/a11y/usePortalNode.ts",
  "src/a11y/useFocusTrap.ts",
  "src/a11y/useScrollLock.ts",
  "src/a11y/useInertBackground.ts",
  "src/a11y/populateGhost.ts",
  "src/a11y/usePortalTheme.ts",
  "src/styles/dialog-tokens.css",
  "src/styles/dialog-scrim.css",
  "src/styles/dialog-content.css",
  "src/dialog/Dialog.tsx",
  "src/dialog/Dialog.types.ts",
  "src/dialog/DialogContext.ts",
  "src/dialog/DialogTrigger.tsx",
  "src/dialog/DialogContent.tsx",
  "src/dialog/DialogContentSurface.tsx",
  "src/dialog/DialogClose.tsx",
  "src/dialog/useDialogState.ts",
  "src/dialog/dialogPlacement.ts",
  "src/dialog/DialogTitle.tsx",
  "src/dialog/DialogDescription.tsx",
  "src/dialog/DialogX.tsx",
  "src/dialog/useDialogAria.ts",
  "src/dialog/adoptTriggerSurface.ts",
  "src/styles/dialog-parts.css",
  "src/dialog/useDialogPosition.ts",
  "src/menu/useMenuPosition.ts",
  "src/morph/morphPlan.ts",
  "src/morph/useCloseScrub.ts",
  "src/morph/scrubController.ts",
  "src/a11y/usePullDismiss.ts",
  "src/a11y/swallowInertia.ts",
  "src/a11y/pullExit.ts",
  "src/a11y/scrollableChain.ts",
  "src/sheet/Sheet.tsx",
  "src/sheet/Sheet.types.ts",
  "src/sheet/SheetContext.ts",
  "src/sheet/SheetTrigger.tsx",
  "src/sheet/SheetContent.tsx",
  "src/sheet/SheetContentSurface.tsx",
  "src/sheet/SheetClose.tsx",
  "src/sheet/SheetTitle.tsx",
  "src/sheet/useSheetPhase.ts",
  "src/sheet/useSheetExpand.ts",
  "src/sheet/index.ts",
  "src/styles/sheet.css",
  "src/dialog/DialogLayout.tsx",
  "src/dialog/DialogIcon.tsx",
  "src/sheet/SheetLayout.tsx",
  "src/styles/dialog-layout.css",
  "src/popover/Popover.tsx",
  "src/popover/Popover.types.ts",
  "src/popover/PopoverContext.ts",
  "src/popover/PopoverTrigger.tsx",
  "src/popover/PopoverContent.tsx",
  "src/popover/PopoverContentSurface.tsx",
  "src/popover/PopoverClose.tsx",
  "src/popover/index.ts",
  "src/styles/popover.css",
  "src/tooltip/Tooltip.tsx",
  "src/tooltip/Tooltip.types.ts",
  "src/tooltip/TooltipContext.ts",
  "src/tooltip/TooltipTrigger.tsx",
  "src/tooltip/TooltipContent.tsx",
  "src/tooltip/TooltipSurface.tsx",
  "src/tooltip/TooltipParts.tsx",
  "src/tooltip/tooltipWarmth.ts",
  "src/tooltip/tooltipPlacement.ts",
  "src/tooltip/index.ts",
  "src/styles/tooltip.css",
  "src/toast/toastStore.ts",
  "src/toast/Toaster.tsx",
  "src/toast/ToastCard.tsx",
  "src/toast/useToastSwipe.ts",
  "src/toast/index.ts",
  "src/styles/toast.css",
  "src/dialog/index.ts",
  "src/card/Card.tsx",
  "src/card/Card.types.ts",
  "src/card/CardLayout.tsx",
  "src/card/CardMedia.tsx",
  "src/card/index.ts",
  "src/styles/card.css",
  "src/styles/card-parts.css",
  "src/theme/color/oklchLightness.ts",
];

const forbiddenFiles = [
  "app/page 2.tsx",
  "README 2.md",
];

describe("project structure", () => {
  it("keeps source files organized by domain", () => {
    const missingFiles = requiredFiles.filter(
      (file) => !existsSync(resolve(file)),
    );

    expect(missingFiles).toEqual([]);
  });

  it("does not contain duplicate files", () => {
    const existingForbiddenFiles = forbiddenFiles.filter((file) =>
      existsSync(resolve(file)),
    );

    expect(existingForbiddenFiles).toEqual([]);
  });

  it("marks the interactive Button as a client component", async () => {
    const source = await readFile(resolve("src/button/Button.tsx"), "utf8");

    expect(source.trimStart().startsWith('"use client";')).toBe(true);
  });
});
