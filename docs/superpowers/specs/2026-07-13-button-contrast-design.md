# Button Contrast Design

## Goal

Make every Button color role visually consistent and accessible while preserving consumer-selected brand colors.

## Design

- Preserve the configured primary as the accent used by outline, soft, and ghost.
- Derive a separate solid primary when a chromatic mid-tone needs slight darkening to support white text at WCAG AA contrast.
- Keep genuinely light primaries unchanged and pair them with dark text.
- Give danger separate accent and solid tokens so dark mode can use a light red foreground with a dark red solid background and white text.
- Reduce outline border intensity from 66% to 40% of its semantic accent.
- Force `cursor: not-allowed` for disabled and loading buttons and links, overriding the optional cursor prop.

## Testing

- Unit-test contrast resolution for purple, light yellow, dark colors, explicit overrides, and unsupported CSS colors.
- Test Provider output for the original accent, derived solid tone, and foreground.
- Test stylesheet contracts for danger and outline roles.
- Test cursor precedence for disabled and loading element branches.

