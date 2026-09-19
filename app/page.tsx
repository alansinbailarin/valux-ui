import type { CSSProperties } from "react";

import "./cylinder.css";
import "./flow.css";
import "./mosaic.css";
import "./expand.css";
import "./install.css";

import { Mosaic } from "./_components/Mosaic";
import { Toaster } from "@/src";

export const metadata = {
  title: "Valux UI — React components that move like an app",
  description:
    "Accessible React components for Next.js: one theme, one radius, and one motion signature. Panels morph back into the control that opened them.",
};

/** Copies of the line arranged around the drum. Twelve puts a row every 30°,
 * which keeps three readable at once and the rest foreshortening away. */
const ROWS = 12;

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero__stage">
          <div className="flow" aria-hidden="true" />
          <div className="flow flow--b" aria-hidden="true" />
          <div className="hero__bed" aria-hidden="true" />
          {/* The heading carries the name once for assistive tech; the twelve
              painted copies are one object seen from twelve angles, not
              twelve headings. */}
          <h1 className="hero__title" aria-label="Meet Valux">
            <span className="cyl" aria-hidden="true">
              {Array.from({ length: ROWS }, (_, i) => (
                <span
                  key={i}
                  className="cyl__row"
                  style={{ "--i": i } as CSSProperties}
                >
                  Meet Valux
                </span>
              ))}
            </span>
          </h1>
        </div>
      </section>

      
      <section className="install-section">
        <h2 className="install-header">Quick Start</h2>
        <p className="install-desc">Install the library via your package manager.</p>
        
        <div className="install-block">
          <code>npm install valux-ui</code>
        </div>

        <h2 className="install-header">Provider Setup</h2>
        <p className="install-desc">Wrap your app with the <code style={{color: "var(--vx-color-surface-ink)", background: "var(--vx-color-scrim-lower)", padding: "0.2rem 0.4rem", borderRadius: "var(--vx-radius-sm)"}}>ValuxProvider</code> and import the global styles. Your root layout should define the starting <code style={{color: "var(--vx-color-surface-ink)", background: "var(--vx-color-scrim-lower)", padding: "0.2rem 0.4rem", borderRadius: "var(--vx-radius-sm)"}}>data-vx-mode</code> on the HTML tag.</p>
        
        <div className="install-block">
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
      </section>

      <section className="showcase">
        <Mosaic />
      </section>
      <Toaster position="bottom" className="global-toaster" />
    </main>
  );
}
