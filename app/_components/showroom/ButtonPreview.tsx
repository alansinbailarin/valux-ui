import { Button } from "@/src";

import type { ButtonPreviewProps } from "./showroom.types";
import {
  ShowroomEndIcon,
  ShowroomOnlyIcon,
  ShowroomStartIcon,
} from "./ShowroomIcon";

export function ButtonPreview({
  color,
  content,
  cursor,
  element,
  icons,
  loadingText,
  state,
  variant,
  width,
}: ButtonPreviewProps) {
  const disabled = state === "disabled";
  const loading = state === "loading";
  const fullWidth = width === "full";
  const startIcon =
    icons === "start" || icons === "both" ? <ShowroomStartIcon /> : undefined;
  const endIcon =
    icons === "end" || icons === "both" ? <ShowroomEndIcon /> : undefined;

  if (content === "icon-only") {
    return element === "link" ? (
      <Button
        as="a"
        href="#button-preview"
        aria-label="Continue"
        color={color}
        cursor={cursor}
        disabled={disabled}
        fullWidth={fullWidth}
        iconOnly
        loading={loading}
        variant={variant}
      >
        <ShowroomOnlyIcon />
      </Button>
    ) : (
      <Button
        aria-label="Continue"
        color={color}
        cursor={cursor}
        disabled={disabled}
        fullWidth={fullWidth}
        iconOnly
        loading={loading}
        variant={variant}
      >
        <ShowroomOnlyIcon />
      </Button>
    );
  }

  return element === "link" ? (
    <Button
      as="a"
      href="#button-preview"
      color={color}
      cursor={cursor}
      disabled={disabled}
      endIcon={endIcon}
      fullWidth={fullWidth}
      loading={loading}
      loadingText={loadingText || undefined}
      startIcon={startIcon}
      variant={variant}
    >
      Continue
    </Button>
  ) : (
    <Button
      color={color}
      cursor={cursor}
      disabled={disabled}
      endIcon={endIcon}
      fullWidth={fullWidth}
      loading={loading}
      loadingText={loadingText || undefined}
      startIcon={startIcon}
      variant={variant}
    >
      Continue
    </Button>
  );
}
