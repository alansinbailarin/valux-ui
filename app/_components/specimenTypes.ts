import type { ReactNode } from "react";

/** A live-editable prop on a specimen: either a closed set of options or a
 * boolean flag. Deliberately tiny — the playground only needs enough
 * vocabulary to describe the kit's actual prop surfaces. */
export type SpecimenControl =
  | {
      kind: "options";
      prop: string;
      options: readonly string[];
      initial: string;
    }
  | { kind: "flag"; prop: string; initial?: boolean };

export type SpecimenValues = Record<string, string | boolean>;

export interface Specimen {
  id: string;
  label: string;
  /** Tile height — proportional to the component: small control, small
   * card. The spread keeps the masonry ragged. */
  height: number;
  /** The wall-tile still (also the canvas when there are no controls). */
  node: ReactNode;
  /** One kit-voiced sentence for the detail panel. */
  description?: string;
  controls?: readonly SpecimenControl[];
  /** Canvas renderer when controls exist: receives the current values. */
  render?: (values: SpecimenValues) => ReactNode;
  /** Children text for the generated usage line (e.g. "Button"). */
  codeChildren?: string | ((values: SpecimenValues) => string);
  /** Override the component name used in the snippet (e.g. "RadioGroup" instead of "Radio"). */
  snippetName?: string;
  /** Completely override the snippet generator for complex compound components like Dialog. */
  renderSnippet?: (values: SpecimenValues) => CodeSegment[];
}

/** One colored token of the generated snippet. Segments are the single
 * source: the highlighted view AND the clipboard text derive from the same
 * list, so they cannot drift apart. */
export interface CodeSegment {
  tok: "kw" | "tag" | "attr" | "str" | "punc" | "plain";
  text: string;
}

/** The live usage snippet as segments: import line, blank line, and an
 * element whose printed props are only the ones that DIFFER from their
 * initial value — dial everything back and it collapses to the bare tag. */
export function specimenCodeSegments(
  label: string,
  controls: readonly SpecimenControl[],
  values: SpecimenValues,
  children?: string | ((values: SpecimenValues) => string),
  snippetName?: string,
): CodeSegment[] {
  const tagName = snippetName || label;
  const seg = (tok: CodeSegment["tok"], text: string): CodeSegment => ({ tok, text });
  
  const isRadioGroup = snippetName === "RadioGroup";
  const stateHook = isRadioGroup 
    ? [seg("plain", "\n\n"), seg("kw", "const"), seg("plain", " "), seg("punc", "["), seg("plain", "plan"), seg("punc", ", "), seg("plain", "setPlan"), seg("punc", "] "), seg("punc", "= "), seg("plain", "useState"), seg("punc", "("), seg("str", '"pro"'), seg("punc", ");")] 
    : [];

  const imports = isRadioGroup 
    ? [seg("kw", "import"), seg("punc", " { "), seg("tag", "Radio"), seg("punc", ", "), seg("tag", "RadioGroup"), seg("punc", " } "), seg("kw", "from"), seg("str", ' "@valux/ui"'), seg("punc", ";")]
    : [seg("kw", "import"), seg("punc", " { "), seg("tag", tagName), seg("punc", " } "), seg("kw", "from"), seg("str", ' "@valux/ui"'), seg("punc", ";")];

  const out: CodeSegment[] = [
    ...imports,
    ...stateHook,
    seg("plain", "\n\n"), seg("punc", "<"), seg("tag", tagName),
  ];
  for (const control of controls) {
    const value = values[control.prop];
    if (control.kind === "flag") {
      if (value) {
        if (control.prop === "startIcon" || control.prop === "endIcon") {
          out.push(seg("plain", " "), seg("attr", control.prop), seg("punc", "="), seg("punc", "{"), seg("tag", "<Icon />"), seg("punc", "}"));
        } else {
          out.push(seg("plain", " "), seg("attr", control.prop));
        }
      }
    } else if (value !== control.initial) {
      out.push(
        seg("plain", " "), seg("attr", control.prop), seg("punc", "="),
        seg("str", `"${String(value)}"`),
      );
    }
  }

  // Always add controlled props for RadioGroup
  if (isRadioGroup) {
    out.push(seg("plain", " "), seg("attr", "value"), seg("punc", "="), seg("punc", "{"), seg("plain", "plan"), seg("punc", "}"), seg("plain", " "), seg("attr", "onValueChange"), seg("punc", "="), seg("punc", "{"), seg("plain", "setPlan"), seg("punc", "}"));
  }

  const resolvedChildren = typeof children === "function" ? children(values) : children;
  if (resolvedChildren) {
    out.push(
      seg("punc", ">"), seg("plain", resolvedChildren),
      seg("punc", "</"), seg("tag", tagName), seg("punc", ">"),
    );
  } else {
    out.push(seg("punc", " />"));
  }
  return out;
}

export function specimenCode(segments: CodeSegment[]): string {
  return segments.map((segment) => segment.text).join("");
}

export function initialValues(
  controls: readonly SpecimenControl[],
): SpecimenValues {
  const values: SpecimenValues = {};
  for (const control of controls) {
    values[control.prop] =
      control.kind === "flag" ? (control.initial ?? false) : control.initial;
  }
  return values;
}
