"use client";

import { useRef, useState } from "react";

import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";

import { Button } from "@/src";

import { specimenCode, specimenCodeSegments } from "./specimenTypes";
import type { Specimen, SpecimenValues } from "./specimenTypes";

/** The living usage snippet: colored from the SAME segments the clipboard
 * text derives from (one source, nothing to drift), with a quiet copy
 * circle that confirms itself for a beat. */
export function CodeBlock({
  spec,
  values,
}: {
  spec: Specimen;
  values: SpecimenValues;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const segments = spec.renderSnippet 
    ? spec.renderSnippet(values)
    : specimenCodeSegments(
        spec.label,
        spec.controls ?? [],
        values,
        spec.codeChildren,
        spec.snippetName,
      );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(specimenCode(segments));
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard can be denied; the code is selectable either way */
    }
  };

  return (
    <div className="expand__code">
      <pre className="expand__code-pre">
        {segments.map((segment, i) => (
          <span key={i} className={`tok-${segment.tok}`}>
            {segment.text}
          </span>
        ))}
      </pre>
      <Button
        variant="soft"
        size="sm"
        iconOnly
        aria-label={copied ? "Copied" : "Copy code"}
        className="expand__copy"
        style={{ borderRadius: 999 }}
        onClick={copy}
      >
        {copied ? <CheckIcon /> : <ClipboardIcon />}
      </Button>
    </div>
  );
}
