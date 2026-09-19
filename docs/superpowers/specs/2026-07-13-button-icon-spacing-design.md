# Button Icon Spacing Design

## Goal

Increase the space between Button text and start/end icons without changing loading or unrelated component spacing.

## Design

- Add the internal token `--dk-button-icon-gap`.
- Map it by density: `xs` 0.375rem, `sm` 0.5rem, `md` 0.625rem, and `lg` 0.75rem.
- Set the root/default value to the `md` value, 0.625rem.
- Apply the token only to `.dk-button__content`; loading continues using `--dk-control-gap`.
- Start, end, and combined icon layouts use the same symmetric spacing.

## Verification

- Assert all four density values.
- Assert Button content consumes the icon-specific token.
- Assert loading continues consuming the original control gap.
- Run the complete package and showroom verification.

