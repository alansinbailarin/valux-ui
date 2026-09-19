import { Button } from "@/src";
import type { Specimen } from "./specimenTypes";

import { FaceSmileIcon, ArrowRightIcon } from "@heroicons/react/20/solid";

const SampleIcon = <FaceSmileIcon />;

export const BUTTON_SPECIMEN: Specimen = {
  id: "button",
  label: "Button",
  node: <Button color="primary">Create project</Button>,
  description: "Universally accessible button with motion-rich ripples, clear states, and native support for loading indicators and icons",
  height: 230,
  controls: [
    { kind: "options", prop: "variant", options: ["solid", "soft", "outline", "ghost"], initial: "solid" },
    { kind: "options", prop: "color", options: ["primary", "neutral", "danger", "success", "warning"], initial: "primary" },
    { kind: "options", prop: "size", options: ["sm", "md", "lg"], initial: "md" },
    { kind: "flag", prop: "disabled" },
    { kind: "flag", prop: "loading" },
    { kind: "flag", prop: "fullWidth" },
    { kind: "flag", prop: "startIcon" },
    { kind: "flag", prop: "endIcon" },
    { kind: "flag", prop: "iconOnly" },
  ],
  render: (v) => {
    const isIconOnly = Boolean(v.iconOnly);
    return (
      <div style={{ width: Boolean(v.fullWidth) ? '100%' : 'auto' }}>
        <Button
          variant={v.variant as never}
          color={v.color as never}
          size={v.size as never}
          disabled={Boolean(v.disabled)}
          loading={Boolean(v.loading)}
          fullWidth={Boolean(v.fullWidth)}
          iconOnly={isIconOnly as never}
          startIcon={v.startIcon || isIconOnly ? SampleIcon : undefined}
          endIcon={v.endIcon && !isIconOnly ? SampleIcon : undefined}
          aria-label={isIconOnly ? "Action" : undefined}
        >
          {isIconOnly ? undefined : "Button"}
        </Button>
      </div>
    );
  },
};
