import type { Block } from "payload";
import { linksField } from "../../fields/link.ts";
import { blockAdmin, blockGroups } from "../shared.ts";

export const Hero: Block = {
  slug: "hero",
  interfaceName: "HeroBlock",
  labels: { singular: "Hero / Seitenkopf", plural: "Heros" },
  admin: blockAdmin("hero", blockGroups.structure, "Großes Bild mit Überschrift und Knöpfen"),
  fields: [
    {
      name: "variant",
      label: "Aufbau",
      type: "select",
      defaultValue: "full",
      required: true,
      options: [
        { value: "full", label: "Foto über die ganze Breite" },
        { value: "split", label: "Text links, Bild rechts" },
        { value: "centered", label: "Zentriert mit dunkler Überlagerung" },
        { value: "page", label: "Seitenkopf (Unterseite)" },
      ],
    },
    { name: "eyebrow", label: "Dachzeile", type: "text" },
    { name: "title", label: "Überschrift", type: "text", required: true },
    { name: "text", label: "Text", type: "textarea" },
    { name: "image", label: "Bild", type: "upload", relationTo: "media" },
    linksField({ maxRows: 2 }),
  ],
};
