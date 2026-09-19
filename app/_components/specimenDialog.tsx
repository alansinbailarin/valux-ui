/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button, Dialog, Input } from "@/src";
import type { Specimen } from "./specimenTypes";

export const DIALOG_SPECIMEN: Specimen = {
  id: "dialog",
  label: "Dialog",
  snippetName: "Dialog.Content",
  height: 190,
  node: (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button color="primary">Edit profile</Button>
      </Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Header>
          <Dialog.Title>Edit profile</Dialog.Title>
        </Dialog.Header>
      </Dialog.Content>
    </Dialog>
  ),
  description:
    "A modal window that interrupts the user with important content and expects a response. Can act as a contextual flyout or a centered blocking overlay.",
  renderSnippet: (v) => {
    const isAlert = v.alert ? ' alert' : '';
    const surfaceStr = v.surface === "trigger" ? ' surface="trigger"' : '';
    const sizeStr = v.size !== "sm" ? ` size="${v.size}"` : '';
    const placementStr = v.placement !== "trigger" ? ` placement="${v.placement}"` : '';
    const dismissableStr = v.dismissable === false ? ' dismissable={false}' : '';
    
    // Simplest way to get pretty syntax highlighting is a regex tokenizer over the final string!
    // Or just manually output a few segments. Since we're in control:
    const code = `import { Button, Dialog${v.alert ? '' : ', Input'} } from "@valux/ui";

<Dialog>
  <Dialog.Trigger asChild>
    <Button color="${v.alert ? 'danger' : 'primary'}">${v.alert ? 'Delete project' : 'Edit profile'}</Button>
  </Dialog.Trigger>
  <Dialog.Content${sizeStr}${placementStr}${surfaceStr}${isAlert}${dismissableStr}>
    <Dialog.Header>
      <Dialog.Title>${v.alert ? 'Delete project?' : 'Edit profile'}</Dialog.Title>
    </Dialog.Header>
    <Dialog.Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, color: 'color-mix(in srgb, var(--vx-color-on-surface) 60%, transparent)' }}>
            ${v.alert ? "This action cannot be undone. This will permanently delete your project." : "Make changes to your profile here. Click save when you're done."}
          </p>
          ${v.alert ? '' : '<Input label="Name" defaultValue="Jude" />\n          <Input label="Role" defaultValue="Developer" />'}
        </div>
      </Dialog.Body>
    <Dialog.Footer>
      <Dialog.Close asChild>
        <Button variant="soft">Cancel</Button>
      </Dialog.Close>
      <Button color="${v.alert ? 'danger' : 'primary'}">${v.alert ? 'Delete' : 'Save changes'}</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog>`;

    const segs: any[] = [];
    code.split(/([<>={}"])/).forEach(part => {
      if (!part) return;
      if (part === '<' || part === '>' || part === '=' || part === '{' || part === '}') segs.push({ tok: "punc", text: part });
      else if (part === '"') segs.push({ tok: "str", text: part });
      else if (['import', 'from', 'const'].includes(part.trim())) segs.push({ tok: "kw", text: part });
      else if (part.match(/^[A-Z][a-zA-Z.]+$/)) segs.push({ tok: "tag", text: part });
      else if (part.match(/^[a-z]+$/) && !part.includes(' ')) segs.push({ tok: "attr", text: part });
      else segs.push({ tok: "plain", text: part });
    });
    return segs;
  },
  controls: [
    { kind: "options", prop: "size", options: ["sm", "md", "lg", "full"], initial: "sm" },
    { kind: "options", prop: "placement", options: ["trigger", "center"], initial: "trigger" },
    { kind: "options", prop: "surface", options: ["auto", "trigger"], initial: "auto" },
    { kind: "flag", prop: "alert" },
    { kind: "flag", prop: "dismissable", initial: true },
  ],
  render: (v) => {
    // Dialog uses uncontrolled mode for the playground to let users open/close it freely.
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '2rem 0' }}>
        <Dialog>
          <Dialog.Trigger asChild>
            <Button color={v.alert ? "danger" : "primary"}>
              {v.alert ? "Delete project" : "Edit profile"}
            </Button>
          </Dialog.Trigger>
          <Dialog.Content 
            size={v.size as "sm" | "md" | "lg" | "full"}
            placement={v.placement as "trigger" | "center"}
            surface={v.surface as "auto" | "trigger"}
            alert={Boolean(v.alert)}
            dismissable={v.dismissable !== false}
          >
            <Dialog.Header>
              <Dialog.Title>{v.alert ? "Delete project?" : "Edit profile"}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0, color: 'color-mix(in srgb, var(--vx-color-on-surface) 60%, transparent)' }}>
                  {v.alert ? "This action cannot be undone. This will permanently delete your project." : "Make changes to your profile here. Click save when you're done."}
                </p>
                {!v.alert && (
                  <>
                    <Input label="Name" defaultValue="Jude" />
                    <Input label="Role" defaultValue="Developer" />
                  </>
                )}
              </div>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="soft">Cancel</Button>
              </Dialog.Close>
              <Button color={v.alert ? "danger" : "primary"}>
                {v.alert ? "Delete" : "Save changes"}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </div>
    );
  },
};
