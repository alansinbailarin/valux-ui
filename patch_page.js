const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

code = code.replace('import "./expand.css";', 'import "./expand.css";\nimport "./install.css";');

const installSection = `
      <section className="install-section">
        <h2 className="install-header">Quick Start</h2>
        <p className="install-desc">Install the library and its peer dependencies via your package manager.</p>
        
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

      <section className="showcase">`;

code = code.replace('<section className="showcase">', installSection);

fs.writeFileSync('app/page.tsx', code);
