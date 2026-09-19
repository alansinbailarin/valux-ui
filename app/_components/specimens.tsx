"use client";

import { BUTTON_SPECIMEN } from "./specimenButton";
import { RADIO_SPECIMEN } from "./specimenRadio";
import { INPUT_SPECIMEN } from "./specimenInput";
import { CARD_SPECIMEN } from "./specimenCardPlayground";
import { SWITCH_SPECIMEN } from "./specimenSwitch";
import { SELECT_SPECIMEN } from "./specimenSelect";
import { CHECKBOX_SPECIMEN } from "./specimenCheckbox";
import { TEXTAREA_SPECIMEN } from "./specimenTextArea";
import type { Specimen } from "./specimenTypes";

export type { Specimen, SpecimenControl, SpecimenValues } from "./specimenTypes";

export const CONTROL_SPECIMENS: Specimen[] = [
  BUTTON_SPECIMEN,
  RADIO_SPECIMEN,
  INPUT_SPECIMEN,
  CARD_SPECIMEN,
  SWITCH_SPECIMEN,
  SELECT_SPECIMEN,
  CHECKBOX_SPECIMEN,
  TEXTAREA_SPECIMEN,
];
