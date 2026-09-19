"use client";

import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { Popover, Button } from "@/src";


export function QuickStartPopover() {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button 
          variant="solid" 
          color="primary" 
          size="lg"
          iconOnly
          className="quick-start-orb"
          aria-label="Quick Start Guide"
        >
          <DocumentTextIcon />
        </Button>
      </Popover.Trigger>
      
      <Popover.Content 
        side="right" 
        align="end" 
        style={{ width: "min(calc(100vw - 2rem), 32rem)", maxHeight: "calc(100vh - 8rem)", overflowY: "auto", padding: "1.5rem" }}
      >
        <div className="install-section" style={{ margin: 0, padding: 0, maxWidth: "none" }}>
          <h2 className="install-header" style={{ marginTop: 0 }}>Quick Start</h2>
          <p className="install-desc">Install the library via your package manager.</p>
          
          <div className="install-block" style={{ marginBottom: "1.5rem" }}>
            <code>npm install valux-ui</code>
          </div>

          <h2 className="install-header">Provider Setup</h2>
          <p className="install-desc">Wrap your app with the <code style={{color: "var(--vx-color-surface-ink)", background: "var(--vx-color-scrim-lower)", padding: "0.2rem 0.4rem", borderRadius: "var(--vx-radius-sm)"}}>ValuxProvider</code> and import the global styles. Your root layout should define the starting <code style={{color: "var(--vx-color-surface-ink)", background: "var(--vx-color-scrim-lower)", padding: "0.2rem 0.4rem", borderRadius: "var(--vx-radius-sm)"}}>data-vx-mode</code> on the HTML tag.</p>
          
          <div className="install-block" style={{ marginBottom: 0 }}>
            <code>
              <span className="tok-keyword">import</span> {"{"} ValuxProvider {"}"} <span className="tok-keyword">from</span> <span className="tok-string">"valux-ui"</span>;<br />
              <span className="tok-keyword">import</span> <span className="tok-string">"valux-ui/dist/styles.css"</span>;<br />
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
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
}
