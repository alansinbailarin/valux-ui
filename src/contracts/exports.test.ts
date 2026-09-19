import { describe, expect, it } from "vitest";
import { Button, Card, ValuxProvider } from "../index";
import type {
  ButtonAsAnchorProps,
  ButtonAsButtonProps,
  ButtonColor,
  ButtonProps,
  ButtonVariant,
  CardMediaProps,
  CardProps,
  CardTitleProps,
  CardVariant,
  ValuxColorTheme,
  ValuxDensity,
  ValuxMode,
  ValuxProviderProps,
  ValuxTheme,
} from "../index";

const buttonProps: ButtonProps = { disabled: true };
const loadingButtonProps: ButtonProps = {
  children: "Save",
  loading: true,
  loadingText: "Saving...",
};
const buttonColor: ButtonColor = "danger";
const buttonVariant: ButtonVariant = "ghost";
const anchorProps: ButtonAsAnchorProps = { as: "a", href: "/docs" };
const nativeButtonProps: ButtonAsButtonProps = { type: "submit" };
type NativeButtonHasHref = "href" extends keyof ButtonAsButtonProps
  ? true
  : false;
const nativeButtonHasHref: NativeButtonHasHref = false;
type IconOnlyButton = Extract<ButtonAsButtonProps, { iconOnly: true }>;
type IconOnlyRequiresLabel = IconOnlyButton extends { "aria-label": string }
  ? true
  : false;
const iconOnlyRequiresLabel: IconOnlyRequiresLabel = true;
const colorTheme: ValuxColorTheme = { primary: "#123456" };
const density: ValuxDensity = "md";
const mode: ValuxMode = "system";
const providerProps: ValuxProviderProps = { theme: { mode } };
const theme: ValuxTheme = { color: colorTheme, density };
const cardProps: CardProps = { variant: "elevated" };
const cardVariant: CardVariant = "soft";
const cardMediaProps: CardMediaProps = { ratio: 16 / 9 };
const cardTitleProps: CardTitleProps = { as: "h2" };

describe("public package barrel", () => {
  it("exports the public runtime components", () => {
    expect(Button).toBeDefined();
    expect(ValuxProvider).toBeDefined();
  });

  it("exports the public types", () => {
    expect(buttonProps.disabled).toBe(true);
    expect(loadingButtonProps.loadingText).toBe("Saving...");
    expect(buttonColor).toBe("danger");
    expect(buttonVariant).toBe("ghost");
    expect(anchorProps.href).toBe("/docs");
    expect(nativeButtonProps.type).toBe("submit");
    expect(nativeButtonHasHref).toBe(false);
    expect(iconOnlyRequiresLabel).toBe(true);
    expect(providerProps.theme?.mode).toBe(mode);
    expect(theme).toEqual({ color: colorTheme, density });
  });

  it("exports the Card compound component", () => {
    expect(Card).toBeDefined();
    expect(Card.Media).toBeDefined();
    expect(Card.Header).toBeDefined();
    expect(Card.Title).toBeDefined();
    expect(Card.Subtitle).toBeDefined();
    expect(Card.Body).toBeDefined();
    expect(Card.Footer).toBeDefined();
    expect(cardProps.variant).toBe("elevated");
    expect(cardVariant).toBe("soft");
    expect(cardMediaProps.ratio).toBeCloseTo(16 / 9);
    expect(cardTitleProps.as).toBe("h2");
  });
});
