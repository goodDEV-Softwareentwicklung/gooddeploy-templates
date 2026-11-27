import type { Block } from "payload";
import { linksField } from "../../fields/link.ts";
import { blockAdmin, blockGroups } from "../shared.ts";

export const CallToAction: Block = {
  slug: "cta",
  interfaceName: "CallToActionBlock",
  labels: { singular: "Call-to-Action", plural: "Call-to-Actions" },
  admin: blockAdmin("cta", blockGroups.text, "Farbiges Band mit Aufruf und Knöpfen"),
  fields: [
    { name: "eyebrow", label: "Dachzeile", type: "text" },
    { name: "title", label: "Überschrift", type: "text", required: true },
    { name: "text", label: "Text", type: "textarea" },
    linksField({ maxRows: 2 }),
    {
      name: "tone",
      label: "Farbe",
      type: "select",
      defaultValue: "primary",
      options: [
        { value: "primary", label: "Primärfarbe" },
        { value: "dark", label: "Dunkel" },
        { value: "surface", label: "Hell" },
      ],
    },
  ],
};
