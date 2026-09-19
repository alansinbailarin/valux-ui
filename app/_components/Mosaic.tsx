"use client";

import { SPECIMENS } from "./wall";
import { SpecimenCard } from "./SpecimenCard";

/** The showcase mosaic: every kit component as a live specimen tile, sized
 * on a modular scale (S 180 · M 230 · L 300 · XL 420) so the stagger reads
 * deliberate — proportional to what each tile holds, no empties. */
export function Mosaic() {
  return (
    <div className="mosaic">
      {SPECIMENS.map((spec) => (
        <SpecimenCard key={spec.id} spec={spec}>
          {spec.node}
        </SpecimenCard>
      ))}
    </div>
  );
}
