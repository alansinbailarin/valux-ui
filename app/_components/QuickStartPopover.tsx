"use client";

import { useState, useRef } from "react";
import { DocumentTextIcon, CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { Popover, Button } from "@/src";

function CopyableBlock({ code, children }: { code: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="expand__code" style={{ marginTop: 0, marginBottom: "1.5rem" }}>
      <pre className="expand__code-pre">
        {children}
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
        {copied ? <CheckIcon style={{width:"1rem", height:"1rem"}} /> : <ClipboardIcon style={{width:"1rem", height:"1rem"}} />}
      </Button>
    </div>
  );
}

export function QuickStartPopover() {
  const installCode = `npm install valux-ui`;
  const providerCode = `import { ValuxProvider } from "valux-ui";
import "valux-ui/styles.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-vx-mode="system">
      <body>
        <ValuxProvider>
          {children}
        </ValuxProvider>
      </body>
    </html>
  );
}`;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <button 
          className="quick-start-trigger"
          aria-label="Quick Start Guide"
        >
          <DocumentTextIcon style={{ width: "1rem", height: "1rem" }} />
        </button>
      </Popover.Trigger>
      
      <Popover.Content 
        side="left" 
        align="end" 
        style={{ width: "min(calc(100vw - 2rem), 32rem)", maxHeight: "calc(100vh - 8rem)", overflowY: "auto", padding: "1.5rem" }}
      >
        <div style={{ margin: 0, padding: 0, maxWidth: "none" }}>
          <h2 className="install-header" style={{ marginTop: 0 }}>Quick Start</h2>
          <p className="install-desc">Install the library via your package manager. <a href="https://www.npmjs.com/package/valux-ui" target="_blank" rel="noreferrer" style={{color: "var(--vx-color-primary)", textDecoration: "underline"}}>View on npm</a></p>
          
          <CopyableBlock code={installCode}>
            <code>npm install valux-ui</code>
          </CopyableBlock>

          <h2 className="install-header">Provider Setup</h2>
          <p className="install-desc">Wrap your app with the <code style={{color: "var(--vx-color-surface-ink)", background: "light-dark(color-mix(in srgb, var(--vx-color-on-surface) 5%, var(--vx-color-surface-base)), color-mix(in srgb, var(--vx-color-on-surface) 8%, var(--vx-color-surface-base)))", padding: "0.2rem 0.4rem", borderRadius: "var(--vx-radius-sm)"}}>ValuxProvider</code> and import the global styles. Your root layout should define the starting <code style={{color: "var(--vx-color-surface-ink)", background: "light-dark(color-mix(in srgb, var(--vx-color-on-surface) 5%, var(--vx-color-surface-base)), color-mix(in srgb, var(--vx-color-on-surface) 8%, var(--vx-color-surface-base)))", padding: "0.2rem 0.4rem", borderRadius: "var(--vx-radius-sm)"}}>data-vx-mode</code> on the HTML tag.</p>
          
          <CopyableBlock code={providerCode}>
            <code style={{ whiteSpace: "pre-wrap" }}>
              <span className="tok-keyword">import</span> {"{"} ValuxProvider {"}"} <span className="tok-keyword">from</span> <span className="tok-string">"valux-ui"</span>;<br />
              <span className="tok-keyword">import</span> <span className="tok-string">"valux-ui/styles.css"</span>;<br />
              <br />
              <span className="tok-keyword">export default function</span> RootLayout({"{"} children {"}"}: {"{"} children: React.ReactNode {"}"}) {"{"}<br />
              &nbsp;&nbsp;<span className="tok-keyword">return</span> (<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="tok-tag">&lt;html</span> <span className="tok-keyword">lang=</span><span className="tok-string">"en"</span> <span className="tok-keyword">data-vx-mode=</span><span className="tok-string">"system"</span><span className="tok-tag">&gt;</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="tok-tag">&lt;body&gt;</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="tok-tag">&lt;ValuxProvider&gt;</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"{"}children{"}"}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="tok-tag">&lt;/ValuxProvider&gt;</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="tok-tag">&lt;/body&gt;</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="tok-tag">&lt;/html&gt;</span><br />
              &nbsp;&nbsp;);<br />
              {"}"}
            </code>
          </CopyableBlock>
        </div>
      </Popover.Content>
    </Popover>
  );
}
