import type { CSSProperties } from "react";

import "./cylinder.css";
import "./flow.css";
import "./mosaic.css";
import "./expand.css";


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

      
      <section className="showcase">
        <Mosaic />
      </section>
      <Toaster position="bottom" className="global-toaster" />
    </main>
  );
}
